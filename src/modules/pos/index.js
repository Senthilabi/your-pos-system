// src/modules/pos/index.js
import React from 'react';
import POSLayout from './components/POSLayout';
import { POSProvider } from './context/POSContext';

const POSModule = () => {
  return (
    <POSProvider>
      <POSLayout />
    </POSProvider>
  );
};