// src/shared/hooks/usePermissions.js
import { useMemo } from 'react';
import { useGlobalState } from '../context/GlobalStateProvider';

const usePermissions = () => {
  const { state } = useGlobalState();
  const { currentUser } = state;

  const permissions = useMemo(() => {
    if (!currentUser) return {};

    const userPermissions = currentUser.permissions || [];
    const role = currentUser.role;

    // Role-based permissions
    const rolePermissions = {
      admin: ['*'], // All permissions
      manager: [
        'pos:*',
        'inventory:*',
        'customers:*',
        'reports:read',
        'settings:read'
      ],
      cashier: [
        'pos:read',
        'pos:create_transaction',
        'customers:read',
        'customers:create'
      ],
      viewer: [
        'pos:read',
        'inventory:read',
        'customers:read',
        'reports:read'
      ]
    };

    const allPermissions = [
      ...userPermissions,
      ...(rolePermissions[role] || [])
    ];

    return allPermissions;
  }, [currentUser]);

  const hasPermission = useCallback((permission) => {
    if (!currentUser) return false;
    
    // Admin has all permissions
    if (permissions.includes('*')) return true;
    
    // Check exact permission
    if (permissions.includes(permission)) return true;
    
    // Check wildcard permissions
    const [module, action] = permission.split(':');
    if (permissions.includes(`${module}:*`)) return true;
    
    return false;
  }, [permissions, currentUser]);

  const hasRole = useCallback((role) => {
    return currentUser?.role === role;
  }, [currentUser]);

  const hasAnyRole = useCallback((roles) => {
    return roles.includes(currentUser?.role);
  }, [currentUser]);

  const canAccess = useCallback((module) => {
    return hasPermission(`${module}:read`) || hasPermission(`${module}:*`);
  }, [hasPermission]);

  const canModify = useCallback((module) => {
    return hasPermission(`${module}:create`) || 
           hasPermission(`${module}:update`) || 
           hasPermission(`${module}:delete`) ||
           hasPermission(`${module}:*`);
  }, [hasPermission]);

  return {
    permissions,
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccess,
    canModify,
    currentUser,
    isLoggedIn: !!currentUser
  };
};

export default usePermissions;


import { useMemo } from 'react';
import { useGlobalState } from '../context/GlobalStateProvider';

const usePermissions = () => {
  const { state } = useGlobalState();
  const currentUser = getCurrentUser(); // Helper to get current user

  const permissions = useMemo(() => {
    if (!currentUser) return [];

    const userPermissions = currentUser.permissions || [];
    const role = currentUser.role;

    // Role-based permissions
    const rolePermissions = {
      admin: ['*'], // All permissions
      manager: [
        'pos:*',
        'inventory:*',
        'customers:*',
        'reports:read',
        'reports:export',
        'settings:read'
      ],
      cashier: [
        'pos:read',
        'pos:create_transaction',
        'customers:read',
        'customers:create'
      ],
      viewer: [
        'pos:read',
        'inventory:read',
        'customers:read',
        'reports:read'
      ]
    };

    const allPermissions = [
      ...userPermissions,
      ...(rolePermissions[role] || [])
    ];

    return allPermissions;
  }, [currentUser]);

  const hasPermission = (permission) => {
    if (!currentUser) return false;
    
    // Admin has all permissions
    if (permissions.includes('*')) return true;
    
    // Check exact permission
    if (permissions.includes(permission)) return true;
    
    // Check wildcard permissions
    const [module, action] = permission.split(':');
    if (permissions.includes(`${module}:*`)) return true;
    
    return false;
  };

  const hasRole = (role) => {
    return currentUser?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(currentUser?.role);
  };

  const canAccess = (module) => {
    return hasPermission(`${module}:read`) || hasPermission(`${module}:*`);
  };

  const canModify = (module) => {
    return hasPermission(`${module}:create`) || 
           hasPermission(`${module}:update`) || 
           hasPermission(`${module}:delete`) ||
           hasPermission(`${module}:*`);
  };

  const isAdmin = () => {
    return hasRole('admin');
  };

  const isManager = () => {
    return hasRole('manager') || hasRole('admin');
  };

  return {
    permissions,
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccess,
    canModify,
    isAdmin,
    isManager,
    currentUser,
    isLoggedIn: !!currentUser
  };
};

// Helper function to get current user from localStorage
const getCurrentUser = () => {
  try {
    const session = localStorage.getItem('pos-session');
    if (session) {
      const { user } = JSON.parse(session);
      return user;
    }
  } catch (error) {
    console.error('Failed to get current user:', error);
  }
  return null;
};

export default usePermissions;

