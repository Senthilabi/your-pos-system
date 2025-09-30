import React from 'react';
import { Users, Award, TrendingUp, Star } from 'lucide-react';
import { useCustomers } from '../context/CustomerContext';
import { Card } from '../../../shared/components/ui';

const CustomerDashboard = () => {
  const { state } = useCustomers();
  const { loyaltyStats } = state;

  const statCards = [
    {
      title: 'Total Customers',
      value: loyaltyStats.totalCustomers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Loyalty Points',
      value: loyaltyStats.totalPoints.toLocaleString(),
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'VIP Customers',
      value: loyaltyStats.tierDistribution.VIP || 0,
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Active This Month',
      value: state.customers.filter(c => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return c.lastVisit && new Date(c.lastVisit) > lastMonth;
      }).length,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const tierColors = {
    Bronze: 'bg-orange-100 text-orange-800',
    Silver: 'bg-gray-100 text-gray-800',
    Gold: 'bg-yellow-100 text-yellow-800',
    VIP: 'bg-purple-100 text-purple-800'
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600">Manage customer relationships and loyalty programs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} padding="normal">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Customer Tier Distribution" padding="normal">
          <div className="space-y-3">
            {Object.entries(loyaltyStats.tierDistribution).map(([tier, count]) => (
              <div key={tier} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${tierColors[tier]}`}>
                    {tier}
                  </span>
                </div>
                <span className="text-lg font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent Activity" padding="normal">
          <div className="space-y-3">
            {state.customers
              .sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit))
              .slice(0, 5)
              .map(customer => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-500">
                      {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${tierColors[customer.tier || 'Bronze']}`}>
                    {customer.tier || 'Bronze'}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDashboard;
