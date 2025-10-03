import React, { useState } from 'react';
import { User, Search, X } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { useGlobalState } from '../../../shared/context/GlobalStateProvider';
import { Card, Button, Input, Modal } from '../../../shared/components/ui';

const CustomerPanel = () => {
  const { state, selectCustomer } = usePOS();
  const { state: globalState } = useGlobalState();
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  const filteredCustomers = globalState.customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleSelectCustomer = (customer) => {
    selectCustomer(customer);
    setShowCustomerModal(false);
    setCustomerSearch('');
  };

  return (
    <>
      <Card title="Customer" padding="small">
        {state.selectedCustomer ? (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-blue-900">
                  {state.selectedCustomer.name}
                </p>
                <p className="text-sm text-blue-700">
                  {state.selectedCustomer.phone}
                </p>
                <p className="text-sm text-blue-600">
                  Points: {state.selectedCustomer.points || 0}
                </p>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => selectCustomer(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowCustomerModal(true)}
            icon={<User className="h-4 w-4" />}
          >
            Select Customer (Optional)
          </Button>
        )}
      </Card>

      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Select Customer"
        size="md"
      >
        <div className="space-y-4">
          <Input
            placeholder="Search customers..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />

          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredCustomers.map(customer => (
              <div
                key={customer.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSelectCustomer(customer)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                    <p className="text-xs text-blue-600">
                      {customer.tier} • {customer.points || 0} points
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {filteredCustomers.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No customers found
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CustomerPanel;
