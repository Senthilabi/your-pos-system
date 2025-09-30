import React from 'react';
import { Lock, User, Eye, EyeOff, Shield, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Alert } from '../../../shared/components/ui';
import { useForm } from '../../../shared/hooks';

const LoginForm = () => {
  const { state, login, toggleCreateUser } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm({
    username: '',
    password: ''
  }, {
    username: [{ required: true, message: 'Username or email is required' }],
    password: [{ required: true, message: 'Password is required' }]
  });

  const onSubmit = async (formData) => {
    await login(formData);
  };

  const getLockoutMessage = () => {
    if (!state.isLocked || !state.lockoutEndTime) return '';
    
    const remainingTime = Math.ceil((new Date(state.lockoutEndTime) - new Date()) / 60000);
    return `Account locked due to multiple failed attempts. Try again in ${remainingTime} minutes.`;
  };

  return (
    <Card padding="large" className="shadow-xl">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">POS System Login</h1>
        <p className="text-gray-600 mt-2">Sign in to access your business dashboard</p>
      </div>

      {state.error && (
        <Alert type="error" className="mb-4" dismissible={false}>
          {state.error}
        </Alert>
      )}

      {state.isLocked && (
        <Alert type="warning" className="mb-4" dismissible={false}>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>{getLockoutMessage()}</span>
          </div>
        </Alert>
      )}

      <form className="space-y-4">
        <Input
          label="Username or Email"
          value={values.username}
          onChange={(e) => handleChange('username', e.target.value)}
          onBlur={() => handleBlur('username')}
          error={errors.username}
          icon={<User className="h-4 w-4" />}
          placeholder="Enter your username or email"
          disabled={state.isLocked}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={values.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            error={errors.password}
            icon={<Lock className="h-4 w-4" />}
            placeholder="Enter your password"
            disabled={state.isLocked}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            disabled={state.isLocked}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Button
          onClick={() => handleSubmit(onSubmit)}
          loading={state.isLoading}
          disabled={state.isLocked}
          className="w-full"
          size="lg"
        >
          {state.isLoading ? 'Signing In...' : 'Sign In'}
        </Button>

        {state.loginAttempts > 0 && state.loginAttempts < 5 && (
          <p className="text-sm text-orange-600 text-center">
            Warning: {5 - state.loginAttempts} attempts remaining before lockout
          </p>
        )}
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            First time setup or need to create an account?
          </p>
          <Button
            variant="outline"
            onClick={toggleCreateUser}
            className="w-full"
          >
            Create Administrator Account
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="text-xs text-gray-500 space-y-1">
          <p>Demo Accounts:</p>
          <p><strong>admin</strong> / admin123 (Full Access)</p>
          <p><strong>demo</strong> / demo123 (Manager Access)</p>
        </div>
      </div>
    </Card>
  );
};

export default LoginForm;
