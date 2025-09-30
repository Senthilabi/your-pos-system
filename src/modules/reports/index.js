import React from 'react';
import ReportsLayout from './components/ReportsLayout';
import { ReportsProvider } from './context/ReportsContext';

const ReportsModule = () => {
  return (
    <ReportsProvider>
      <ReportsLayout />
    </ReportsProvider>
  );
};

export default ReportsModule;
