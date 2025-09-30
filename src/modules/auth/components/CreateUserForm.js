import React from 'react';
import { UserPlus, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Alert } from '../../../shared/components/ui';
import { useForm } from '../../../shared/hooks';

const CreateUserForm = () => {
  const { state, createFirstTimeUser, toggleCreateUser } = useAuth();

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  }, {
    firstName: [{ required: true, message: 'First name is required' }],
    lastName: [{ required: true, message: 'Last name is required' }],
    username: [
      { required: true, message: 'Username is required' },
      { minLength: 3, message: 'Username must be at least 3 characters' }
    ],
    email: [
      { required: true, message: 'Email is required' },
      {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      }
    ],
    password: [
      { required: true, message: 'Password is required' },
      { minLength: 6, message: 'Password must be at least 6 characters' }
    ],
    confirmPassword: [
      { required: true, message: 'Please confirm your password' },
      {
        custom: (value, allValues) => value === allValues.password,
        message: 'Passwords do not match'
      }
    ]
  });

  const onSubmit = async (formData) => {
    await createFirstTimeUser(formData);
  };

  return (
    <Card padding="large" className="shadow-xl">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
          <UserPlus className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create Administrator</h1>
        <p className="text-gray-600 mt-2">Set up your first administrator account</p>
      </div>

      {state.error && (
        <Alert type="error" className="mb-4" dismissible={false}>
          {state.error}
        </Alert>
      )}

      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Administrator Account</span>
        </div>
        <p className="text-sm text-blue-800 mt-1">
          This account will have full access to all system features and settings.
        </p>
      </div>

      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name *"
            value={values.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            error={errors.firstName}
            placeholder="John"
          />
          
          <Input
            label="Last Name *"
            value={values.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            error={errors.lastName}
            placeholder="Doe"
          />
        </div>

        <Input
          label="Username *"
          value={values.username}
          onChange={(e) => handleChange('username', e.target.value)}
          onBlur={() => handleBlur('username')}
          error={errors.username}
          placeholder="admin"
          helpText="Minimum 3 characters, letters and numbers only"
        />

        <Input
          label="Email Address *"
          type="email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          error={errors.email}
          placeholder="admin@yourbusiness.com"
        />

        <Input
          label="Password *"
          type="password"
          value={values.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          error={errors.password}
          placeholder="Minimum 6 characters"
          helpText="Use a strong password with letters, numbers, and symbols"
        />

        <Input
          label="Confirm Password *"
          type="password"
          value={values.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          onBlur={() => handleBlur('confirmPassword')}
          error={errors.confirmPassword}
          placeholder="Re-enter your password"
        />

        <div className="flex space-x-3">
          {state.users.length > 0 && (
            <Button
              variant="outline"
              onClick={toggleCreateUser}
              disabled={state.isLoading}
              icon={<ArrowLeft className="h-4 w-4" />}
              className="flex-1"
            >
              Back to Login
            </Button>
          )}
          
          <Button
            onClick={() => handleSubmit(onSubmit)}
            loading={state.isLoading}
            className="flex-1"
            size="lg"
          >
            {state.isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          By creating an account, you agree to the terms of service and privacy policy.
        </p>
      </div>
    </Card>
  );
};

export default CreateUserForm;