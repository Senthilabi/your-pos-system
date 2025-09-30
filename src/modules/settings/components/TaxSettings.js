import React from 'react';
import { Calculator, Percent } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { Card, Button, Input } from '../../../shared/components/ui';
import { useForm } from '../../../shared/hooks';

const TaxSettings = () => {
  const { globalSettings, updateTaxSettings } = useSettings();

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm(globalSettings.tax, {
    rate: [
      { 
        custom: (value) => !value || (value >= 0 && value <= 1),
        message: 'Tax rate must be between 0 and 1 (e.g., 0.1 for 10%)'
      }
    ]
  });

  const onSubmit = async (formData) => {
    await updateTaxSettings(formData);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Tax Configuration</h2>
        <p className="text-gray-600">Configure tax rates and calculation rules</p>
      </div>

      <Card title="Tax Settings" padding="normal">
        <form className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="taxEnabled"
              checked={values.enabled || false}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="taxEnabled" className="text-sm font-medium text-gray-700">
              Enable tax calculation
            </label>
          </div>

          {values.enabled && (
            <div className="space-y-4 pl-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tax Rate *"
                  type="number"
                  step="0.001"
                  min="0"
                  max="1"
                  value={values.rate || ''}
                  onChange={(e) => handleChange('rate', parseFloat(e.target.value) || 0)}
                  onBlur={() => handleBlur('rate')}
                  error={errors.rate}
                  icon={<Percent className="h-4 w-4" />}
                  placeholder="0.10"
                  helpText="Enter as decimal (e.g., 0.10 for 10%)"
                />
                
                <Input
                  label="Tax Name"
                  value={values.name || 'Tax'}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Sales Tax"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="taxInclusive"
                  checked={values.inclusive || false}
                  onChange={(e) => handleChange('inclusive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="taxInclusive" className="text-sm font-medium text-gray-700">
                  Tax inclusive pricing (tax is included in product prices)
                </label>
              </div>

              <Input
                label="Tax ID"
                value={values.taxId || ''}
                onChange={(e) => handleChange('taxId', e.target.value)}
                placeholder="Your tax identification number"
              />

              {values.rate && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calculator className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Tax Preview</span>
                  </div>
                  <div className="text-sm text-blue-800">
                    <p>A $100 item will have ${(100 * values.rate).toFixed(2)} tax</p>
                    <p>Total: ${(100 + (100 * values.rate)).toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t">
            <Button onClick={() => handleSubmit(onSubmit)}>
              Save Tax Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TaxSettings;
