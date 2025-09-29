// src/shared/components/layout/Sidebar.js
import React from 'react';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings,
  Home,
  CreditCard,
  FileText
} from 'lucide-react';

const Sidebar = ({ currentModule, onModuleChange, canAccess }) => {
  const menuItems = [
    {
      id: 'pos',
      name: 'Point of Sale',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Process transactions'
    },
    {
      id: 'inventory',
      name: 'Inventory',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Manage products & stock'
    },
    {
      id: 'customers',
      name: 'Customers',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Customer management'
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Analytics & insights'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      description: 'System configuration'
    }
  ];

  const filteredMenuItems = menuItems.filter(item => canAccess(item.id));

  return (
    <div className="fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-lg border-r border-gray-200 pt-16">
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group ${
                  isActive
                    ? `${item.bgColor} ${item.color} shadow-sm border-l-4 border-current`
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-current' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <div className="ml-3">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className={`text-xs ${isActive ? 'text-current opacity-70' : 'text-gray-500'}`}>
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>POS System v1.0</p>
            <p className="mt-1">© 2024 Your Company</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
