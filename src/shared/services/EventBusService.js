// src/shared/services/EventBusService.js
class EventBusService {
  constructor() {
    this.events = {};
    this.eventHistory = [];
    this.maxHistorySize = 1000;
    this.isLogging = process.env.NODE_ENV === 'development';
  }

  // Subscribe to an event
  on(eventName, callback, options = {}) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    const subscription = {
      callback,
      once: options.once || false,
      priority: options.priority || 0,
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Insert based on priority (higher priority first)
    let inserted = false;
    for (let i = 0; i < this.events[eventName].length; i++) {
      if (this.events[eventName][i].priority < subscription.priority) {
        this.events[eventName].splice(i, 0, subscription);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      this.events[eventName].push(subscription);
    }

    if (this.isLogging) {
      console.log(`EventBus: Subscribed to '${eventName}'`, { subscriptionId: subscription.id });
    }

    // Return unsubscribe function
    return () => this.off(eventName, subscription.id);
  }

  // Subscribe to an event once
  once(eventName, callback, options = {}) {
    return this.on(eventName, callback, { ...options, once: true });
  }

  // Unsubscribe from an event
  off(eventName, callbackOrId) {
    if (!this.events[eventName]) return false;

    let removed = false;

    if (typeof callbackOrId === 'string') {
      // Remove by subscription ID
      this.events[eventName] = this.events[eventName].filter(sub => {
        if (sub.id === callbackOrId) {
          removed = true;
          return false;
        }
        return true;
      });
    } else if (typeof callbackOrId === 'function') {
      // Remove by callback function
      this.events[eventName] = this.events[eventName].filter(sub => {
        if (sub.callback === callbackOrId) {
          removed = true;
          return false;
        }
        return true;
      });
    }

    if (removed && this.isLogging) {
      console.log(`EventBus: Unsubscribed from '${eventName}'`);
    }

    return removed;
  }

  // Emit an event
  emit(eventName, data, options = {}) {
    const event = {
      name: eventName,
      data: data,
      timestamp: new Date(),
      source: options.source || 'unknown',
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Add to history
    this.addToHistory(event);

    if (this.isLogging) {
      console.log(`EventBus: Emitting '${eventName}'`, { event });
    }

    if (!this.events[eventName]) {
      if (this.isLogging) {
        console.warn(`EventBus: No subscribers for '${eventName}'`);
      }
      return false;
    }

    const subscribers = [...this.events[eventName]]; // Create copy to avoid issues with modifications during iteration
    let processedCount = 0;
    const errors = [];

    subscribers.forEach((subscription, index) => {
      try {
        subscription.callback(data, event);
        processedCount++;

        // Remove if it's a once subscription
        if (subscription.once) {
          this.off(eventName, subscription.id);
        }
      } catch (error) {
        errors.push({
          subscriptionIndex: index,
          subscriptionId: subscription.id,
          error: error.message
        });

        if (this.isLogging) {
          console.error(`EventBus: Error in subscriber for '${eventName}':`, error);
        }
      }
    });

    if (errors.length > 0) {
      console.warn(`EventBus: ${errors.length} subscriber errors for '${eventName}':`, errors);
    }

    return {
      eventId: event.id,
      subscribersNotified: processedCount,
      errors: errors
    };
  }

  // Emit event asynchronously
  async emitAsync(eventName, data, options = {}) {
    const event = {
      name: eventName,
      data: data,
      timestamp: new Date(),
      source: options.source || 'unknown',
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.addToHistory(event);

    if (this.isLogging) {
      console.log(`EventBus: Emitting async '${eventName}'`, { event });
    }

    if (!this.events[eventName]) {
      return { eventId: event.id, subscribersNotified: 0, errors: [] };
    }

    const subscribers = [...this.events[eventName]];
    const promises = [];
    const errors = [];

    subscribers.forEach((subscription, index) => {
      const promise = new Promise(async (resolve) => {
        try {
          const result = subscription.callback(data, event);
          
          // Handle both sync and async callbacks
          if (result instanceof Promise) {
            await result;
          }
          
          resolve({ success: true, subscriptionId: subscription.id });

          // Remove if it's a once subscription
          if (subscription.once) {
            this.off(eventName, subscription.id);
          }
        } catch (error) {
          errors.push({
            subscriptionIndex: index,
            subscriptionId: subscription.id,
            error: error.message
          });
          resolve({ success: false, error: error.message });
        }
      });

      promises.push(promise);
    });

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.success).length;

    if (errors.length > 0 && this.isLogging) {
      console.warn(`EventBus: ${errors.length} async subscriber errors for '${eventName}':`, errors);
    }

    return {
      eventId: event.id,
      subscribersNotified: successCount,
      errors: errors
    };
  }

  // Add event to history
  addToHistory(event) {
    this.eventHistory.unshift(event);

    // Limit history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(0, this.maxHistorySize);
    }
  }

  // Get event history
  getHistory(eventName = null, limit = 50) {
    let history = this.eventHistory;

    if (eventName) {
      history = history.filter(event => event.name === eventName);
    }

    return history.slice(0, limit);
  }

  // Get all active subscribers
  getSubscribers(eventName = null) {
    if (eventName) {
      return {
        [eventName]: this.events[eventName] ? this.events[eventName].length : 0
      };
    }

    const subscribers = {};
    for (const [event, subs] of Object.entries(this.events)) {
      subscribers[event] = subs.length;
    }

    return subscribers;
  }

  // Clear all subscribers for an event
  clearEvent(eventName) {
    if (this.events[eventName]) {
      const count = this.events[eventName].length;
      delete this.events[eventName];
      
      if (this.isLogging) {
        console.log(`EventBus: Cleared ${count} subscribers for '${eventName}'`);
      }
      
      return count;
    }
    return 0;
  }

  // Clear all events
  clearAll() {
    const eventCount = Object.keys(this.events).length;
    this.events = {};
    this.eventHistory = [];
    
    if (this.isLogging) {
      console.log(`EventBus: Cleared all events (${eventCount} event types)`);
    }
    
    return eventCount;
  }

  // Get statistics
  getStats() {
    const eventNames = Object.keys(this.events);
    let totalSubscribers = 0;

    const eventStats = {};
    eventNames.forEach(eventName => {
      const subCount = this.events[eventName].length;
      totalSubscribers += subCount;
      eventStats[eventName] = subCount;
    });

    return {
      totalEventTypes: eventNames.length,
      totalSubscribers: totalSubscribers,
      historySize: this.eventHistory.length,
      maxHistorySize: this.maxHistorySize,
      eventStats: eventStats,
      lastEvent: this.eventHistory[0] || null
    };
  }

  // Enable/disable logging
  setLogging(enabled) {
    this.isLogging = enabled;
  }
}

// Create singleton instance
const EventBus = new EventBusService();

// React hook for using EventBus in components
import { useEffect, useRef } from 'react';

export const useEventBus = () => {
  const subscriptionsRef = useRef([]);

  const subscribe = (eventName, callback, options = {}) => {
    const unsubscribe = EventBus.on(eventName, callback, options);
    subscriptionsRef.current.push(unsubscribe);
    return unsubscribe;
  };

  const subscribeOnce = (eventName, callback, options = {}) => {
    const unsubscribe = EventBus.once(eventName, callback, options);
    subscriptionsRef.current.push(unsubscribe);
    return unsubscribe;
  };

  const emit = (eventName, data, options = {}) => {
    return EventBus.emit(eventName, data, options);
  };

  const emitAsync = async (eventName, data, options = {}) => {
    return EventBus.emitAsync(eventName, data, options);
  };

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      subscriptionsRef.current = [];
    };
  }, []);

  return {
    on: subscribe,
    once: subscribeOnce,
    emit,
    emitAsync,
    getStats: () => EventBus.getStats(),
    getHistory: (eventName, limit) => EventBus.getHistory(eventName, limit)
  };
};

