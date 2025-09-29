import React, { useState } from 'react';
import ProductGrid from './ProductGrid';
import CartPanel from './CartPanel';
import CustomerPanel from './CustomerPanel';
import PaymentPanel from './PaymentPanel';
import ReceiptModal from './ReceiptModal';
import { Search, Filter } from 'lucide-react';
import { Input, Card } from '../../../shared/components/ui';
import { useDebounce } from '../../../shared/hooks';

const POSLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Left side - Products */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and filters */}
          <Card padding="small">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search products by name, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="Beverages">Beverages</option>
                <option value="Confectionery">Confectionery</option>
                <option value="Groceries">Groceries</option>
                <option value="Spices">Spices</option>
                <option value="Dairy">Dairy</option>
                <option value="Oils">Oils</option>
              </select>
            </div>
          </Card>

          {/* Products grid */}
          <ProductGrid 
            searchTerm={debouncedSearchTerm}
            selectedCategory={selectedCategory}
          />
        </div>

        {/* Right side - Cart and checkout */}
        <div className="space-y-4">
          <CustomerPanel />
          <CartPanel />
          <PaymentPanel />
        </div>
      </div>

      <ReceiptModal />
    </div>
  );
};

export default POSLayout;
