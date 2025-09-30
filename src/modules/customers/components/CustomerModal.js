import React, { useState, useEffect } from 'react';
import { useCustomers } from '../context/CustomerContext';
import { Modal, Button, Input } from '../../../shared/components/ui';
import { useForm } from '../../../shared/hooks';

const CustomerModal = () => {
  const { state, createCustomer, updateCustomer, hideModal } = useCustomers();
  const isEditing = !!state.editingCustomer;
  
  const validationRules = {
    name: [{ required: true, message: 'Customer name is required' }],
    email: [
      {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      }
    ],
    phone: [
      {
        pattern: /^[\+]?[1-9][\d]{0,15}$/,
        message: 'Please enter a valid phone number'
      }
    ]
  };

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue
  } = useForm({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    notes: ''
  }, validationRules);

  useEffect(() => {
    if (state.showCustomerModal && state.editingCustomer) {
      const customer = state.editingCustomer;
      setFieldValue('name', customer.name || '');
      setFieldValue('email', customer.email || '');
      setFieldValue('phone', customer.phone || '');
      setFieldValue('dateOfBirth', customer.dateOfBirth ? customer.dateOfBirth.split('T')[0] : '');
      setFieldValue('address', customer.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      });
      setFieldValue('notes', customer.notes || '');
    } else if (state.showCustomerModal) {
      reset();
    }
  }, [state.showCustomerModal, state.editingCustomer, reset, setFieldValue]);

  const onSubmit = async (formData) => {
    try {
      const customerData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null
      };

      if (isEditing) {
        await updateCustomer(state.editingCustomer.id, customerData);
      } else {
        await createCustomer(customerData);
      }

      hideModal('Customer');
    } catch (error) {
      console.error('Failed to save customer:', error);
    }
  };

  const handleClose = () => {
    hideModal('Customer');
    reset();
  };

  return (
    <Modal
      isOpen={state.showCustomerModal}
      onClose={handleClose}
      title={isEditing ? 'Edit Customer' : 'Add New Customer'}
      size="lg"
      footer={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={() => handleSubmit(onSubmit)}>
            {isEditing ? 'Update' : 'Create'} Customer
          </Button>
        </div>
      }
    >
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name *"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            error={errors.name}
            placeholder="Enter customer name"
          />
          
          <Input
            label="Email"
            type="email"
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            error={errors.email}
            placeholder="customer@email.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Phone"
            value={values.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            error={errors.phone}
            placeholder="+1234567890"
          />
          
          <Input
            label="Date of Birth"
            type="date"
            value={values.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Address (Optional)</h4>
          
          <Input
            label="Street Address"
            value={values.address.street}
            onChange={(e) => handleChange('address', { ...values.address, street: e.target.value })}
            placeholder="123 Main Street"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="City"
              value={values.address.city}
              onChange={(e) => handleChange('address', { ...values.address, city: e.target.value })}
              placeholder="City"
            />
            
            <Input
              label="State/Province"
              value={values.address.state}
              onChange={(e) => handleChange('address', { ...values.address, state: e.target.value })}
              placeholder="State"
            />
            
            <Input
              label="ZIP/Postal Code"
              value={values.address.zipCode}
              onChange={(e) => handleChange('address', { ...values.address, zipCode: e.target.value })}
              placeholder="12345"
            />
          </div>
          
          <Input
            label="Country"
            value={values.address.country}
            onChange={(e) => handleChange('address', { ...values.address, country: e.target.value })}
            placeholder="United States"
          />
        </div>

        <Input
          label="Notes"
          value={values.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional notes about the customer..."
        />
      </form>
    </Modal>
  );
};

export default CustomerModal;
