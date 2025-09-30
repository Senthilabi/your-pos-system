import React from 'react';
import AuthLayout from './components/AuthLayout';
import { AuthProvider } from './context/AuthContext';

const AuthModule = ({ onLogin }) => {
  return (
    <AuthProvider onLogin={onLogin}>
      <AuthLayout />
    </AuthProvider>
  );
};

export default AuthModule;
