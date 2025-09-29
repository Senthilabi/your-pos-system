import React from 'react';
import InventoryDashboard from './InventoryDashboard';
import ProductList from './ProductList';
import ProductModal from './ProductModal';
import StockModal from './StockModal';

const InventoryLayout = () => {
  return (
    <div className="space-y-6">
      <InventoryDashboard />
      <ProductList />
      <ProductModal />
      <StockModal />
    </div>
  );
};

export default InventoryLayout;
