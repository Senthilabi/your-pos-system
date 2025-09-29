// src/shared/components/layout/Layout.js
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { usePermissions } from '../../hooks';

const Layout = ({ children, currentModule, onModuleChange }) => {
  const { canAccess } = usePermissions();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentModule={currentModule} />
      
      <div className="flex">
        <Sidebar 
          currentModule={currentModule} 
          onModuleChange={onModuleChange}
          canAccess={canAccess}
        />
        
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
