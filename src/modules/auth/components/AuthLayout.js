import React, { useEffect } from 'react';
import LoginForm from './LoginForm';
import CreateUserForm from './CreateUserForm';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
  const { state, checkSession } = useAuth();

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {state.showCreateUser || state.users.length === 0 ? (
          <CreateUserForm />
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
};

export default AuthLayout;
