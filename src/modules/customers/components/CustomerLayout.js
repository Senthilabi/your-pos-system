import React from 'react';
import CustomerDashboard from './CustomerDashboard';
import CustomerList from './CustomerList';
import CustomerModal from './CustomerModal';
import LoyaltyModal from './LoyaltyModal';

const CustomerLayout = () => {
  return (
    <div className="space-y-6">
      <CustomerDashboard />
      <CustomerList />
      <CustomerModal />
      <LoyaltyModal />
    </div>
  );
};

export default CustomerLayout;