// Predefined event names for type safety and consistency
export const EventNames = {
  // Transaction events
  TRANSACTION_STARTED: 'transaction:started',
  TRANSACTION_COMPLETED: 'transaction:completed',
  TRANSACTION_CANCELLED: 'transaction:cancelled',
  TRANSACTION_REFUNDED: 'transaction:refunded',

  // Product events
  PRODUCT_CREATED: 'product:created',
  PRODUCT_UPDATED: 'product:updated',
  PRODUCT_DELETED: 'product:deleted',
  PRODUCT_STOCK_LOW: 'product:stock_low',
  PRODUCT_OUT_OF_STOCK: 'product:out_of_stock',

  // Customer events
  CUSTOMER_CREATED: 'customer:created',
  CUSTOMER_UPDATED: 'customer:updated',
  CUSTOMER_DELETED: 'customer:deleted',
  CUSTOMER_LOYALTY_POINTS_AWARDED: 'customer:loyalty_points_awarded',
  CUSTOMER_LOYALTY_POINTS_REDEEMED: 'customer:loyalty_points_redeemed',
  CUSTOMER_TIER_CHANGED: 'customer:tier_changed',

  // Inventory events
  INVENTORY_UPDATED: 'inventory:updated',
  INVENTORY_LOW_STOCK_ALERT: 'inventory:low_stock_alert',
  INVENTORY_REORDER_NEEDED: 'inventory:reorder_needed',

  // System events
  SYSTEM_ONLINE: 'system:online',
  SYSTEM_OFFLINE: 'system:offline',
  SYSTEM_ERROR: 'system:error',
  SYSTEM_BACKUP_COMPLETED: 'system:backup_completed',
  SYSTEM_SYNC_STARTED: 'system:sync_started',
  SYSTEM_SYNC_COMPLETED: 'system:sync_completed',

  // User events
  USER_LOGGED_IN: 'user:logged_in',
  USER_LOGGED_OUT: 'user:logged_out',
  USER_CREATED: 'user:created',
  USER_UPDATED: 'user:updated',

  // UI events
  UI_NOTIFICATION: 'ui:notification',
  UI_MODAL_OPEN: 'ui:modal_open',
  UI_MODAL_CLOSE: 'ui:modal_close',
  UI_PAGE_CHANGED: 'ui:page_changed'
};

// Event data validation helpers
export const validateEventData = {
  transaction: (data) => {
    if (!data.id || !data.total || !data.items) {
      throw new Error('Invalid transaction data: missing required fields');
    }
  },
  
  product: (data) => {
    if (!data.id || !data.name || data.price === undefined) {
      throw new Error('Invalid product data: missing required fields');
    }
  },
  
  customer: (data) => {
    if (!data.id || !data.name) {
      throw new Error('Invalid customer data: missing required fields');
    }
  }
};

export default EventBus;