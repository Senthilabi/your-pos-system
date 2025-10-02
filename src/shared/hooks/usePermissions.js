// src/shared/hooks/usePermissions.js
import { useMemo, useCallback } from 'react';
import { useGlobalState } from '../context/GlobalStateProvider';

const rolePermissions = {
  admin: ['*'], // Full access
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

// Helper to get current user from localStorage
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

const usePermissions = () => {
  const { state } = useGlobalState();
  const currentUser = state?.currentUser || getCurrentUser();

  const permissions = useMemo(() => {
    if (!currentUser) return [];

    const userPermissions = currentUser.permissions || [];
    const role = currentUser.role;

    return [...userPermissions, ...(rolePermissions[role] || [])];
  }, [currentUser]);

  const hasPermission = useCallback((permission) => {
    if (!currentUser) return false;

    // Admin shortcut
    if (permissions.includes('*')) return true;

    // Exact permission
    if (permissions.includes(permission)) return true;

    // Wildcard
    const [module] = permission.split(':');
    if (permissions.includes(`${module}:*`)) return true;

    return false;
  }, [permissions, currentUser]);

  const hasRole = useCallback((role) => currentUser?.role === role, [currentUser]);

  const hasAnyRole = useCallback((roles) => roles.includes(currentUser?.role), [currentUser]);

  const canAccess = useCallback((module) => {
    return hasPermission(`${module}:read`) || hasPermission(`${module}:*`);
  }, [hasPermission]);

  const canModify = useCallback((module) => {
    return (
      hasPermission(`${module}:create`) ||
      hasPermission(`${module}:update`) ||
      hasPermission(`${module}:delete`) ||
      hasPermission(`${module}:*`)
    );
  }, [hasPermission]);

  const isAdmin = useCallback(() => hasRole('admin'), [hasRole]);
  const isManager = useCallback(() => hasRole('manager') || hasRole('admin'), [hasRole]);

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

export default usePermissions;
