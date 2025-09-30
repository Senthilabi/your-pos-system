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

import React from 'react';
import { LoadingSpinner } from '../ui';

const LoadingScreen = ({ message = "Loading POS System..." }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <LoadingSpinner size="lg" className="border-white border-t-transparent" />
          </div>
          <div className="text-4xl font-bold text-blue-600 mb-2">POS</div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {message}
        </h2>
        <p className="text-gray-600 mb-8">
          Please wait while we prepare your workspace
        </p>

        {/* Loading animation */}
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 200}ms`,
                animationDuration: '1000ms'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
