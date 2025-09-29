import React from 'react';
import { 
  Search, Plus, Filter, Grid, List, Edit, Trash2, 
  Package, AlertCircle, CheckCircle 
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useGlobalState } from '../../../shared/context/GlobalStateProvider';
import { Card, Button, Input, Badge, Table } from '../../../shared/components/ui';

const ProductList = () => {
  const { state, setFilters, setSort, setView, showModal, deleteProduct } = useInventory();
  const { state: globalState } = useGlobalState();

  const filteredProducts = React.useMemo(() => {
    let products = [...globalState.products];

    // Apply search filter
    if (state.filters.searchTerm) {
      const searchLower = state.filters.searchTerm.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.barcode?.includes(searchLower)
      );
    }

    // Apply category filter
    if (state.filters.category) {
      products = products.filter(product => product.category === state.filters.category);
    }

    // Apply stock level filter
    if (state.filters.stockLevel !== 'all') {
      switch (state.filters.stockLevel) {
        case 'inStock':
          products = products.filter(product => product.stock > 5);
          break;
        case 'lowStock':
          products = products.filter(product => product.stock <= 5 && product.stock > 0);
          break;
        case 'outOfStock':
          products = products.filter(product => product.stock === 0);
          break;
      }
    }

    // Apply sorting
    products.sort((a, b) => {
      let aValue = a[state.sortBy];
      let bValue = b[state.sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (state.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return products;
  }, [globalState.products, state.filters, state.sortBy, state.sortOrder]);

  const getStockStatus = (stock, reorderLevel = 5) => {
    if (stock === 0) {
      return { status: 'Out of Stock', variant: 'error', icon: AlertCircle };
    } else if (stock <= reorderLevel) {
      return { status: 'Low Stock', variant: 'warning', icon: AlertCircle };
    }
    return { status: 'In Stock', variant: 'success', icon: CheckCircle };
  };

  const categories = [...new Set(globalState.products.map(p => p.category))].filter(Boolean);

  const handleDelete = (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProduct(product.id);
    }
  };

  const tableColumns = [
    {
      key: 'image',
      label: 'Product',
      sortable: false,
      render: (value, product) => (
        <div className="flex items-center">
          <div className="text-2xl mr-3">{product.image || '📦'}</div>
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-gray-500">{product.sku}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (value) => (
        <Badge variant="default" size="sm">
          {value || 'Uncategorized'}
        </Badge>
      )
    },
    {
      key: 'price',
      label: 'Price',
      render: (value) => `$${value.toFixed(2)}`
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (value, product) => {
        const stockStatus = getStockStatus(value, product.reorderLevel);
        const Icon = stockStatus.icon;
        return (
          <div className="flex items-center space-x-2">
            <span className="font-medium">{value}</span>
            <Icon className={`h-4 w-4 ${
              stockStatus.variant === 'error' ? 'text-red-500' :
              stockStatus.variant === 'warning' ? 'text-yellow-500' : 'text-green-500'
            }`} />
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (value, product) => {
        const stockStatus = getStockStatus(product.stock, product.reorderLevel);
        return (
          <Badge variant={stockStatus.variant} size="sm">
            {stockStatus.status}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value, product) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => showModal('Stock', product)}
            title="Adjust Stock"
          >
            <Package className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => showModal('Product', product)}
            title="Edit Product"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleDelete(product)}
            className="text-red-600 hover:text-red-800"
            title="Delete Product"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Card>
      {/* Filters and controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="flex-1 sm:w-80">
              <Input
                placeholder="Search products..."
                value={state.filters.searchTerm}
                onChange={(e) => setFilters({ searchTerm: e.target.value })}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            
            <select
              value={state.filters.category}
              onChange={(e) => setFilters({ category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={state.filters.stockLevel}
              onChange={(e) => setFilters({ stockLevel: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Stock Levels</option>
              <option value="inStock">In Stock</option>
              <option value="lowStock">Low Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView(state.view === 'grid' ? 'list' : 'grid')}
            >
              {state.view === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
            
            <Button
              onClick={() => showModal('Product')}
              icon={<Plus className="h-4 w-4" />}
            >
              Add Product
            </Button>
          </div>
        </div>
      </div>

      {/* Products display */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Products ({filteredProducts.length})
          </h3>
        </div>

        {state.view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const stockStatus = getStockStatus(product.stock, product.reorderLevel);
              return (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="text-center mb-3">
                    <div className="text-3xl mb-2">{product.image || '📦'}</div>
                    <h4 className="font-semibold text-sm mb-1">{product.name}</h4>
                    <p className="text-xs text-gray-500">{product.sku}</p>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">
                        ${product.price.toFixed(2)}
                      </span>
                      <Badge variant={stockStatus.variant} size="sm">
                        {stockStatus.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Stock: {product.stock} units
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showModal('Stock', product)}
                      className="flex-1"
                    >
                      Stock
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showModal('Product', product)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Table
            data={filteredProducts}
            columns={tableColumns}
            sortable={true}
            onSort={(key, direction) => setSort(key, direction)}
            emptyMessage="No products found"
          />
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">
              Get started by adding your first product to the inventory.
            </p>
            <Button onClick={() => showModal('Product')}>
              Add Product
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductList;
