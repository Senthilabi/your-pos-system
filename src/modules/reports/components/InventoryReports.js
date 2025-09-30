import React, { useEffect } from 'react';
import { useReports } from '../context/ReportsContext';
import { Card, Badge, Table } from '../../../shared/components/ui';

const InventoryReports = () => {
  const { state, generateInventoryReport } = useReports();

  useEffect(() => {
    generateInventoryReport();
  }, [state.dateRange]);

  const inventoryData = state.reportData.inventory;

  if (!inventoryData) {
    return (
      <div className="text-center py-12">
        <p>Loading inventory report...</p>
      </div>
    );
  }

  const { summary, categoryAnalysis, topSellingProducts, mostProfitableProducts } = inventoryData;

  const productColumns = [
    {
      key: 'name',
      label: 'Product',
      render: (value, product) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-gray-500">{product.sku}</p>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (value) => (
        <Badge variant="default" size="sm">{value || 'Uncategorized'}</Badge>
      )
    },
    {
      key: 'stock',
      label: 'Current Stock',
      render: (value) => (
        <span className={value <= 5 ? 'text-red-600 font-medium' : ''}>{value}</span>
      )
    },
    {
      key: 'salesInPeriod',
      label: 'Sold',
      render: (value) => value || 0
    },
    {
      key: 'revenueInPeriod',
      label: 'Revenue',
      render: (value) => `${(value || 0).toFixed(2)}`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="normal">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Products</p>
            <p className="text-2xl font-bold text-blue-600">{summary.totalProducts}</p>
          </div>
        </Card>
        
        <Card padding="normal">
          <div className="text-center">
            <p className="text-sm text-gray-600">Stock Value</p>
            <p className="text-2xl font-bold text-green-600">
              ${summary.totalStockValue.toFixed(2)}
            </p>
          </div>
        </Card>
        
        <Card padding="normal">
          <div className="text-center">
            <p className="text-sm text-gray-600">Low Stock Items</p>
            <p className="text-2xl font-bold text-yellow-600">{summary.lowStockItems}</p>
          </div>
        </Card>
        
        <Card padding="normal">
          <div className="text-center">
            <p className="text-sm text-gray-600">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">{summary.outOfStockItems}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Analysis */}
        <Card title="Category Performance" padding="normal">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {categoryAnalysis.map(category => (
              <div key={category.category} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{category.category}</h4>
                  <Badge variant="default" size="sm">{category.products} products</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Stock Value</p>
                    <p className="font-medium">${category.totalValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Revenue</p>
                    <p className="font-medium text-green-600">${category.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Selling Products */}
        <Card title="Top Selling Products" padding="normal">
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {topSellingProducts.slice(0, 8).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{product.salesInPeriod} sold</p>
                  <p className="text-xs text-green-600">${product.revenueInPeriod.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detailed Product Performance */}
      <Card title="Product Performance Details" padding="small">
        <Table
          data={mostProfitableProducts.slice(0, 20)}
          columns={productColumns}
          sortable={true}
          emptyMessage="No product data available"
        />
      </Card>
    </div>
  );
};

export default InventoryReports;
