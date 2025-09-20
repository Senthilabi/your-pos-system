// src/shared/context/GlobalStateProvider.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { DatabaseService } from '../services/DatabaseService';
import { SyncService } from '../services/SyncService';

// Initial state structure
const initialState = {
  // Core business data
  products: [],
  customers: [],
  transactions: [],
  users: [],
  categories: [],
  suppliers: [],
  
  // System state
  currentUser: null,
  currentLocation: null,
  isOnline: navigator.onLine,
  isLoading: false,
  notifications: [],
  
  // Settings
  settings: {
    company: {
      name: 'Your Business',
      address: '',
      phone: '',
      email: '',
      taxId: '',
      currency: 'USD',
      timezone: 'UTC'
    },
    tax: {
      enabled: true,
      rate: 0.10,
      inclusive: false
    },
    receipt: {
      headerText: '',
      footerText: 'Thank you for your business!',
      showLogo: true,
      printAutomatically: false
    },
    loyalty: {
      enabled: true,
      pointsPerDollar: 1,
      rewardThreshold: 100
    }
  },
  
  // Module states
  pos: {
    cart: [],
    selectedCustomer: null,
    paymentMethod: 'cash',
    discounts: [],
    currentTransaction: null,
    isProcessingPayment: false
  },
  
  inventory: {
    filters: {
      category: '',
      supplier: '',
      stockLevel: 'all'
    },
    sortBy: 'name',
    sortOrder: 'asc',
    view: 'grid'
  },
  
  customers: {
    selectedSegment: 'all',
    filters: {
      tier: '',
      status: 'active'
    }
  },
  
  reports: {
    dateRange: {
      start: new Date(new Date().setHours(0,0,0,0)),
      end: new Date(new Date().setHours(23,59,59,999))
    },
    selectedReport: 'sales-summary'
  }
};

// Action types
const ActionTypes = {
  // Data actions
  SET_PRODUCTS: 'SET_PRODUCTS',
  ADD_PRODUCT: 'ADD_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  
  SET_CUSTOMERS: 'SET_CUSTOMERS',
  ADD_CUSTOMER: 'ADD_CUSTOMER',
  UPDATE_CUSTOMER: 'UPDATE_CUSTOMER',
  DELETE_CUSTOMER: 'DELETE_CUSTOMER',
  
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  
  // System actions
  SET_LOADING: 'SET_LOADING',
  SET_ONLINE_STATUS: 'SET_ONLINE_STATUS',
  SET_CURRENT_USER: 'SET_CURRENT_USER',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  
  // Settings actions
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  
  // POS actions
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SELECT_CUSTOMER: 'SELECT_CUSTOMER',
  SET_PAYMENT_METHOD: 'SET_PAYMENT_METHOD',
  
  // UI actions
  UPDATE_FILTERS: 'UPDATE_FILTERS',
  SET_VIEW: 'SET_VIEW',
  SET_DATE_RANGE: 'SET_DATE_RANGE'
};

