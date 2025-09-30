import React from 'react';
import { 
  Settings, FileText, Receipt, Award, Users, 
  Activity, Database, Building
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const SettingsSidebar = () => {
  const { state, setActiveSection } = useSettings();

  const settingSections = [
    {
      id: 'general',
      name: 'General',
      icon: Building,
      description: 'Company & basic settings'
    },
    {
      id: 'tax',
      name: 'Tax Configuration',
      icon: FileText,
      description: 'Tax rates & rules'
    },
    {
      id: 'receipt',
      name: 'Receipt Settings',
      icon: Receipt,
      description: 'Receipt templates & format'
    },
    {
      id: 'loyalty',
      name: 'Loyalty Program',
      icon: Award,
      description: 'Points & rewards system'
    },
    {
      id: 'users',
      name: 'User Management',
      icon: Users,
      description: 'Users & permissions'
    },
    {
      id: 'logs',
      name: 'System Logs',
      icon: Activity,
      description: 'Activity & audit logs'
    },
    {
      id: 'data',
      name: 'Data Management',
      icon: Database,
      description: 'Backup & restore'
    }
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure your POS system</p>
      </div>

      <nav className="space-y-2">
        {settingSections.map(section => {
          const Icon = section.icon;
          const isActive = state.activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Icon className={`h-5 w-5 mt-0.5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <div>
                  <p className="font-medium">{section.name}</p>
                  <p className={`text-sm ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {section.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SettingsSidebar;
