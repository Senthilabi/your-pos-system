import React from 'react';
import SettingsSidebar from './SettingsSidebar';
import GeneralSettings from './GeneralSettings';
import TaxSettings from './TaxSettings';
import ReceiptSettings from './ReceiptSettings';
import LoyaltySettings from './LoyaltySettings';
import UserManagement from './UserManagement';
import SystemLogs from './SystemLogs';
import DataManagement from './DataManagement';
import { useSettings } from '../context/SettingsContext';

const SettingsLayout = () => {
  const { state } = useSettings();

  const renderSettingsSection = () => {
    switch (state.activeSection) {
      case 'general':
        return <GeneralSettings />;
      case 'tax':
        return <TaxSettings />;
      case 'receipt':
        return <ReceiptSettings />;
      case 'loyalty':
        return <LoyaltySettings />;
      case 'users':
        return <UserManagement />;
      case 'logs':
        return <SystemLogs />;
      case 'data':
        return <DataManagement />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="flex h-full">
      <SettingsSidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        {renderSettingsSection()}
      </div>
    </div>
  );
};

export default SettingsLayout;
