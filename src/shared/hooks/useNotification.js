// src/shared/hooks/useNotification.js
import { useCallback } from 'react';
import { useGlobalState } from '../context/GlobalStateProvider';

const useNotification = () => {
  const { dispatch, ActionTypes } = useGlobalState();

  const showNotification = useCallback((message, type = 'info', duration = 5000) => {
    const notification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      type,
      timestamp: new Date(),
      duration
    };

    dispatch({
      type: ActionTypes.ADD_NOTIFICATION,
      payload: notification
    });

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        dispatch({
          type: ActionTypes.REMOVE_NOTIFICATION,
          payload: notification.id
        });
      }, duration);
    }

    return notification.id;
  }, [dispatch, ActionTypes]);

  const removeNotification = useCallback((id) => {
    dispatch({
      type: ActionTypes.REMOVE_NOTIFICATION,
      payload: id
    });
  }, [dispatch, ActionTypes]);

  const showSuccess = useCallback((message, duration) => {
    return showNotification(message, 'success', duration);
  }, [showNotification]);

  const showError = useCallback((message, duration) => {
    return showNotification(message, 'error', duration);
  }, [showNotification]);

  const showWarning = useCallback((message, duration) => {
    return showNotification(message, 'warning', duration);
  }, [showNotification]);

  const showInfo = useCallback((message, duration) => {
    return showNotification(message, 'info', duration);
  }, [showNotification]);

  return {
    showNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useNotification;