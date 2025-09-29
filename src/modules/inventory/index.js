import React from 'react';
import InventoryLayout from './components/InventoryLayout';
import { InventoryProvider } from './context/InventoryContext';

const InventoryModule = () => {
  return (
    <InventoryProvider>
      <InventoryLayout />
    </InventoryProvider>
  );
};

export default InventoryModule;
