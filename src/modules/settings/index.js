import React from 'react';
import SettingsLayout from './components/SettingsLayout';
import { SettingsProvider } from './context/SettingsContext';

const SettingsModule = () => {
  return (
    <SettingsProvider>
      <SettingsLayout />
    </SettingsProvider>
  );
};

export default SettingsModule;
