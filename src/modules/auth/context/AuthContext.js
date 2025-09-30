import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNotification } from '../../../shared/hooks';
import DatabaseService from '../../../shared/services/DatabaseService';

const AuthContext = createContext();

const initialState = {
  isLoading: false,
  error: null,
  users: [],
  loginAttempts: 0,
  isLocked: false,
  lockoutEndTime: null,
  currentView: 'login', // login, forgotPassword, resetPassword
  showCreateUser: false
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_USERS':
      return { ...state, users: action.payload };
    
    case 'INCREMENT_LOGIN_ATTEMPTS':
      return { 
        ...state, 
        loginAttempts: state.loginAttempts + 1,
        isLocked: state.loginAttempts + 1 >= 5,
        lockoutEndTime: state.loginAttempts + 1 >= 5 
          ? new Date(Date.now() + 15 * 60 * 1000) // 15 minutes lockout
          : null
      };
    
    case 'RESET_LOGIN_ATTEMPTS':
      return { 
        ...state, 
        loginAttempts: 0, 
        isLocked: false, 
        lockoutEndTime: null 
      };
    
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    
    case 'TOGGLE_CREATE_USER':
      return { ...state, showCreateUser: !state.showCreateUser };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children, onLogin }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { showSuccess, showError } = useNotification();

  // Load users and check lockout status
  useEffect(() => {
    loadUsers();
    checkLockoutStatus();
  }, []);

  // Check lockout status every minute
  useEffect(() => {
    const interval = setInterval(checkLockoutStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadUsers = async () => {
    try {
      // In production, this would load from a secure backend
      // For demo, we'll create some default users if none exist
      const existingUsers = await DatabaseService.getAll('users') || [];
      
      if (existingUsers.length === 0) {
        const defaultUsers = [
          {
            id: 'user-admin',
            username: 'admin',
            email: 'admin@pos.com',
            firstName: 'System',
            lastName: 'Administrator',
            role: 'admin',
            password: await hashPassword('admin123'), // In production, this should be properly hashed
            isActive: true,
            createdAt: new Date(),
            lastLogin: null,
            permissions: ['*']
          },
          {
            id: 'user-demo',
            username: 'demo',
            email: 'demo@pos.com',
            firstName: 'Demo',
            lastName: 'User',
            role: 'manager',
            password: await hashPassword('demo123'),
            isActive: true,
            createdAt: new Date(),
            lastLogin: null,
            permissions: ['pos:*', 'inventory:*', 'customers:*', 'reports:read']
          }
        ];

        for (const user of defaultUsers) {
          await DatabaseService.add('users', user);
        }
        
        dispatch({ type: 'SET_USERS', payload: defaultUsers });
      } else {
        dispatch({ type: 'SET_USERS', payload: existingUsers });
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load user data' });
    }
  };

  const checkLockoutStatus = () => {
    if (state.isLocked && state.lockoutEndTime) {
      if (new Date() > new Date(state.lockoutEndTime)) {
        dispatch({ type: 'RESET_LOGIN_ATTEMPTS' });
      }
    }
  };

  // Simple password hashing (in production, use proper bcrypt or similar)
  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'pos-salt-2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const verifyPassword = async (inputPassword, hashedPassword) => {
    const inputHash = await hashPassword(inputPassword);
    return inputHash === hashedPassword;
  };

  const login = async (credentials) => {
    if (state.isLocked) {
      const remainingTime = Math.ceil((new Date(state.lockoutEndTime) - new Date()) / 60000);
      throw new Error(`Account locked. Try again in ${remainingTime} minutes.`);
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = state.users.find(u => 
        (u.username === credentials.username || u.email === credentials.username) && u.isActive
      );

      if (!user) {
        dispatch({ type: 'INCREMENT_LOGIN_ATTEMPTS' });
        throw new Error('Invalid username or password');
      }

      const isPasswordValid = await verifyPassword(credentials.password, user.password);
      
      if (!isPasswordValid) {
        dispatch({ type: 'INCREMENT_LOGIN_ATTEMPTS' });
        throw new Error('Invalid username or password');
      }

      // Update last login
      const updatedUser = {
        ...user,
        lastLogin: new Date()
      };

      await DatabaseService.update('users', updatedUser);
      
      // Update users list
      const updatedUsers = state.users.map(u => 
        u.id === user.id ? updatedUser : u
      );
      dispatch({ type: 'SET_USERS', payload: updatedUsers });

      dispatch({ type: 'RESET_LOGIN_ATTEMPTS' });
      
      // Create session data (without password)
      const sessionUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions || [],
        lastLogin: updatedUser.lastLogin
      };

      // Store in localStorage for session persistence
      localStorage.setItem('pos-session', JSON.stringify({
        user: sessionUser,
        timestamp: new Date().toISOString()
      }));

      showSuccess(`Welcome back, ${user.firstName}!`);
      
      if (onLogin) {
        onLogin(sessionUser);
      }

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      showError(error.message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    localStorage.removeItem('pos-session');
    showSuccess('Logged out successfully');
    
    if (onLogin) {
      onLogin(null);
    }
  };

  const createFirstTimeUser = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const hashedPassword = await hashPassword(userData.password);
      
      const newUser = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'admin', // First user is always admin
        password: hashedPassword,
        isActive: true,
        createdAt: new Date(),
        lastLogin: null,
        permissions: ['*']
      };

      await DatabaseService.add('users', newUser);
      
      const updatedUsers = [...state.users, newUser];
      dispatch({ type: 'SET_USERS', payload: updatedUsers });
      dispatch({ type: 'TOGGLE_CREATE_USER' });

      showSuccess('Administrator account created successfully');
      
      // Auto-login the new user
      const sessionUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        permissions: newUser.permissions,
        lastLogin: new Date()
      };

      localStorage.setItem('pos-session', JSON.stringify({
        user: sessionUser,
        timestamp: new Date().toISOString()
      }));

      if (onLogin) {
        onLogin(sessionUser);
      }

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      showError('Failed to create user account');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const checkSession = () => {
    try {
      const session = localStorage.getItem('pos-session');
      if (session) {
        const { user, timestamp } = JSON.parse(session);
        const sessionAge = Date.now() - new Date(timestamp).getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (sessionAge < maxAge) {
          if (onLogin) {
            onLogin(user);
          }
          return user;
        } else {
          localStorage.removeItem('pos-session');
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
      localStorage.removeItem('pos-session');
    }
    return null;
  };

  const setView = (view) => {
    dispatch({ type: 'SET_VIEW', payload: view });
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const toggleCreateUser = () => {
    dispatch({ type: 'TOGGLE_CREATE_USER' });
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      state,
      login,
      logout,
      createFirstTimeUser,
      checkSession,
      setView,
      toggleCreateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
