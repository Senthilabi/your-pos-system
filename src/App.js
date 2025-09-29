import React, { useState, useEffect } from 'react';
import { GlobalStateProvider } from './shared/context/GlobalStateProvider';
import Layout from './shared/components/layout/Layout';
import NotificationSystem from './shared/components/layout/NotificationSystem';
import LoadingScreen from './shared/components/layout/LoadingScreen';
import { useGlobalState } from './shared/context/GlobalStateProvider';

// Module imports (these will be built next)
import POSModule from './modules/pos';
import InventoryModule from './modules/inventory';
import CustomersModule from './modules/customers';
import ReportsModule from './modules/reports';
import SettingsModule from './modules/settings';
import AuthModule from './modules/auth';

const AppContent = () => {
  const { state } = useGlobalState();
  const [currentModule, setCurrentModule] = useState('pos');

  // Redirect to auth if not logged in
  if (!state.currentUser) {
    return <AuthModule onLogin={(user) => console.log('User logged in:', user)} />;
  }

  // Show loading screen during app initialization
  if (state.isLoading) {
    return <LoadingScreen />;
  }

  const renderModule = () => {
    switch (currentModule) {
      case 'pos':
        return <POSModule />;
      case 'inventory':
        return <InventoryModule />;
      case 'customers':
        return <CustomersModule />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <POSModule />;
    }
  };

  return (
    <Layout currentModule={currentModule} onModuleChange={setCurrentModule}>
      {renderModule()}
      <NotificationSystem />
    </Layout>
  );
};

const App = () => {
  return (
    <GlobalStateProvider>
      <div className="App">
        <AppContent />
      </div>
    </GlobalStateProvider>
  );
};

export default App;
