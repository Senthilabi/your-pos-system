import React from 'react';
import { Calendar, Download, RefreshCw, BarChart3 } from 'lucide-react';
import { useReports } from '../context/ReportsContext';
import { Card, Button, Input } from '../../../shared/components/ui';

const ReportFilters = () => {
  const { state, setDateRange, setSelectedReport, exportReport } = useReports();

  const reportTypes = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'sales', name: 'Sales Reports', icon: BarChart3 },
    { id: 'inventory', name: 'Inventory Reports', icon: BarChart3 },
    { id: 'customer', name: 'Customer Reports', icon: BarChart3 }
  ];

  const datePresets = [
    {
      label: 'Today',
      getValue: () => ({
        start: new Date(new Date().setHours(0, 0, 0, 0)),
        end: new Date(new Date().setHours(23, 59, 59, 999))
      })
    },
    {
      label: 'Yesterday',
      getValue: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          start: new Date(yesterday.setHours(0, 0, 0, 0)),
          end: new Date(yesterday.setHours(23, 59, 59, 999))
        };
      }
    },
    {
      label: 'This Week',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.setDate(now.getDate() - now.getDay()));
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
    },
    {
      label: 'This Month',
      getValue: () => ({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date()
      })
    },
    {
      label: 'Last 30 Days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return { start, end };
      }
    }
  ];

  const handlePresetSelect = (preset) => {
    const { start, end } = preset.getValue();
    setDateRange(start, end);
  };

  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleStartDateChange = (e) => {
    const newStart = new Date(e.target.value);
    setDateRange(newStart, state.dateRange.end);
  };

  const handleEndDateChange = (e) => {
    const newEnd = new Date(e.target.value);
    newEnd.setHours(23, 59, 59, 999);
    setDateRange(state.dateRange.start, newEnd);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Business insights and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportReport(state.selectedReport, 'csv')}
            icon={<Download className="h-4 w-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <Card padding="small">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Type Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Report Type</h3>
            <div className="space-y-1">
              {reportTypes.map(report => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    state.selectedReport === report.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {report.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Date Range</h3>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={formatDateForInput(state.dateRange.start)}
                  onChange={handleStartDateChange}
                  size="sm"
                />
                <Input
                  type="date"
                  value={formatDateForInput(state.dateRange.end)}
                  onChange={handleEndDateChange}
                  size="sm"
                />
              </div>
              
              <div className="flex flex-wrap gap-1">
                {datePresets.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetSelect(preset)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Stats</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Period:</span>
                <span className="font-medium">
                  {Math.ceil((state.dateRange.end - state.dateRange.start) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue:</span>
                <span className="font-medium text-green-600">
                  ${state.dashboardData.salesOverview?.totalRevenue?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transactions:</span>
                <span className="font-medium">
                  {state.dashboardData.salesOverview?.totalTransactions || 0}
                </span>
              </div>
              {state.lastUpdated && (
                <div className="text-xs text-gray-500 pt-1">
                  Updated: {state.lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportFilters;
