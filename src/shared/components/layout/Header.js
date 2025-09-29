// src/shared/components/layout/Header.js
import React from 'react';
import { Bell, User, Settings, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useGlobalState } from '../../context/GlobalStateProvider';
import { useNotification } from '../../hooks';
import { Button } from '../ui';

const Header = ({ currentModule }) => {
  const { state, dispatch, ActionTypes } = useGlobalState();
  const { showSuccess } = useNotification();
  const { currentUser, isOnline, settings } = state;

  const moduleNames = {
    pos: 'Point of Sale',
    inventory: 'Inventory Management',
    customers: 'Customer Management',
    reports: 'Reports & Analytics',
    settings: 'Settings'
  };

  const handleLogout = () => {
    dispatch({ type: ActionTypes.SET_CURRENT_USER, payload: null });
    showSuccess('Logged out successfully');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-30">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                {settings.company.name || 'POS System'}
              </h1>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <h2 className="text-gray-600 text-sm">
                  {moduleNames[currentModule] || 'Dashboard'}
                </h2>
              </div>
            </div>
          </div>

          {/* Center section - Status indicators */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm ml-1">Online</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm ml-1">Offline</span>
                </div>
              )}
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
                {state.notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {state.notifications.length}
                  </span>
                )}
              </Button>
            </div>

            {/* User menu */}
            <div className="relative flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {currentUser?.role}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
