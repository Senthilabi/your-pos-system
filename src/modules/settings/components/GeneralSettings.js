import React from 'react';
import { Building, MapPin, Phone, Mail } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { Card, Button, Input } from '../../../shared/components/ui';
import { useForm } from '../../../shared/hooks';

const GeneralSettings = () => {
  const { globalSettings, updateCompanySettings } = useSettings();

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm(globalSettings.company, {
    name: [{ required: true, message: 'Company name is required' }],
    email: [
      {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      }
    ]
  });

  const onSubmit = async (formData) => {
    await updateCompanySettings(formData);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
        <p className="text-gray-600">Configure your company information and basic settings</p>
      </div>

      <Card title="Company Information" padding="normal">
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name *"
              value={values.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              error={errors.name}
              icon={<Building className="h-4 w-4" />}
              placeholder="Your Business Name"
            />
            
            <Input
              label="Email Address"
              type="email"
              value={values.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              error={errors.email}
              icon={<Mail className="h-4 w-4" />}
              placeholder="business@email.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={values.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              icon={<Phone className="h-4 w-4" />}
              placeholder="+1 (555) 123-4567"
            />
            
            <Input
              label="Tax ID"
              value={values.taxId || ''}
              onChange={(e) => handleChange('taxId', e.target.value)}
              placeholder="Tax identification number"
            />
          </div>

          <Input
            label="Address"
            value={values.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            icon={<MapPin className="h-4 w-4" />}
            placeholder="Business address"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Currency"
              value={values.currency || 'USD'}
              onChange={(e) => handleChange('currency', e.target.value)}
              placeholder="USD"
            />
            
            <Input
              label="Timezone"
              value={values.timezone || 'UTC'}
              onChange={(e) => handleChange('timezone', e.target.value)}
              placeholder="America/New_York"
            />
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={values.dateFormat || 'MM/DD/YYYY'}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={() => handleSubmit(onSubmit)}>
              Save Company Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default GeneralSettings;
