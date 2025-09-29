// src/shared/components/layout/LoadingScreen.js
import React from 'react';
import { LoadingSpinner } from '../ui';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <h2 className="mt-4 text-lg font-medium text-gray-900">
          Loading POS System...
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please wait while we initialize your data
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;