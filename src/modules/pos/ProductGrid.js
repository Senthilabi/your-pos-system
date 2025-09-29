import React from 'react';
import { Plus } from 'lucide-react';
import { useGlobalState } from '../../../shared/context/GlobalStateProvider';
import { usePOS } from '../context/POSContext';
import { Card, Badge, Button } from '../../../shared/components/ui';

const ProductGrid = ({ searchTerm, selectedCategory }) => {
  const { state: globalState } = useGlobalState();
  const { addToCart } = usePOS();

  const filteredProducts = globalState.products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm);

    const matchesCategory = !selectedCategory || product.category === selectedCategory;

    return product.isActive && matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock) => {
    if (stock === 0) return { status: 'Out of Stock', variant: 'error' };
    if (stock <= 5) return { status: 'Low Stock', variant: 'warning' };
    return { status: 'In Stock', variant: 'success' };
  };

  return (
    <Card title={`Products (${filteredProducts.length})`} padding="small">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {filteredProducts.map(product => {
          const stockStatus = getStockStatus(product.stock);
          
          return (
            <div
              key={product.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">{product.image}</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {product.name}
                </h3>
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
                <p className="text-xs text-gray-600">
                  Stock: {product.stock} units
                </p>
              </div>

              <Button
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                size="sm"
                className="w-full"
                icon={<Plus className="h-3 w-3" />}
              >
                Add to Cart
              </Button>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No products found matching your criteria
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductGrid;
