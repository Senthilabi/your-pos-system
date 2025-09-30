import React, { useEffect } from 'react';
import { useReports } from '../context/ReportsContext';
import { Card, Badge, Table } from '../../../shared/components/ui';

const CustomerReports = () => {
  const { state, generateCustomerReport } = useReports();

  useEffect(() => {
    generateCustomerReport();
  }, [state.dateRange]);

  const customerData = state.reportData.customer;

  if (!customerData) {
    return (
      <div className="text-center py-12">
        <p>Loading customer report...</p>
      </div>
    );
  }

  const { summary, tierAnalysis, topCustomers, loyalCustomers } = customerData;

  const customerColumns = [
    {
      key: 'name',
      label: 'Customer',
      render: (value, customer) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-gray-500">{customer.customerNumber}</p>
        </div>
      )
    },
    {
      key: 'tier',
      label: 'Tier',
      render: (value) => {
        const colors = {
          Bronze: 'default',
          Silver: 'info',
          Gold: 'warning',
          VIP: 'error'
        };
        return (
          <Badge variant={colors[value]} size="sm">{value}</Badge>
        );
      }
    },
    {
      key: 'totalSpentInPeriod',
      label: 'Spent (Period)',
      render: (value) => `${(value || 0).toFixed(2)}`
    },
    {
      key: 'ordersInPeriod',
      label: 'Orders',
      render: (value) => value || 0
    },
    {
      key: 'avgOrderValueInPeriod',
      label: 'Avg Order',
      render: (value) => `${(value || 0).toFixed(2)}`
    },
    {
      key: 'points',
      label: 'Points',
      render: (value) => value || 0
    }
  ];

  const tierColors = {
    Bronze: 'bg-orange-100 text-orange-800',
    Silver: 'bg-gray-100 text-gray-800',
    Gold: 'bg-yellow-100 text-yellow-800',
    VIP: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="normal">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Customers</p>
            <p className="text-2xl font-bold text-blue-600">{summary.totalCustomers}</p>
          </div>
        </Card>
        
        <Card padding="normal">
          <div className="text-center">
            <p className="text-sm text-gray-600">Active Customers</p>
            <p className="text-2xl font-bold text-green-600">{summary.activeCustomers}</p>
          </div>
        </Card>
        
        <Card padding="normal">
          <div className="text-center">
            <p className="text-sm text-gray-600">New Customers</p>
            <p className="text-2xl font-bold text-purple-600">{summary.newCustomers}</p>
          </div>
        </Card>
        
        <Card padding="normal">
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg Order Value</p>
            <p className="text-2xl font-bold text-orange-600">
              ${summary.averageOrderValue.toFixed(2)}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Analysis */}
        <Card title="Customer Tier Analysis" padding="normal">
          <div className="space-y-4">
            {Object.entries(tierAnalysis).map(([tier, data]) => (
              <div key={tier} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${tierColors[tier]}`}>
                    {tier} ({data.count})
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    ${data.totalSpent.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Average spend per customer: ${data.avgSpent.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Customers by Spending */}
        <Card title="Top Customers (This Period)" padding="normal">
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {topCustomers.slice(0, 8).map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{customer.name}</p>
                    <Badge variant="default" size="sm">{customer.tier}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    ${customer.totalSpentInPeriod.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {customer.ordersInPeriod} orders
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detailed Customer Analysis */}
      <Card title="Customer Performance Details" padding="small">
        <Table
          data={topCustomers.slice(0, 20)}
          columns={customerColumns}
          sortable={true}
          emptyMessage="No customer data available"
        />
      </Card>
    </div>
  );
};

export default CustomerReports;