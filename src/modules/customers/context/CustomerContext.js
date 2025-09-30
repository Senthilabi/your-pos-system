// src/modules/customers/context/CustomerContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useGlobalState } from '../../../shared/context/GlobalStateProvider';
import { useEventBus } from '../../../shared/services/EventBusService';
import { useNotification } from '../../../shared/hooks';

const CustomerContext = createContext();

const initialState = {
  customers: [],
  selectedCustomer: null,
  filters: {
    searchTerm: '',
    tier: '',
    status: 'active'
  },
  sortBy: 'name',
  sortOrder: 'asc',
  view: 'grid',
  showCustomerModal: false,
  showLoyaltyModal: false,
  editingCustomer: null,
  loyaltyStats: {
    totalCustomers: 0,
    totalPoints: 0,
    tierDistribution: {}
  }
};

const customerReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    
    case 'SET_SELECTED_CUSTOMER':
      return { ...state, selectedCustomer: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case 'SET_SORT':
      return { ...state, sortBy: action.payload.sortBy, sortOrder: action.payload.sortOrder };
    
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    
    case 'SHOW_MODAL':
      return { 
        ...state, 
        [`show${action.payload}Modal`]: true, 
        editingCustomer: action.editingCustomer || null 
      };
    
    case 'HIDE_MODAL':
      return { 
        ...state, 
        [`show${action.payload}Modal`]: false, 
        editingCustomer: null 
      };
    
    case 'UPDATE_LOYALTY_STATS':
      return { ...state, loyaltyStats: action.payload };
    
    default:
      return state;
  }
};

