import React from 'react';
import CustomerLayout from './components/CustomerLayout';
import { CustomerProvider } from './context/CustomerContext';

const CustomersModule = () => {
  return (
    <CustomerProvider>
      <CustomerLayout />
    </CustomerProvider>
  );
};

export default CustomersModule;