// Reducer function
const globalReducer = (state, action) => {
  switch (action.type) {
    // Product actions
    case ActionTypes.SET_PRODUCTS:
      return { ...state, products: action.payload };
    
    case ActionTypes.ADD_PRODUCT:
      return { ...state, products: [...state.products, action.payload] };
    
    case ActionTypes.UPDATE_PRODUCT:
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id ? action.payload : product
        )
      };
    
    case ActionTypes.DELETE_PRODUCT:
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      };
    
    // Customer actions
    case ActionTypes.SET_CUSTOMERS:
      return { ...state, customers: action.payload };
    
    case ActionTypes.ADD_CUSTOMER:
      return { ...state, customers: [...state.customers, action.payload] };
    
    case ActionTypes.UPDATE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.payload.id ? action.payload : customer
        )
      };
    
    // Transaction actions
    case ActionTypes.ADD_TRANSACTION:
      return { ...state, transactions: [...state.transactions, action.payload] };
    
    // System actions
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ActionTypes.SET_ONLINE_STATUS:
      return { ...state, isOnline: action.payload };
    
    case ActionTypes.SET_CURRENT_USER:
      return { ...state, currentUser: action.payload };
    
    case ActionTypes.ADD_NOTIFICATION:
      return { ...state, notifications: [...state.notifications, action.payload] };
    
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    // Settings actions
    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    // POS actions
    case ActionTypes.ADD_TO_CART:
      const existingItem = state.pos.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          pos: {
            ...state.pos,
            cart: state.pos.cart.map(item =>
              item.id === action.payload.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          }
        };
      }
      return {
        ...state,
        pos: {
          ...state.pos,
          cart: [...state.pos.cart, { ...action.payload, quantity: 1 }]
        }
      };
    
    case ActionTypes.REMOVE_FROM_CART:
      return {
        ...state,
        pos: {
          ...state.pos,
          cart: state.pos.cart.filter(item => item.id !== action.payload)
        }
      };
    
    case ActionTypes.UPDATE_CART_ITEM:
      return {
        ...state,
        pos: {
          ...state.pos,
          cart: state.pos.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, ...action.payload.updates }
              : item
          )
        }
      };
    
    case ActionTypes.CLEAR_CART:
      return {
        ...state,
        pos: { ...state.pos, cart: [], selectedCustomer: null }
      };
    
    case ActionTypes.SELECT_CUSTOMER:
      return {
        ...state,
        pos: { ...state.pos, selectedCustomer: action.payload }
      };
    
    case ActionTypes.SET_PAYMENT_METHOD:
      return {
        ...state,
        pos: { ...state.pos, paymentMethod: action.payload }
      };
    
    default:
      return state;
  }
};

// Context
const GlobalStateContext = createContext();

// Provider component
export const GlobalStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);
  
  // Initialize database and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        
        // Initialize database
        await DatabaseService.init();
        
        // Load existing data
        const products = await DatabaseService.getAll('products');
        const customers = await DatabaseService.getAll('customers');
        const transactions = await DatabaseService.getAll('transactions');
        const settings = await DatabaseService.get('settings', 'app-config');
        
        dispatch({ type: ActionTypes.SET_PRODUCTS, payload: products || [] });
        dispatch({ type: ActionTypes.SET_CUSTOMERS, payload: customers || [] });
        if (settings) {
          dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: settings.data });
        }
        
        // Load demo data if empty
        if (!products || products.length === 0) {
          await loadDemoData();
        }
        
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    };
    
    const loadDemoData = async () => {
      const demoProducts = [
        {
          id: 'prod-1',
          name: 'Premium Coffee Beans',
          sku: 'COFFEE-001',
          barcode: '1234567890123',
          price: 24.99,
          cost: 12.50,
          stock: 50,
          reorderLevel: 10,
          category: 'Beverages',
          description: 'High-quality arabica coffee beans',
          image: '☕',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'prod-2',
          name: 'Organic Green Tea',
          sku: 'TEA-001',
          barcode: '1234567890124',
          price: 18.99,
          cost: 9.50,
          stock: 30,
          reorderLevel: 5,
          category: 'Beverages',
          description: 'Organic green tea leaves',
          image: '🍃',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'prod-3',
          name: 'Artisan Chocolate',
          sku: 'CHOC-001',
          barcode: '1234567890125',
          price: 8.99,
          cost: 4.50,
          stock: 75,
          reorderLevel: 15,
          category: 'Confectionery',
          description: 'Handcrafted dark chocolate',
          image: '🍫',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      for (const product of demoProducts) {
        await DatabaseService.add('products', product);
      }
      
      dispatch({ type: ActionTypes.SET_PRODUCTS, payload: demoProducts });
    };
    
    initializeApp();
  }, []);
  
  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => dispatch({ type: ActionTypes.SET_ONLINE_STATUS, payload: true });
    const handleOffline = () => dispatch({ type: ActionTypes.SET_ONLINE_STATUS, payload: false });
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Auto-save important data changes
  useEffect(() => {
    if (state.products.length > 0) {
      DatabaseService.updateAll('products', state.products);
    }
  }, [state.products]);
  
  useEffect(() => {
    if (state.customers.length > 0) {
      DatabaseService.updateAll('customers', state.customers);
    }
  }, [state.customers]);
  
  useEffect(() => {
    DatabaseService.update('settings', {
      key: 'app-config',
      data: state.settings,
      updatedAt: new Date()
    });
  }, [state.settings]);
  
  return (
    <GlobalStateContext.Provider value={{ state, dispatch, ActionTypes }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Custom hook to use global state
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};

export { ActionTypes };