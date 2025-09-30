import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Tailwind CSS
import App from './App';

// Performance monitoring (optional)
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Service Worker registration for PWA capabilities
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Initialize app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker and performance monitoring
registerServiceWorker();
reportWebVitals();

// package.json - Dependencies and scripts
const packageJson = {
  "name": "pos-system",
  "version": "1.0.0",
  "description": "Production-ready Point of Sale system built with React",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "lucide-react": "^0.263.1",
    "tailwindcss": "^3.3.0",
    "@headlessui/react": "^1.7.15",
    "web-vitals": "^3.3.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint src --ext .js,.jsx",
    "lint:fix": "eslint src --ext .js,.jsx --fix",
    "format": "prettier --write src/**/*.{js,jsx,css,md}"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ],
    "rules": {
      "no-unused-vars": "warn",
      "no-console": "warn"
    }
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^14.4.3",
    "eslint": "^8.43.0",
    "prettier": "^2.8.8"
  },
  "keywords": [
    "pos",
    "point-of-sale",
    "react",
    "retail",
    "business",
    "inventory",
    "sales"
  ],
  "author": "Your Name",
  "license": "MIT"
};

// .env.example - Environment variables template
const envExample = `# Environment Configuration
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production
REACT_APP_COMPANY_NAME=Your Business Name

# Optional: External API URLs
# REACT_APP_API_URL=https://your-api.com
# REACT_APP_PAYMENT_API_URL=https://payment-api.com

# Optional: Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_OFFLINE_MODE=true
REACT_APP_DEBUG_MODE=false`;

console.log('Environment template:', envExample);
console.log('Package.json:', JSON.stringify(packageJson, null, 2));
