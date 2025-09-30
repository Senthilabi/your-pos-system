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
import React, { useState, useEffect } from 'react';
import { GlobalStateProvider } from './shared/context/GlobalStateProvider';
import Layout from './shared/components/layout/Layout';
import LoadingScreen from './shared/components/layout/LoadingScreen';
import NotificationSystem from './shared/components/layout/NotificationSystem';
import ErrorBoundary from './shared/components/ErrorBoundary';

// Module imports
import AuthModule from './modules/auth';
import POSModule from './modules/pos';
import InventoryModule from './modules/inventory';
import CustomersModule from './modules/customers';
import ReportsModule from './modules/reports';
import SettingsModule from './modules/settings';

// Import permissions hook
import { usePermissions } from './shared/hooks';

const AppContent = () => {
  const [currentModule, setCurrentModule] = useState('pos');
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const { canAccess } = usePermissions();

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = () => {
      try {
        const session = localStorage.getItem('pos-session');
        if (session) {
          const { user, timestamp } = JSON.parse(session);
          const sessionAge = Date.now() - new Date(timestamp).getTime();
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours

          if (sessionAge < maxAge) {
            setCurrentUser(user);
          } else {
            localStorage.removeItem('pos-session');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('pos-session');
      } finally {
        setIsInitializing(false);
      }
    };

    checkSession();
  }, []);

  // Show loading screen during initialization
  if (isInitializing) {
    return <LoadingScreen message="Initializing POS System..." />;
  }

  // Show auth module if not logged in
  if (!currentUser) {
    return (
      <AuthModule 
        onLogin={(user) => {
          setCurrentUser(user);
          // Default to POS module for new logins
          setCurrentModule('pos');
        }} 
      />
    );
  }

  // Module renderer with permission checks
  const renderModule = () => {
    // Check if user has access to the selected module
    if (!canAccess(currentModule)) {
      // Redirect to first accessible module
      const accessibleModules = ['pos', 'inventory', 'customers', 'reports', 'settings'];
      const firstAccessible = accessibleModules.find(module => canAccess(module));
      
      if (firstAccessible && firstAccessible !== currentModule) {
        setCurrentModule(firstAccessible);
        return <LoadingScreen message="Redirecting..." />;
      }
      
      // If no access to any module, show access denied
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this module.</p>
          </div>
        </div>
      );
    }

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
    <Layout 
      currentModule={currentModule} 
      onModuleChange={setCurrentModule}
      currentUser={currentUser}
      onLogout={() => {
        localStorage.removeItem('pos-session');
        setCurrentUser(null);
        setCurrentModule('pos');
      }}
    >
      <ErrorBoundary>
        {renderModule()}
      </ErrorBoundary>
      <NotificationSystem />
    </Layout>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <GlobalStateProvider>
        <div className="App">
          <AppContent />
        </div>
      </GlobalStateProvider>
    </ErrorBoundary>
  );
};

export default App;
