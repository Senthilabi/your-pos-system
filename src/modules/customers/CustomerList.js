import React from 'react';
import { 
  Search, Plus, Grid, List, Edit, Trash2, Award, 
  User, Mail, Phone, Calendar, TrendingUp 
} from 'lucide-react';
import { useCustomers } from '../context/CustomerContext';
import { Card, Button, Input, Badge, Table } from '../../../shared/components/ui';

const CustomerList = () => {
  const { 
    state, 
    setFilters, 
    setSort, 
    setView, 
    showModal, 
    deleteCustomer, 
    selectCustomer 
  } = useCustomers();

  const filteredCustomers = React.useMemo(() => {
    let customers = [...state.customers];

    // Apply search filter
    if (state.filters.searchTerm) {
      const searchLower = state.filters.searchTerm.toLowerCase();
      customers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(searchLower) ||
        customer.customerNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Apply tier filter
    if (state.filters.tier) {
      customers = customers.filter(customer => customer.tier === state.filters.tier);
    }

    // Apply status filter
    if (state.filters.status !== 'all') {
      customers = customers.filter(customer => 
        state.filters.status === 'active' ? customer.isActive : !customer.isActive
      );
    }

    // Apply sorting
    customers.sort((a, b) => {
      let aValue = a[state.sortBy] || '';
      let bValue = b[state.sortBy] || '';
      
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

    return customers;
  }, [state.customers, state.filters, state.sortBy, state.sortOrder]);

  const tierColors = {
    Bronze: 'default',
    Silver: 'info',
    Gold: 'warning',
    VIP: 'error'
  };

  const handleDelete = (customer) => {
    if (window.confirm(`Are you sure you want to delete "${customer.name}"?`)) {
      deleteCustomer(customer.id);
    }
  };

  const tableColumns = [
    {
      key: 'name',
      label: 'Customer',
      render: (value, customer) => (
        <div className="flex items-center">
          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <div className="font-medium">{customer.name}</div>
            <div className="text-sm text-gray-500">{customer.customerNumber}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      sortable: false,
      render: (value, customer) => (
        <div>
          <div className="flex items-center text-sm">
            <Mail className="h-3 w-3 mr-1" />
            {customer.email || 'N/A'}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Phone className="h-3 w-3 mr-1" />
            {customer.phone || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'tier',
      label: 'Tier',
      render: (value, customer) => (
        <Badge variant={tierColors[customer.tier || 'Bronze']}>
          {customer.tier || 'Bronze'}
        </Badge>
      )
    },
    {
      key: 'points',
      label: 'Points',
      render: (value) => (
        <div className="flex items-center">
          <Award className="h-4 w-4 text-yellow-500 mr-1" />
          {value || 0}
        </div>
      )
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      render: (value) => `$${(value || 0).toFixed(2)}`
    },
    {
      key: 'totalOrders',
      label: 'Orders',
      render: (value) => value || 0
    },
    {
      key: 'lastVisit',
      label: 'Last Visit',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'Never'
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value, customer) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => showModal('Loyalty', customer)}
            title="Manage Loyalty"
          >
            <Award className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => showModal('Customer', customer)}
            title="Edit Customer"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleDelete(customer)}
            className="text-red-600 hover:text-red-800"
            title="Delete Customer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const tiers = ['Bronze', 'Silver', 'Gold', 'VIP'];

  return (
    <Card>
      {/* Filters and controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="flex-1 sm:w-80">
              <Input
                placeholder="Search customers..."
                value={state.filters.searchTerm}
                onChange={(e) => setFilters({ searchTerm: e.target.value })}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            
            <select
              value={state.filters.tier}
              onChange={(e) => setFilters({ tier: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Tiers</option>
              {tiers.map(tier => (
                <option key={tier} value={tier}>{tier}</option>
              ))}
            </select>

            <select
              value={state.filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="all">All</option>
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
              onClick={() => showModal('Customer')}
              icon={<Plus className="h-4 w-4" />}
            >
              Add Customer
            </Button>
          </div>
        </div>
      </div>

      {/* Customers display */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Customers ({filteredCustomers.length})
          </h3>
        </div>

        {state.view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map(customer => (
              <div
                key={customer.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => selectCustomer(customer)}
              >
                <div className="flex items-center mb-3">
                  <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{customer.name}</h4>
                    <p className="text-sm text-gray-500">{customer.customerNumber}</p>
                  </div>
                  <Badge variant={tierColors[customer.tier || 'Bronze']} size="sm">
                    {customer.tier || 'Bronze'}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-yellow-500 mr-2" />
                    <span>{customer.points || 0} points</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                    <span>${(customer.totalSpent || 0).toFixed(2)} spent</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                    <span>
                      {customer.lastVisit 
                        ? new Date(customer.lastVisit).toLocaleDateString()
                        : 'Never visited'
                      }
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      showModal('Loyalty', customer);
                    }}
                    className="flex-1"
                  >
                    Loyalty
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      showModal('Customer', customer);
                    }}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table
            data={filteredCustomers}
            columns={tableColumns}
            sortable={true}
            onSort={(key, direction) => setSort(key, direction)}
            emptyMessage="No customers found"
          />
        )}

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500 mb-4">
              Start building your customer base by adding your first customer.
            </p>
            <Button onClick={() => showModal('Customer')}>
              Add Customer
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CustomerList;
