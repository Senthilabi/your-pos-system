import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Shield, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { Card, Button, Badge, Table, Modal, Input } from '../../../shared/components/ui';
import { useForm } from '../../../shared/hooks';

const UserManagement = () => {
  const { state, createUser, updateUser, deleteUser } = useSettings();
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  } = useForm({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'cashier',
    password: ''
  }, {
    username: [{ required: true, message: 'Username is required' }],
    email: [
      { required: true, message: 'Email is required' },
      {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      }
    ],
    firstName: [{ required: true, message: 'First name is required' }],
    lastName: [{ required: true, message: 'Last name is required' }],
    password: editingUser ? [] : [
      { required: true, message: 'Password is required' },
      { minLength: 6, message: 'Password must be at least 6 characters' }
    ]
  });

  const userColumns = [
    {
      key: 'user',
      label: 'User',
      sortable: false,
      render: (value, user) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => value
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => {
        const roleColors = {
          admin: 'error',
          manager: 'warning', 
          cashier: 'info',
          viewer: 'default'
        };
        return (
          <Badge variant={roleColors[value]} size="sm" className="capitalize">
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'Never'
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (
        <Badge variant={value ? 'success' : 'error'} size="sm">
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value, user) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleEditUser(user)}
            title="Edit User"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleDeleteUser(user)}
            className="text-red-600 hover:text-red-800"
            title="Delete User"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const handleAddUser = () => {
    setEditingUser(null);
    reset();
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    Object.keys(values).forEach(key => {
      if (user[key] !== undefined) {
        handleChange(key, user[key]);
      }
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      deleteUser(user.id);
    }
  };

  const onSubmit = async (formData) => {
    try {
      if (editingUser) {
        const { password, ...updateData } = formData;
        await updateUser(editingUser.id, updateData);
      } else {
        await createUser(formData);
      }
      setShowUserModal(false);
      reset();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleModalClose = () => {
    setShowUserModal(false);
    setEditingUser(null);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        
        <Button onClick={handleAddUser} icon={<Plus className="h-4 w-4" />}>
          Add User
        </Button>
      </div>

      <Card title={`Users (${state.users.length})`} padding="small">
        <Table
          data={state.users}
          columns={userColumns}
          sortable={true}
          emptyMessage="No users found"
        />
      </Card>

      {/* User Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={handleModalClose}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="lg"
        footer={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit(onSubmit)}>
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        }
      >
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Username *"
              value={values.username}
              onChange={(e) => handleChange('username', e.target.value)}
              onBlur={() => handleBlur('username')}
              error={errors.username}
              placeholder="johndoe"
            />
            
            <Input
              label="Email *"
              type="email"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              error={errors.email}
              placeholder="john@company.com"
            />
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                value={values.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            
            {!editingUser && (
              <Input
                label="Password *"
                type="password"
                value={values.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                error={errors.password}
                placeholder="Minimum 6 characters"
              />
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Role Permissions</h4>
            <div className="text-sm text-gray-600">
              {values.role === 'admin' && (
                <p>Full system access - can manage all modules and settings</p>
              )}
              {values.role === 'manager' && (
                <p>Access to POS, inventory, customers, and reports (read-only)</p>
              )}
              {values.role === 'cashier' && (
                <p>Access to POS operations and customer lookup only</p>
              )}
              {values.role === 'viewer' && (
                <p>Read-only access to reports and data</p>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
