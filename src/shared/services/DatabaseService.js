// src/shared/services/DatabaseService.js
class DatabaseService {
  constructor() {
    this.dbName = 'pos-system-db';
    this.version = 1;
    this.db = null;
  }

  // Initialize database with schema
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Products store
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('sku', 'sku', { unique: true });
          productStore.createIndex('barcode', 'barcode', { unique: false });
          productStore.createIndex('category', 'category', { unique: false });
          productStore.createIndex('name', 'name', { unique: false });
        }

        // Customers store
        if (!db.objectStoreNames.contains('customers')) {
          const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
          customerStore.createIndex('email', 'email', { unique: false });
          customerStore.createIndex('phone', 'phone', { unique: false });
          customerStore.createIndex('customerNumber', 'customerNumber', { unique: true });
        }

        // Transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('customerId', 'customerId', { unique: false });
          transactionStore.createIndex('timestamp', 'timestamp', { unique: false });
          transactionStore.createIndex('status', 'status', { unique: false });
          transactionStore.createIndex('cashierId', 'cashierId', { unique: false });
        }

        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { keyPath: 'id' });
          categoryStore.createIndex('name', 'name', { unique: true });
        }

        // Suppliers store
        if (!db.objectStoreNames.contains('suppliers')) {
          const supplierStore = db.createObjectStore('suppliers', { keyPath: 'id' });
          supplierStore.createIndex('name', 'name', { unique: false });
          supplierStore.createIndex('email', 'email', { unique: false });
        }

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('username', 'username', { unique: true });
          userStore.createIndex('email', 'email', { unique: true });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Sync queue for offline operations
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('status', 'status', { unique: false });
        }

        console.log('Database schema created successfully');
      };
    });
  }

  // Generic add method
  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.add({
        ...data,
        createdAt: data.createdAt || new Date(),
        updatedAt: new Date()
      });

      request.onsuccess = () => {
        resolve(data);
      };

      request.onerror = () => {
        reject(new Error(`Failed to add data to ${storeName}: ${request.error}`));
      };
    });
  }

  // Generic get method
  async get(storeName, id) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get data from ${storeName}: ${request.error}`));
      };
    });
  }

  // Generic getAll method
  async getAll(storeName, limit = null) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = limit ? store.getAll(null, limit) : store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get all data from ${storeName}: ${request.error}`));
      };
    });
  }

  // Generic update method
  async update(storeName, data) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.put({
        ...data,
        updatedAt: new Date()
      });

      request.onsuccess = () => {
        resolve(data);
      };

      request.onerror = () => {
        reject(new Error(`Failed to update data in ${storeName}: ${request.error}`));
      };
    });
  }

  // Generic delete method
  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error(`Failed to delete data from ${storeName}: ${request.error}`));
      };
    });
  }

  // Bulk update method for better performance
  async updateAll(storeName, dataArray) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      let completed = 0;
      const total = dataArray.length;

      if (total === 0) {
        resolve([]);
        return;
      }

      const errors = [];

      dataArray.forEach((data, index) => {
        const request = store.put({
          ...data,
          updatedAt: new Date()
        });

        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            if (errors.length > 0) {
              reject(new Error(`Some updates failed: ${errors.join(', ')}`));
            } else {
              resolve(dataArray);
            }
          }
        };

        request.onerror = () => {
          errors.push(`Index ${index}: ${request.error}`);
          completed++;
          if (completed === total) {
            reject(new Error(`Bulk update failed: ${errors.join(', ')}`));
          }
        };
      });
    });
  }

  // Search method with index support
  async search(storeName, indexName, value, exact = true) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      if (indexName && store.indexNames.contains(indexName)) {
        const index = store.index(indexName);
        const request = exact ? index.getAll(value) : index.getAll();
        
        request.onsuccess = () => {
          let results = request.result || [];
          
          if (!exact && value) {
            results = results.filter(item => 
              item[indexName] && 
              item[indexName].toString().toLowerCase().includes(value.toLowerCase())
            );
          }
          
          resolve(results);
        };
      } else {
        // Fallback to full table scan
        const request = store.getAll();
        
        request.onsuccess = () => {
          let results = request.result || [];
          
          if (value && indexName) {
            results = results.filter(item => 
              item[indexName] && 
              item[indexName].toString().toLowerCase().includes(value.toLowerCase())
            );
          }
          
          resolve(results);
        };
      }

      transaction.onerror = () => {
        reject(new Error(`Search failed in ${storeName}: ${transaction.error}`));
      };
    });
  }

  // Clear all data from a store
  async clear(storeName) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error(`Failed to clear ${storeName}: ${request.error}`));
      };
    });
  }

  // Get count of records in a store
  async count(storeName) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error(`Failed to count records in ${storeName}: ${request.error}`));
      };
    });
  }

  // Export data for backup
  async exportData() {
    try {
      const data = {};
      const storeNames = ['products', 'customers', 'transactions', 'categories', 'suppliers', 'users', 'settings'];
      
      for (const storeName of storeNames) {
        data[storeName] = await this.getAll(storeName);
      }
      
      return {
        version: this.version,
        timestamp: new Date(),
        data: data
      };
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  // Import data for restore
  async importData(exportedData) {
    try {
      if (!exportedData.data) {
        throw new Error('Invalid backup data format');
      }

      for (const [storeName, records] of Object.entries(exportedData.data)) {
        if (Array.isArray(records)) {
          // Clear existing data
          await this.clear(storeName);
          
          // Import new data
          for (const record of records) {
            await this.add(storeName, record);
          }
        }
      }

      return true;
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  // Add to sync queue for offline operations
  async addToSyncQueue(operation, storeName, data) {
    const queueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: operation,
      storeName: storeName,
      data: data,
      timestamp: new Date(),
      status: 'pending',
      retryCount: 0
    };

    return this.add('syncQueue', queueItem);
  }

  // Get pending sync operations
  async getPendingSyncOperations() {
    return this.search('syncQueue', 'status', 'pending');
  }

  // Mark sync operation as completed
  async markSyncCompleted(syncId) {
    const syncItem = await this.get('syncQueue', syncId);
    if (syncItem) {
      syncItem.status = 'completed';
      syncItem.completedAt = new Date();
      return this.update('syncQueue', syncItem);
    }
  }

  // Database health check
  async healthCheck() {
    try {
      const stats = {};
      const storeNames = ['products', 'customers', 'transactions', 'categories', 'suppliers', 'users'];
      
      for (const storeName of storeNames) {
        stats[storeName] = await this.count(storeName);
      }
      
      stats.isHealthy = true;
      stats.lastCheck = new Date();
      
      return stats;
    } catch (error) {
      return {
        isHealthy: false,
        error: error.message,
        lastCheck: new Date()
      };
    }
  }
}

// Create singleton instance
const databaseServiceInstance = new DatabaseService();
export default databaseServiceInstance;