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
