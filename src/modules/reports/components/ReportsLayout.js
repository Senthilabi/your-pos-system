import React from 'react';
import ReportsDashboard from './ReportsDashboard';
import SalesReports from './SalesReports';
import InventoryReports from './InventoryReports';
import CustomerReports from './CustomerReports';
import ReportFilters from './ReportFilters';
import { useReports } from '../context/ReportsContext';

const ReportsLayout = () => {
  const { state } = useReports();

  const renderCurrentReport = () => {
    switch (state.selectedReport) {
      case 'dashboard':
        return <ReportsDashboard />;
      case 'sales':
        return <SalesReports />;
      case 'inventory':
        return <InventoryReports />;
      case 'customer':
        return <CustomerReports />;
      default:
        return <ReportsDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      <ReportFilters />
      {renderCurrentReport()}
    </div>
  );
};

export default ReportsLayout;
