import React from 'react';
import { 
  DollarSign, ShoppingCart, Package, Users, 
  TrendingUp, TrendingDown, Award, AlertTriangle,
  Calendar, Clock, Star
} from 'lucide-react';
import { useReports } from '../context/ReportsContext';
import { Card, Badge, Table } from '../../../shared/components/ui';

const ReportsDashboard = () => {
  const { state } = useReports();
  const { dashboardData } = state;

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `${(dashboardData.salesOverview?.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+12.5%'
    },
    {
      title: 'Transactions',
      value: dashboardData.salesOverview?.totalTransactions || 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+8.2%'
    },
    {
      title: 'Avg Order Value',
      value: `${(dashboardData.salesOverview?.averageOrderValue || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '+5.1%'
    },
    {
      title: 'Items Sold',
      value: dashboardData.salesOverview?.totalItems || 0,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: '+15.3%'
    }
  ];

  const customerKpis = [
    {
      title: 'Total Customers',
      value: dashboardData.customerInsights?.totalCustomers || 0,
      icon: Users,
      color: 'text-cyan-600'
    },
    {
      title: 'Returning Customers',
      value: dashboardData.customerInsights?.returningCustomers || 0,
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      title: 'New Customers',
      value: dashboardData.customerInsights?.newCustomers || 0,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Points Awarded',
      value: dashboardData.customerInsights?.loyaltyPointsAwarded || 0,
      icon: Award,
      color: 'text-purple-600'
    }
  ];

  const inventoryKpis = [
    {
      title: 'Total Products',
      value: dashboardData.inventoryStatus?.totalProducts || 0,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Stock Value',
      value: `${(dashboardData.inventoryStatus?.totalStockValue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Low Stock Items',
      value: dashboardData.inventoryStatus?.lowStockItems || 0,
      icon: AlertTriangle,
      color: 'text-yellow-600'
    },
    {
      title: 'Out of Stock',
      value: dashboardData.inventoryStatus?.outOfStockItems || 0,
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ];

  const transactionColumns = [
    {
      key: 'id',
      label: 'Transaction ID',
      render: (value) => (
        <span className="font-mono text-sm">{value.slice(-6)}</span>
      )
    },
    {
      key: 'timestamp',
      label: 'Time',
      render: (value) => new Date(value).toLocaleTimeString()
    },
    {
      key: 'customerId',
      label: 'Customer',
      render: (value, transaction) => 
        value ? 'Registered' : 'Walk-in'
    },
    {
      key: 'total',
      label: 'Amount',
      render: (value) => (
        <span className="font-semibold text-green-600">
          ${value.toFixed(2)}
        </span>
      )
    },
    {
      key: 'paymentMethod',
      label: 'Payment',
      render: (value) => (
        <Badge variant="default" size="sm" className="capitalize">
          {value}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Sales KPIs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} padding="normal">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                    {kpi.trend && (
                      <p className="text-sm text-green-600 mt-1">{kpi.trend} vs last period</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card title="Top Selling Products" padding="normal">
          <div className="space-y-3">
            {(dashboardData.topProducts || []).slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.productName}</p>
                  <p className="text-sm text-gray-500">
                    {product.quantity} units sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    ${product.revenue.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            {(!dashboardData.topProducts || dashboardData.topProducts.length === 0) && (
              <p className="text-gray-500 text-center py-4">No sales data available</p>
            )}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card title="Recent Transactions" padding="normal">
          <div className="max-h-80 overflow-y-auto">
            <Table
              data={dashboardData.recentTransactions || []}
              columns={transactionColumns}
              emptyMessage="No recent transactions"
            />
          </div>
        </Card>
      </div>

      {/* Customer & Inventory Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Customer Insights" padding="normal">
          <div className="grid grid-cols-2 gap-4">
            {customerKpis.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                  <Icon className={`h-6 w-6 ${kpi.color} mx-auto mb-2`} />
                  <p className="text-lg font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-xs text-gray-600">{kpi.title}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Inventory Status" padding="normal">
          <div className="grid grid-cols-2 gap-4">
            {inventoryKpis.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                  <Icon className={`h-6 w-6 ${kpi.color} mx-auto mb-2`} />
                  <p className="text-lg font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-xs text-gray-600">{kpi.title}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsDashboard;