export const CustomerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(customerReducer, initialState);
  const { state: globalState, dispatch: globalDispatch, ActionTypes } = useGlobalState();
  const { emit, on } = useEventBus();
  const { showSuccess, showError } = useNotification();

  // Update local state when global state changes
  useEffect(() => {
    dispatch({ type: 'SET_CUSTOMERS', payload: globalState.customers });
    updateLoyaltyStats(globalState.customers);
  }, [globalState.customers]);

  // Listen to customer events
  useEffect(() => {
    const unsubscribeLoyaltyAwarded = on('customer:loyalty_points_awarded', (data) => {
      updateCustomerPoints(data.customerId, data.points, 'earned');
    });

    const unsubscribeLoyaltyRedeemed = on('customer:loyalty_points_redeemed', (data) => {
      updateCustomerPoints(data.customerId, -data.points, 'redeemed');
    });

    const unsubscribeTransactionCompleted = on('transaction:completed', (transaction) => {
      if (transaction.customerId) {
        updateCustomerStats(transaction.customerId, transaction);
      }
    });

    return () => {
      unsubscribeLoyaltyAwarded();
      unsubscribeLoyaltyRedeemed();
      unsubscribeTransactionCompleted();
    };
  }, [globalState.customers, emit, on]);

  const updateLoyaltyStats = (customers) => {
    const stats = {
      totalCustomers: customers.length,
      totalPoints: customers.reduce((sum, c) => sum + (c.points || 0), 0),
      tierDistribution: customers.reduce((acc, c) => {
        const tier = c.tier || 'Bronze';
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {})
    };
    
    dispatch({ type: 'UPDATE_LOYALTY_STATS', payload: stats });
  };

  const updateCustomerPoints = (customerId, pointsChange, type) => {
    const updatedCustomers = globalState.customers.map(customer => {
      if (customer.id === customerId) {
        const newPoints = Math.max(0, (customer.points || 0) + pointsChange);
        const newTier = calculateTier(newPoints);
        
        return {
          ...customer,
          points: newPoints,
          tier: newTier,
          lastActivity: new Date(),
          updatedAt: new Date()
        };
      }
      return customer;
    });

    globalDispatch({
      type: ActionTypes.SET_CUSTOMERS,
      payload: updatedCustomers
    });

    const customer = updatedCustomers.find(c => c.id === customerId);
    if (type === 'earned') {
      showSuccess(`${pointsChange} points awarded to ${customer.name}`);
    } else {
      showSuccess(`${Math.abs(pointsChange)} points redeemed by ${customer.name}`);
    }
  };

  const updateCustomerStats = (customerId, transaction) => {
    const updatedCustomers = globalState.customers.map(customer => {
      if (customer.id === customerId) {
        const newTotalSpent = (customer.totalSpent || 0) + transaction.total;
        const newTotalOrders = (customer.totalOrders || 0) + 1;
        const newAvgOrderValue = newTotalSpent / newTotalOrders;

        return {
          ...customer,
          totalSpent: newTotalSpent,
          totalOrders: newTotalOrders,
          avgOrderValue: newAvgOrderValue,
          lastVisit: new Date(),
          updatedAt: new Date()
        };
      }
      return customer;
    });

    globalDispatch({
      type: ActionTypes.SET_CUSTOMERS,
      payload: updatedCustomers
    });
  };

  const calculateTier = (points) => {
    if (points >= 1000) return 'VIP';
    if (points >= 500) return 'Gold';
    if (points >= 200) return 'Silver';
    return 'Bronze';
  };

  const createCustomer = async (customerData) => {
    try {
      const newCustomer = {
        ...customerData,
        id: `cust-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerNumber: `CUST-${Date.now()}`,
        points: 0,
        totalSpent: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        tier: 'Bronze',
        isActive: true,
        firstVisit: new Date(),
        lastVisit: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedCustomers = [...globalState.customers, newCustomer];
      globalDispatch({
        type: ActionTypes.SET_CUSTOMERS,
        payload: updatedCustomers
      });

      emit('customer:created', newCustomer);
      showSuccess(`Customer "${newCustomer.name}" created successfully`);
      
      return newCustomer;
    } catch (error) {
      showError('Failed to create customer');
      throw error;
    }
  };

  const updateCustomer = async (customerId, updates) => {
    try {
      const updatedCustomers = globalState.customers.map(customer =>
        customer.id === customerId
          ? { ...customer, ...updates, updatedAt: new Date() }
          : customer
      );

      globalDispatch({
        type: ActionTypes.SET_CUSTOMERS,
        payload: updatedCustomers
      });

      const updatedCustomer = updatedCustomers.find(c => c.id === customerId);
      emit('customer:updated', updatedCustomer);
      showSuccess('Customer updated successfully');
      
      return updatedCustomer;
    } catch (error) {
      showError('Failed to update customer');
      throw error;
    }
  };

  const deleteCustomer = async (customerId) => {
    try {
      const customer = globalState.customers.find(c => c.id === customerId);
      const updatedCustomers = globalState.customers.filter(c => c.id !== customerId);

      globalDispatch({
        type: ActionTypes.SET_CUSTOMERS,
        payload: updatedCustomers
      });

      emit('customer:deleted', customerId);
      showSuccess(`Customer "${customer.name}" deleted successfully`);
    } catch (error) {
      showError('Failed to delete customer');
      throw error;
    }
  };

  const awardLoyaltyPoints = (customerId, points, reason = '') => {
    updateCustomerPoints(customerId, points, 'earned');
    emit('customer:loyalty_points_awarded', {
      customerId,
      points,
      reason,
      timestamp: new Date()
    });
  };

  const redeemLoyaltyPoints = (customerId, points, reward = '') => {
    const customer = globalState.customers.find(c => c.id === customerId);
    if (customer && customer.points >= points) {
      updateCustomerPoints(customerId, -points, 'redeemed');
      emit('customer:loyalty_points_redeemed', {
        customerId,
        points,
        reward,
        timestamp: new Date()
      });
      return true;
    } else {
      showError('Insufficient loyalty points');
      return false;
    }
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setSort = (sortBy, sortOrder) => {
    dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder } });
  };

  const setView = (view) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  };

  const showModal = (modalType, editingCustomer = null) => {
    dispatch({ type: 'SHOW_MODAL', payload: modalType, editingCustomer });
  };

  const hideModal = (modalType) => {
    dispatch({ type: 'HIDE_MODAL', payload: modalType });
  };

  const selectCustomer = (customer) => {
    dispatch({ type: 'SET_SELECTED_CUSTOMER', payload: customer });
  };

  return (
    <CustomerContext.Provider value={{
      state,
      createCustomer,
      updateCustomer,
      deleteCustomer,
      awardLoyaltyPoints,
      redeemLoyaltyPoints,
      setFilters,
      setSort,
      setView,
      showModal,
      hideModal,
      selectCustomer
    }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};
