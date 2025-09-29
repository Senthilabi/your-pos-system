import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useGlobalState } from '../../../shared/context/GlobalStateProvider';
import { useEventBus } from '../../../shared/services/EventBusService';
import { useNotification } from '../../../shared/hooks';

const InventoryContext = createContext();

const initialState = {
  products: [],
  categories: [],
  suppliers: [],
  selectedProduct: null,
  filters: {
    category: '',
    supplier: '',
    stockLevel: 'all', // all, inStock, lowStock, outOfStock
    searchTerm: ''
  },
  sortBy: 'name',
  sortOrder: 'asc',
  view: 'grid', // grid, list
  showProductModal: false,
  showCategoryModal: false,
  showSupplierModal: false,
  showStockModal: false,
  editingItem: null
};

const inventoryReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    
    case 'SET_SUPPLIERS':
      return { ...state, suppliers: action.payload };
    
    case 'SET_SELECTED_PRODUCT':
      return { ...state, selectedProduct: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case 'SET_SORT':
      return { ...state, sortBy: action.payload.sortBy, sortOrder: action.payload.sortOrder };
    
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    
    case 'SHOW_MODAL':
      return { ...state, [`show${action.payload}Modal`]: true, editingItem: action.editingItem || null };
    
    case 'HIDE_MODAL':
      return { ...state, [`show${action.payload}Modal`]: false, editingItem: null };
    
    default:
      return state;
  }
};

export const InventoryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);
  const { state: globalState, dispatch: globalDispatch, ActionTypes } = useGlobalState();
  const { emit, on } = useEventBus();
  const { showSuccess, showError, showWarning } = useNotification();

  // Update local state when global state changes
  useEffect(() => {
    dispatch({ type: 'SET_PRODUCTS', payload: globalState.products });
  }, [globalState.products]);

  // Listen to inventory events
  useEffect(() => {
    const unsubscribeInventoryUpdate = on('inventory:updated', (data) => {
      updateProductStock(data.productId, data.newStock);
    });

    const unsubscribeTransactionCompleted = on('transaction:completed', (transaction) => {
      // Update stock levels for sold items
      transaction.items.forEach(item => {
        const product = globalState.products.find(p => p.id === item.productId);
        if (product) {
          const newStock = product.stock - item.quantity;
          updateProductStock(item.productId, newStock);
          
          // Check for low stock alerts
          if (newStock <= product.reorderLevel && newStock > 0) {
            showWarning(`${product.name} is running low (${newStock} left)`);
            emit('inventory:low_stock_alert', {
              productId: product.id,
              productName: product.name,
              currentStock: newStock,
              reorderLevel: product.reorderLevel
            });
          } else if (newStock <= 0) {
            showError(`${product.name} is out of stock`);
            emit('product:out_of_stock', {
              productId: product.id,
              productName: product.name
            });
          }
        }
      });
    });

    return () => {
      unsubscribeInventoryUpdate();
      unsubscribeTransactionCompleted();
    };
  }, [globalState.products, emit, on, showWarning, showError]);

  const updateProductStock = (productId, newStock) => {
    const updatedProducts = globalState.products.map(product =>
      product.id === productId
        ? { ...product, stock: Math.max(0, newStock), updatedAt: new Date() }
        : product
    );
    
    globalDispatch({
      type: ActionTypes.SET_PRODUCTS,
      payload: updatedProducts
    });
  };

  const createProduct = async (productData) => {
    try {
      const newProduct = {
        ...productData,
        id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sku: productData.sku || `SKU-${Date.now()}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedProducts = [...globalState.products, newProduct];
      globalDispatch({
        type: ActionTypes.SET_PRODUCTS,
        payload: updatedProducts
      });

      emit('product:created', newProduct);
      showSuccess(`Product "${newProduct.name}" created successfully`);
      
      return newProduct;
    } catch (error) {
      showError('Failed to create product');
      throw error;
    }
  };

  const updateProduct = async (productId, updates) => {
    try {
      const updatedProducts = globalState.products.map(product =>
        product.id === productId
          ? { ...product, ...updates, updatedAt: new Date() }
          : product
      );

      globalDispatch({
        type: ActionTypes.SET_PRODUCTS,
        payload: updatedProducts
      });

      const updatedProduct = updatedProducts.find(p => p.id === productId);
      emit('product:updated', updatedProduct);
      showSuccess('Product updated successfully');
      
      return updatedProduct;
    } catch (error) {
      showError('Failed to update product');
      throw error;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const product = globalState.products.find(p => p.id === productId);
      const updatedProducts = globalState.products.filter(p => p.id !== productId);

      globalDispatch({
        type: ActionTypes.SET_PRODUCTS,
        payload: updatedProducts
      });

      emit('product:deleted', productId);
      showSuccess(`Product "${product.name}" deleted successfully`);
    } catch (error) {
      showError('Failed to delete product');
      throw error;
    }
  };

  const adjustStock = async (productId, adjustment, reason = '') => {
    try {
      const product = globalState.products.find(p => p.id === productId);
      if (!product) throw new Error('Product not found');

      const newStock = Math.max(0, product.stock + adjustment);
      await updateProductStock(productId, newStock);

      emit('stock:adjusted', {
        productId,
        productName: product.name,
        adjustment,
        newStock,
        reason,
        timestamp: new Date()
      });

      showSuccess(`Stock adjusted for "${product.name}"`);
    } catch (error) {
      showError('Failed to adjust stock');
      throw error;
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

  const showModal = (modalType, editingItem = null) => {
    dispatch({ type: 'SHOW_MODAL', payload: modalType, editingItem });
  };

  const hideModal = (modalType) => {
    dispatch({ type: 'HIDE_MODAL', payload: modalType });
  };

  return (
    <InventoryContext.Provider value={{
      state,
      createProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      setFilters,
      setSort,
      setView,
      showModal,
      hideModal
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
