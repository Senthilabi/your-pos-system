// src/shared/hooks/useApi.js
import { useState, useCallback } from 'react';
import DatabaseService from '../services/DatabaseService';
import { useGlobalState } from '../context/GlobalStateProvider';
import { useEventBus } from '../services/EventBusService';

const useApi = (storeName) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { dispatch, ActionTypes } = useGlobalState();
  const { emit } = useEventBus();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error, operation) => {
    const errorMessage = `${operation} failed: ${error.message}`;
    setError(errorMessage);
    console.error(errorMessage, error);
    
    emit('system:error', {
      operation,
      storeName,
      error: errorMessage,
      timestamp: new Date()
    });
  }, [storeName, emit]);

  // Generic CRUD operations
  const create = useCallback(async (data) => {
    setLoading(true);
    clearError();
    
    try {
      const newItem = {
        ...data,
        id: data.id || `${storeName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await DatabaseService.add(storeName, newItem);
      
      // Update global state based on store type
      const actionType = `ADD_${storeName.toUpperCase().slice(0, -1)}`;
      if (ActionTypes[actionType]) {
        dispatch({ type: ActionTypes[actionType], payload: newItem });
      }
      
      emit(`${storeName.slice(0, -1)}:created`, newItem);
      return newItem;
    } catch (error) {
      handleError(error, 'Create');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [storeName, dispatch, ActionTypes, emit, clearError, handleError]);

  const getById = useCallback(async (id) => {
    setLoading(true);
    clearError();
    
    try {
      const item = await DatabaseService.get(storeName, id);
      return item;
    } catch (error) {
      handleError(error, 'Get');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [storeName, clearError, handleError]);

  const getAll = useCallback(async (limit) => {
    setLoading(true);
    clearError();
    
    try {
      const items = await DatabaseService.getAll(storeName, limit);
      
      // Update global state
      const actionType = `SET_${storeName.toUpperCase()}`;
      if (ActionTypes[actionType]) {
        dispatch({ type: ActionTypes[actionType], payload: items });
      }
      
      return items;
    } catch (error) {
      handleError(error, 'Get All');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [storeName, dispatch, ActionTypes, clearError, handleError]);

  const update = useCallback(async (id, updates) => {
    setLoading(true);
    clearError();
    
    try {
      const currentItem = await DatabaseService.get(storeName, id);
      const updatedItem = {
        ...currentItem,
        ...updates,
        id,
        updatedAt: new Date()
      };
      
      await DatabaseService.update(storeName, updatedItem);
      
      // Update global state
      const actionType = `UPDATE_${storeName.toUpperCase().slice(0, -1)}`;
      if (ActionTypes[actionType]) {
        dispatch({ type: ActionTypes[actionType], payload: updatedItem });
      }
      
      emit(`${storeName.slice(0, -1)}:updated`, updatedItem);
      return updatedItem;
    } catch (error) {
      handleError(error, 'Update');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [storeName, dispatch, ActionTypes, emit, clearError, handleError]);

  const remove = useCallback(async (id) => {
    setLoading(true);
    clearError();
    
    try {
      await DatabaseService.delete(storeName, id);
      
      // Update global state
      const actionType = `DELETE_${storeName.toUpperCase().slice(0, -1)}`;
      if (ActionTypes[actionType]) {
        dispatch({ type: ActionTypes[actionType], payload: id });
      }
      
      emit(`${storeName.slice(0, -1)}:deleted`, id);
      return true;
    } catch (error) {
      handleError(error, 'Delete');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [storeName, dispatch, ActionTypes, emit, clearError, handleError]);

  const search = useCallback(async (indexName, value, exact = false) => {
    setLoading(true);
    clearError();
    
    try {
      const results = await DatabaseService.search(storeName, indexName, value, exact);
      return results;
    } catch (error) {
      handleError(error, 'Search');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [storeName, clearError, handleError]);

  const bulkUpdate = useCallback(async (items) => {
    setLoading(true);
    clearError();
    
    try {
      const updatedItems = items.map(item => ({
        ...item,
        updatedAt: new Date()
      }));
      
      await DatabaseService.updateAll(storeName, updatedItems);
      
      // Update global state
      const actionType = `SET_${storeName.toUpperCase()}`;
      if (ActionTypes[actionType]) {
        dispatch({ type: ActionTypes[actionType], payload: updatedItems });
      }
      
      emit(`${storeName}:bulk_updated`, updatedItems);
      return updatedItems;
    } catch (error) {
      handleError(error, 'Bulk Update');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [storeName, dispatch, ActionTypes, emit, clearError, handleError]);

  return {
    loading,
    error,
    clearError,
    create,
    getById,
    getAll,
    update,
    remove,
    search,
    bulkUpdate
  };
};

export default useApi;
