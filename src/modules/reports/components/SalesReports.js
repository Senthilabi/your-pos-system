import React, { useEffect } from 'react';
import { useReports } from '../context/ReportsContext';
import { Card } from '../../../shared/components/ui';

const SalesReports = () => {
  const { state, generateSalesReport } = useReports();

  useEffect(() => {
    generateSalesReport();
  }, [state.dateRange]);

  const salesData = state.reportData.sales;

  if (!salesData) {
    return (
      <div className="text-center py-12">
        <p>Loading sales report...</p>
      </div>
    );
  }

  const { summary, dailySales, paymentMethods, hourlySales } = salesData;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="normal">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">
              ${summary.totalRevenue.toFixed(2)}
            </p>
          </div>
        </Card>
        
        <Card padding="normal">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-3xl font-bold text-blue-600">
              {summary.totalTransactions}
            </p>
          </div>
        </Card>
        
        <Card padding="normal">
          <div className="text-center">
            <p className="text-sm text-gray-600">Average Order Value</p>
            <p className="text-3xl font-bold text-purple-600">
              ${summary.averageOrderValue.toFixed(2)}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales */}
        <Card title="Daily Sales Breakdown" padding="normal">
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {dailySales.map(day => (
              <div key={day.date} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">{day.transactions} transactions</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${day.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{day.items} items</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment Methods */}
        <Card title="Payment Method Breakdown" padding="normal">
          <div className="space-y-3">
            {Object.entries(paymentMethods).map(([method, data]) => (
              <div key={method} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium capitalize">{method}</p>
                  <p className="text-sm text-gray-500">{data.count} transactions</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${data.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    {((data.total / summary.totalRevenue) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Hourly Sales Pattern */}
      {hourlySales.length > 0 && (
        <Card title="Peak Hours Analysis" padding="normal">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {hourlySales.map(hour => (
              <div key={hour.hour} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{hour.hour}:00</p>
                <p className="text-sm text-green-600">${hour.revenue.toFixed(0)}</p>
                <p className="text-xs text-gray-500">{hour.transactions} sales</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SalesReports;
