import React, { useRef } from 'react';
import { Download, Upload, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { Card, Button, Badge } from '../../../shared/components/ui';

const DataManagement = () => {
  const { state, createBackup, restoreBackup } = useSettings();
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (window.confirm('Are you sure you want to restore from this backup? This will replace all current data.')) {
        restoreBackup(file);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Data Management</h2>
        <p className="text-gray-600">Backup and restore your POS system data</p>
      </div>

      {/* Backup Actions */}
      <Card title="Backup & Restore" padding="normal">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Download className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Create Backup</h3>
                <p className="text-sm text-blue-700">
                  Download a complete backup of your POS data
                </p>
              </div>
            </div>
            <Button
              onClick={createBackup}
              loading={state.isLoading}
              icon={<Download className="h-4 w-4" />}
            >
              Create Backup
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Upload className="h-8 w-8 text-orange-600" />
              <div>
                <h3 className="font-medium text-orange-900">Restore Backup</h3>
                <p className="text-sm text-orange-700">
                  Restore your system from a backup file
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={state.isLoading}
              icon={<Upload className="h-4 w-4" />}
            >
              Select File
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Important Notice</h4>
                <p className="text-sm text-red-800 mt-1">
                  Restoring a backup will completely replace all current data. 
                  Make sure to create a backup of your current data before restoring.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Backup History */}
      <Card title="Backup History" padding="normal">
        <div className="space-y-3">
          {state.backupHistory.length > 0 ? (
            state.backupHistory.map(backup => (
              <div key={backup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {backup.timestamp.toLocaleDateString()} at {backup.timestamp.toLocaleTimeString()}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{backup.duration}</span>
                      </span>
                      <span>{backup.size}</span>
                      <Badge 
                        variant={backup.type === 'automatic' ? 'info' : 'default'} 
                        size="sm"
                      >
                        {backup.type}
                      </Badge>
                      <Badge 
                        variant={backup.status === 'completed' ? 'success' : 'error'} 
                        size="sm"
                      >
                        {backup.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No backup history available</p>
            </div>
          )}
        </div>
      </Card>

      {/* Data Statistics */}
      <Card title="Data Overview" padding="normal">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">1,234</p>
            <p className="text-sm text-blue-800">Total Records</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">2.4 MB</p>
            <p className="text-sm text-green-800">Data Size</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">45</p>
            <p className="text-sm text-purple-800">Active Products</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">123</p>
            <p className="text-sm text-orange-800">Customers</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DataManagement;