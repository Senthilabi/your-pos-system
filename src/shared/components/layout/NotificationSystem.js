// src/shared/components/layout/NotificationSystem.js
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useGlobalState } from '../../context/GlobalStateProvider';
import { Alert } from '../ui';

const NotificationSystem = () => {
  const { state, dispatch, ActionTypes } = useGlobalState();
  const { notifications } = state;

  const removeNotification = (id) => {
    dispatch({
      type: ActionTypes.REMOVE_NOTIFICATION,
      payload: id
    });
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="transform transition-all duration-300 ease-in-out"
        >
          <Alert
            type={notification.type}
            dismissible={true}
            onDismiss={() => removeNotification(notification.id)}
            className="shadow-lg"
          >
            {notification.message}
          </Alert>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
