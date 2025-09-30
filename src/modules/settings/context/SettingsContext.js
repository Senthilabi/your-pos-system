import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useGlobalState } from '../../../shared/context/GlobalStateProvider';
import { useEventBus } from '../../../shared/services/EventBusService';
import { useNotification } from '../../../shared/hooks';
import DatabaseService from '../../../shared/services/DatabaseService';

const SettingsContext = createContext();

const initialState = {
  activeSection: 'general',
  isLoading: false,
  users: [],
  systemLogs: [],
  backupHistory: [],
  integrations: {
    email: { enabled: false, configured: false },
    sms: { enabled: false, configured: false },
    payment: { enabled: false, configured: false },
    accounting: { enabled: false, configured: false }
  }
};

const settingsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USERS':
      return { ...state, users: action.payload };
    
    case 'SET_SYSTEM_LOGS':
      return { ...state, systemLogs: action.payload };
    
    case 'SET_BACKUP_HISTORY':
      return { ...state, backupHistory: action.payload };
    
    case 'UPDATE_INTEGRATIONS':
      return { 
        ...state, 
        integrations: { ...state.integrations, ...action.payload }
      };
    
    default:
      return state;
  }
};

export const SettingsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const { state: globalState, dispatch: globalDispatch, ActionTypes } = useGlobalState();
  const { emit } = useEventBus();
  const { showSuccess, showError } = useNotification();

  // Initialize settings data
  useEffect(() => {
    loadUsers();
    loadSystemLogs();
    loadBackupHistory();
  }, []);

  const loadUsers = async () => {
    try {
      // For now, use demo users - in production this would come from a backend
      const demoUsers = [
        {
          id: 'user-1',
          username: 'admin',
          email: 'admin@business.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: true,
          lastLogin: new Date(),
          createdAt: new Date(),
          permissions: ['*']
        },
        {
          id: 'user-2',
          username: 'manager',
          email: 'manager@business.com',
          firstName: 'Store',
          lastName: 'Manager',
          role: 'manager',
          isActive: true,
          lastLogin: new Date(Date.now() - 86400000), // Yesterday
          createdAt: new Date(),
          permissions: ['pos:*', 'inventory:*', 'customers:*', 'reports:read']
        },
        {
          id: 'user-3',
          username: 'cashier1',
          email: 'cashier1@business.com',
          firstName: 'John',
          lastName: 'Cashier',
          role: 'cashier',
          isActive: true,
          lastLogin: new Date(Date.now() - 3600000), // 1 hour ago
          createdAt: new Date(),
          permissions: ['pos:read', 'pos:create_transaction', 'customers:read']
        }
      ];
      
      dispatch({ type: 'SET_USERS', payload: demoUsers });
    } catch (error) {
      showError('Failed to load users');
    }
  };

  const loadSystemLogs = async () => {
    try {
      // Demo system logs
      const demoLogs = [
        {
          id: 'log-1',
          timestamp: new Date(),
          level: 'info',
          category: 'transaction',
          message: 'Transaction completed successfully',
          userId: 'user-3',
          details: { transactionId: 'txn-123', amount: 45.99 }
        },
        {
          id: 'log-2',
          timestamp: new Date(Date.now() - 300000),
          level: 'warning',
          category: 'inventory',
          message: 'Low stock alert triggered',
          userId: 'system',
          details: { productId: 'prod-1', stock: 3 }
        },
        {
          id: 'log-3',
          timestamp: new Date(Date.now() - 600000),
          level: 'info',
          category: 'user',
          message: 'User logged in',
          userId: 'user-2',
          details: { loginMethod: 'username' }
        }
      ];
      
      dispatch({ type: 'SET_SYSTEM_LOGS', payload: demoLogs });
    } catch (error) {
      showError('Failed to load system logs');
    }
  };

  const loadBackupHistory = async () => {
    try {
      const demoBackups = [
        {
          id: 'backup-1',
          timestamp: new Date(),
          type: 'automatic',
          size: '2.4 MB',
          status: 'completed',
          duration: '00:01:23'
        },
        {
          id: 'backup-2',
          timestamp: new Date(Date.now() - 86400000),
          type: 'manual',
          size: '2.3 MB',
          status: 'completed',
          duration: '00:01:15'
        }
      ];
      
      dispatch({ type: 'SET_BACKUP_HISTORY', payload: demoBackups });
    } catch (error) {
      showError('Failed to load backup history');
    }
  };

  const updateCompanySettings = async (settings) => {
    try {
      const updatedSettings = {
        ...globalState.settings,
        company: { ...globalState.settings.company, ...settings }
      };

      globalDispatch({
        type: ActionTypes.UPDATE_SETTINGS,
        payload: updatedSettings
      });

      emit('settings:updated', { section: 'company', changes: settings });
      showSuccess('Company settings updated successfully');
    } catch (error) {
      showError('Failed to update company settings');
    }
  };

  const updateTaxSettings = async (taxSettings) => {
    try {
      const updatedSettings = {
        ...globalState.settings,
        tax: { ...globalState.settings.tax, ...taxSettings }
      };

      globalDispatch({
        type: ActionTypes.UPDATE_SETTINGS,
        payload: updatedSettings
      });

      emit('settings:updated', { section: 'tax', changes: taxSettings });
      showSuccess('Tax settings updated successfully');
    } catch (error) {
      showError('Failed to update tax settings');
    }
  };

  const updateReceiptSettings = async (receiptSettings) => {
    try {
      const updatedSettings = {
        ...globalState.settings,
        receipt: { ...globalState.settings.receipt, ...receiptSettings }
      };

      globalDispatch({
        type: ActionTypes.UPDATE_SETTINGS,
        payload: updatedSettings
      });

      emit('settings:updated', { section: 'receipt', changes: receiptSettings });
      showSuccess('Receipt settings updated successfully');
    } catch (error) {
      showError('Failed to update receipt settings');
    }
  };

  const updateLoyaltySettings = async (loyaltySettings) => {
    try {
      const updatedSettings = {
        ...globalState.settings,
        loyalty: { ...globalState.settings.loyalty, ...loyaltySettings }
      };

      globalDispatch({
        type: ActionTypes.UPDATE_SETTINGS,
        payload: updatedSettings
      });

      emit('settings:updated', { section: 'loyalty', changes: loyaltySettings });
      showSuccess('Loyalty settings updated successfully');
    } catch (error) {
      showError('Failed to update loyalty settings');
    }
  };

  const createUser = async (userData) => {
    try {
      const newUser = {
        ...userData,
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isActive: true,
        createdAt: new Date(),
        lastLogin: null
      };

      const updatedUsers = [...state.users, newUser];
      dispatch({ type: 'SET_USERS', payload: updatedUsers });

      emit('user:created', newUser);
      showSuccess(`User "${newUser.username}" created successfully`);
      return newUser;
    } catch (error) {
      showError('Failed to create user');
      throw error;
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const updatedUsers = state.users.map(user =>
        user.id === userId ? { ...user, ...updates } : user
      );

      dispatch({ type: 'SET_USERS', payload: updatedUsers });

      const updatedUser = updatedUsers.find(u => u.id === userId);
      emit('user:updated', updatedUser);
      showSuccess('User updated successfully');
      return updatedUser;
    } catch (error) {
      showError('Failed to update user');
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      const user = state.users.find(u => u.id === userId);
      const updatedUsers = state.users.filter(u => u.id !== userId);

      dispatch({ type: 'SET_USERS', payload: updatedUsers });

      emit('user:deleted', userId);
      showSuccess(`User "${user.username}" deleted successfully`);
    } catch (error) {
      showError('Failed to delete user');
      throw error;
    }
  };

  const createBackup = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const backupData = await DatabaseService.exportData();
      const backupBlob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
      
      // Create download link
      const url = window.URL.createObjectURL(backupBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pos-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Add to backup history
      const newBackup = {
        id: `backup-${Date.now()}`,
        timestamp: new Date(),
        type: 'manual',
        size: `${(backupBlob.size / 1024 / 1024).toFixed(1)} MB`,
        status: 'completed',
        duration: '00:02:00'
      };

      dispatch({ 
        type: 'SET_BACKUP_HISTORY', 
        payload: [newBackup, ...state.backupHistory] 
      });

      emit('backup:created', newBackup);
      showSuccess('Backup created and downloaded successfully');
    } catch (error) {
      showError('Failed to create backup');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const restoreBackup = async (backupFile) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(backupFile);
      });

      const backupData = JSON.parse(fileContent);
      
      // Validate backup data structure
      if (!backupData.data || !backupData.version) {
        throw new Error('Invalid backup file format');
      }

      // Restore data
      await DatabaseService.importData(backupData);
      
      // Refresh the application state
      window.location.reload();

      showSuccess('Backup restored successfully. Application will refresh.');
    } catch (error) {
      showError(`Failed to restore backup: ${error.message}`);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setActiveSection = (section) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
  };

  return (
    <SettingsContext.Provider value={{
      state,
      globalSettings: globalState.settings,
      setActiveSection,
      updateCompanySettings,
      updateTaxSettings,
      updateReceiptSettings,
      updateLoyaltySettings,
      createUser,
      updateUser,
      deleteUser,
      createBackup,
      restoreBackup
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
