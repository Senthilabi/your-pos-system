BUILD.md - POS System Build & Deployment Guide
Quick Start
bash# Install dependencies
npm install

# Development mode
npm start

# Production build
npm run build

# Serve production build locally
npx serve -s build
Prerequisites
RequirementVersionCheck CommandNode.js≥16.0.0node --versionnpm≥7.0.0npm --versionRAM≥4GB-Disk Space≥500MB-
Environment Setup
1. Create Environment File
Create .env in project root:
envREACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development
REACT_APP_COMPANY_NAME=Your Business
REACT_APP_DEBUG_MODE=true
2. Install Dependencies
bashnpm install
Expected packages:

react (18.2.0)
react-dom (18.2.0)
lucide-react (0.263.1)
tailwindcss (3.3.0)

Development Build
bashnpm start
Outputs:

Dev server: http://localhost:3000
Hot reload enabled
Source maps included
Console warnings visible

Port conflicts?
bashPORT=3001 npm start
Production Build
Standard Build
bashnpm run build
Build output location: build/
Build includes:

Minified JavaScript bundles
Optimized CSS
Asset optimization
Source maps (optional)

Build Verification
bash# Check build size
du -sh build/

# Expected: ~2-5MB

# Serve and test
npx serve -s build -p 3000
Build Optimization
Code Splitting (Recommended)
Add to src/App.js:
javascriptimport React, { lazy, Suspense } from 'react';

const POSModule = lazy(() => import('./modules/pos'));
const InventoryModule = lazy(() => import('./modules/inventory'));
const CustomersModule = lazy(() => import('./modules/customers'));
const ReportsModule = lazy(() => import('./modules/reports'));
const SettingsModule = lazy(() => import('./modules/settings'));

// Wrap in Suspense
<Suspense fallback={<LoadingScreen />}>
  {renderModule()}
</Suspense>
Bundle Analysis
bash# Install analyzer
npm install --save-dev webpack-bundle-analyzer

# Add to package.json scripts
"analyze": "source-map-explorer 'build/static/js/*.js'"

# Run analysis
npm run build
npm run analyze
Size Optimization
Target sizes:

Initial bundle: <200KB (gzipped)
Total build: <5MB
First paint: <2s

Deployment Options
Option 1: Static Hosting (Netlify/Vercel)
Netlify:
bash# Install CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
Build settings:

Build command: npm run build
Publish directory: build
Node version: 16

Option 2: Docker Container
Create Dockerfile:
dockerfile# Build stage
FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
Create nginx.conf:
nginxserver {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
Build and run:
bashdocker build -t pos-system .
docker run -p 80:80 pos-system
Option 3: Traditional Server (Apache/Nginx)
Build:
bashnpm run build
Copy to server:
bashscp -r build/* user@server:/var/www/html/
Apache .htaccess:
apacheRewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
Environment-Specific Builds
Development
bashREACT_APP_ENVIRONMENT=development npm run build
Staging
bashREACT_APP_ENVIRONMENT=staging npm run build
Production
bashREACT_APP_ENVIRONMENT=production npm run build
Build Troubleshooting
Issue: Build fails with memory error
Solution:
bashNODE_OPTIONS=--max_old_space_size=4096 npm run build
Issue: Module not found errors
Solution:
bashrm -rf node_modules package-lock.json
npm install
npm run build
Issue: Tailwind classes not working
Check tailwind.config.js exists:
javascriptmodule.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
Issue: IndexedDB not working after deployment
Cause: HTTPS required for IndexedDB in production
Solution: Ensure site served over HTTPS
Performance Checklist

 Code splitting implemented
 Images optimized (<500KB each)
 Lazy loading for routes
 Service worker configured
 Gzip compression enabled
 CDN for static assets
 Browser caching configured
 Bundle size <200KB gzipped

Security Checklist (Pre-Production)

 Remove console.log statements
 Environment variables secured
 HTTPS enabled
 Content Security Policy headers
 Remove source maps from production
 API keys not in bundle
 Authentication backend implemented
 Input sanitization added

CI/CD Pipeline Example (GitHub Actions)
Create .github/workflows/deploy.yml:
yamlname: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test -- --passWithNoTests
    
    - name: Build
      run: npm run build
      env:
        REACT_APP_ENVIRONMENT: production
    
    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      with:
        args: deploy --prod --dir=build
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
Build Artifacts
After successful build, build/ contains:
build/
├── static/
│   ├── css/
│   │   └── main.[hash].css
│   ├── js/
│   │   ├── main.[hash].js
│   │   └── [chunk].[hash].js
│   └── media/
├── index.html
├── favicon.ico
└── manifest.json
Monitoring Build Health
bash# Check bundle sizes
npm run build
ls -lh build/static/js/

# Lighthouse audit
npx lighthouse http://localhost:3000 --view

# Performance budget
npm install --save-dev size-limit
Add to package.json:
json"size-limit": [
  {
    "path": "build/static/js/*.js",
    "limit": "200 KB"
  }
]
Rollback Procedure
bash# Tag current version before deployment
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# Rollback if needed
git checkout v1.0.0
npm run build
# Deploy build/ directory
Build Time Estimates

Clean install: 2-5 minutes
Development build: 10-30 seconds
Production build: 1-3 minutes
Docker build: 5-10 minutes

Support
Build issues? Check:

Node/npm versions correct
.env file exists
node_modules/ deleted and reinstalled
Disk space available
Port 3000 not in use


Last Updated: January 2025
Build System: Create React App 5.0.1
Node Version: 16.x LTS