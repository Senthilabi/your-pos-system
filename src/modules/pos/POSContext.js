import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useGlobalState } from '../../../shared/context/GlobalStateProvider';
import { useEventBus } from '../../../shared/services/EventBusService';
import { useNotification } from '../../../shared/hooks';

const POSContext = createContext();

const initialState = {
  cart: [],
  selectedCustomer: null,
  paymentMethod: 'cash',
  discounts: [],
  subtotal: 0,
  taxAmount: 0,
  discountAmount: 0,
  total: 0,
  currentTransaction: null,
  isProcessingPayment: false,
  receiptData: null,
  showReceipt: false
};

const posReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItemIndex = state.cart.findIndex(item => item.id === action.payload.id);
      
      if (existingItemIndex >= 0) {
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1
        };
        return { ...state, cart: updatedCart };
      }
      
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1, discount: 0 }]
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
        selectedCustomer: null,
        discounts: [],
        paymentMethod: 'cash'
      };

    case 'SET_CUSTOMER':
      return { ...state, selectedCustomer: action.payload };

    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };

    case 'ADD_DISCOUNT':
      return {
        ...state,
        discounts: [...state.discounts, action.payload]
      };

    case 'REMOVE_DISCOUNT':
      return {
        ...state,
        discounts: state.discounts.filter(d => d.id !== action.payload)
      };

    case 'UPDATE_TOTALS':
      return {
        ...state,
        subtotal: action.payload.subtotal,
        taxAmount: action.payload.taxAmount,
        discountAmount: action.payload.discountAmount,
        total: action.payload.total
      };

    case 'SET_PROCESSING_PAYMENT':
      return { ...state, isProcessingPayment: action.payload };

    case 'SET_RECEIPT_DATA':
      return { ...state, receiptData: action.payload, showReceipt: true };

    case 'HIDE_RECEIPT':
      return { ...state, showReceipt: false };

    default:
      return state;
  }
};

export const POSProvider = ({ children }) => {
  const [state, dispatch] = useReducer(posReducer, initialState);
  const { state: globalState } = useGlobalState();
  const { emit } = useEventBus();
  const { showSuccess, showError } = useNotification();

  // Calculate totals whenever cart or discounts change
  useEffect(() => {
    const calculateTotals = () => {
      const subtotal = state.cart.reduce((sum, item) => {
        return sum + (item.price * item.quantity) - item.discount;
      }, 0);

      const globalDiscountAmount = state.discounts.reduce((sum, discount) => {
        if (discount.type === 'percentage') {
          return sum + (subtotal * discount.value / 100);
        } else {
          return sum + discount.value;
        }
      }, 0);

      const discountAmount = state.cart.reduce((sum, item) => sum + item.discount, 0) + globalDiscountAmount;
      
      const taxableAmount = subtotal - globalDiscountAmount;
      const taxAmount = globalState.settings.tax.enabled ? 
        (taxableAmount * globalState.settings.tax.rate) : 0;
      
      const total = subtotal - discountAmount + taxAmount;

      dispatch({
        type: 'UPDATE_TOTALS',
        payload: {
          subtotal: Math.max(0, subtotal),
          taxAmount: Math.max(0, taxAmount),
          discountAmount: Math.max(0, discountAmount),
          total: Math.max(0, total)
        }
      });
    };

    calculateTotals();
  }, [state.cart, state.discounts, globalState.settings.tax]);

  const addToCart = (product) => {
    if (product.stock <= 0) {
      showError('Product is out of stock');
      return;
    }

    // Check if adding would exceed stock
    const existingItem = state.cart.find(item => item.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    
    if (currentQuantity + 1 > product.stock) {
      showError('Not enough stock available');
      return;
    }

    dispatch({ type: 'ADD_TO_CART', payload: product });
    showSuccess(`${product.name} added to cart`);
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    showSuccess('Item removed from cart');
  };

  const updateCartItem = (productId, updates) => {
    const item = state.cart.find(item => item.id === productId);
    if (!item) return;

    // Check stock limits for quantity updates
    if (updates.quantity && updates.quantity > item.stock) {
      showError('Not enough stock available');
      return;
    }

    if (updates.quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    dispatch({
      type: 'UPDATE_CART_ITEM',
      payload: { id: productId, updates }
    });
  };

  const selectCustomer = (customer) => {
    dispatch({ type: 'SET_CUSTOMER', payload: customer });
    if (customer) {
      showSuccess(`Customer ${customer.name} selected`);
    }
  };

  const setPaymentMethod = (method) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });
  };

  const applyDiscount = (discount) => {
    const discountId = `discount-${Date.now()}`;
    dispatch({
      type: 'ADD_DISCOUNT',
      payload: { ...discount, id: discountId }
    });
    showSuccess('Discount applied');
  };

  const removeDiscount = (discountId) => {
    dispatch({ type: 'REMOVE_DISCOUNT', payload: discountId });
    showSuccess('Discount removed');
  };

  const processPayment = async () => {
    if (state.cart.length === 0) {
      showError('Cart is empty');
      return;
    }

    if (state.total <= 0) {
      showError('Invalid transaction total');
      return;
    }

    dispatch({ type: 'SET_PROCESSING_PAYMENT', payload: true });

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const transaction = {
        id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        transactionNumber: `TXN-${Date.now()}`,
        customerId: state.selectedCustomer?.id || null,
        items: state.cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          discount: item.discount,
          total: (item.price * item.quantity) - item.discount
        })),
        subtotal: state.subtotal,
        taxAmount: state.taxAmount,
        discountAmount: state.discountAmount,
        total: state.total,
        paymentMethod: state.paymentMethod,
        status: 'completed',
        cashierId: globalState.currentUser?.id || 'unknown',
        timestamp: new Date(),
        receiptNumber: `RCP-${Date.now()}`
      };

      // Update inventory
      for (const item of state.cart) {
        const product = globalState.products.find(p => p.id === item.id);
        if (product) {
          emit('inventory:updated', {
            productId: item.id,
            newStock: product.stock - item.quantity,
            reason: 'sale'
          });
        }
      }

      // Award loyalty points
      if (state.selectedCustomer && globalState.settings.loyalty.enabled) {
        const pointsEarned = Math.floor(state.total * globalState.settings.loyalty.pointsPerDollar);
        emit('customer:loyalty_points_awarded', {
          customerId: state.selectedCustomer.id,
          points: pointsEarned,
          transactionId: transaction.id
        });
      }

      // Emit transaction completed event
      emit('transaction:completed', transaction);

      // Generate receipt
      dispatch({
        type: 'SET_RECEIPT_DATA',
        payload: {
          transaction,
          customer: state.selectedCustomer,
          company: globalState.settings.company,
          printedAt: new Date()
        }
      });

      // Clear cart
      dispatch({ type: 'CLEAR_CART' });

      showSuccess('Payment processed successfully!');

    } catch (error) {
      showError('Payment processing failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      dispatch({ type: 'SET_PROCESSING_PAYMENT', payload: false });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    showSuccess('Cart cleared');
  };

  return (
    <POSContext.Provider value={{
      state,
      dispatch,
      addToCart,
      removeFromCart,
      updateCartItem,
      selectCustomer,
      setPaymentMethod,
      applyDiscount,
      removeDiscount,
      processPayment,
      clearCart
    }}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
