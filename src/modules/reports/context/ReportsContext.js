import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useGlobalState } from '../../../shared/context/GlobalStateProvider';
import { useEventBus } from '../../../shared/services/EventBusService';

const ReportsContext = createContext();

const initialState = {
  dateRange: {
    start: new Date(new Date().setHours(0, 0, 0, 0)),
    end: new Date(new Date().setHours(23, 59, 59, 999))
  },
  selectedReport: 'dashboard',
  filters: {
    category: '',
    paymentMethod: '',
    customer: '',
    cashier: ''
  },
  dashboardData: {
    salesOverview: {},
    topProducts: [],
    recentTransactions: [],
    customerInsights: {},
    inventoryStatus: {}
  },
  reportData: {},
  isLoading: false,
  lastUpdated: null
};

const reportsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    
    case 'SET_SELECTED_REPORT':
      return { ...state, selectedReport: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case 'SET_DASHBOARD_DATA':
      return { ...state, dashboardData: action.payload };
    
    case 'SET_REPORT_DATA':
      return { ...state, reportData: { ...state.reportData, [action.reportType]: action.payload } };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: new Date() };
    
    default:
      return state;
  }
};

export const ReportsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reportsReducer, initialState);
  const { state: globalState } = useGlobalState();
  const { on } = useEventBus();

  // Listen for data changes to refresh reports
  useEffect(() => {
    const unsubscribeTransaction = on('transaction:completed', () => {
      generateDashboardData();
    });

    const unsubscribeInventory = on('inventory:updated', () => {
      generateDashboardData();
    });

    return () => {
      unsubscribeTransaction();
      unsubscribeInventory();
    };
  }, []);

  // Generate dashboard data when global state changes
  useEffect(() => {
    generateDashboardData();
  }, [globalState.transactions, globalState.products, globalState.customers, state.dateRange]);

  const generateDashboardData = () => {
    const { transactions, products, customers } = globalState;
    const { start, end } = state.dateRange;

    // Filter transactions by date range
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.timestamp);
      return transactionDate >= start && transactionDate <= end;
    });

    // Sales Overview
    const salesOverview = {
      totalRevenue: filteredTransactions.reduce((sum, t) => sum + t.total, 0),
      totalTransactions: filteredTransactions.length,
      averageOrderValue: filteredTransactions.length > 0 
        ? filteredTransactions.reduce((sum, t) => sum + t.total, 0) / filteredTransactions.length 
        : 0,
      totalItems: filteredTransactions.reduce((sum, t) => 
        sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      )
    };

    // Top Products Analysis
    const productSales = {};
    filteredTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productName: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.total;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Recent Transactions
    const recentTransactions = filteredTransactions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    // Customer Insights
    const customerInsights = {
      totalCustomers: customers.length,
      returningCustomers: filteredTransactions.filter(t => t.customerId).length,
      newCustomers: customers.filter(c => {
        const customerDate = new Date(c.createdAt);
        return customerDate >= start && customerDate <= end;
      }).length,
      loyaltyPointsAwarded: filteredTransactions.reduce((sum, t) => {
        if (t.customerId) {
          return sum + Math.floor(t.total * (globalState.settings?.loyalty?.pointsPerDollar || 1));
        }
        return sum;
      }, 0)
    };

    // Inventory Status
    const inventoryStatus = {
      totalProducts: products.length,
      lowStockItems: products.filter(p => p.stock <= (p.reorderLevel || 5)).length,
      outOfStockItems: products.filter(p => p.stock === 0).length,
      totalStockValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
    };

    dispatch({
      type: 'SET_DASHBOARD_DATA',
      payload: {
        salesOverview,
        topProducts,
        recentTransactions,
        customerInsights,
        inventoryStatus
      }
    });

    dispatch({ type: 'SET_LAST_UPDATED' });
  };

  const generateSalesReport = () => {
    const { transactions } = globalState;
    const { start, end } = state.dateRange;

    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.timestamp);
      return transactionDate >= start && transactionDate <= end;
    });

    // Daily sales breakdown
    const dailySales = {};
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailySales[dateKey] = {
        date: dateKey,
        revenue: 0,
        transactions: 0,
        items: 0
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    filteredTransactions.forEach(transaction => {
      const dateKey = new Date(transaction.timestamp).toISOString().split('T')[0];
      if (dailySales[dateKey]) {
        dailySales[dateKey].revenue += transaction.total;
        dailySales[dateKey].transactions += 1;
        dailySales[dateKey].items += transaction.items.reduce((sum, item) => sum + item.quantity, 0);
      }
    });

    // Payment method breakdown
    const paymentMethods = {};
    filteredTransactions.forEach(transaction => {
      const method = transaction.paymentMethod;
      if (!paymentMethods[method]) {
        paymentMethods[method] = { count: 0, total: 0 };
      }
      paymentMethods[method].count += 1;
      paymentMethods[method].total += transaction.total;
    });

    // Hourly sales pattern
    const hourlySales = Array(24).fill(0).map((_, hour) => ({
      hour,
      revenue: 0,
      transactions: 0
    }));

    filteredTransactions.forEach(transaction => {
      const hour = new Date(transaction.timestamp).getHours();
      hourlySales[hour].revenue += transaction.total;
      hourlySales[hour].transactions += 1;
    });

    const salesReport = {
      summary: {
        totalRevenue: filteredTransactions.reduce((sum, t) => sum + t.total, 0),
        totalTransactions: filteredTransactions.length,
        averageOrderValue: filteredTransactions.length > 0 
          ? filteredTransactions.reduce((sum, t) => sum + t.total, 0) / filteredTransactions.length 
          : 0
      },
      dailySales: Object.values(dailySales),
      paymentMethods,
      hourlySales: hourlySales.filter(h => h.revenue > 0)
    };

    dispatch({ type: 'SET_REPORT_DATA', reportType: 'sales', payload: salesReport });
    return salesReport;
  };

  const generateInventoryReport = () => {
    const { products, transactions } = globalState;
    const { start, end } = state.dateRange;

    // Product performance
    const productPerformance = products.map(product => {
      const salesInPeriod = transactions
        .filter(t => {
          const transactionDate = new Date(t.timestamp);
          return transactionDate >= start && transactionDate <= end;
        })
        .reduce((sum, transaction) => {
          const productSales = transaction.items
            .filter(item => item.productId === product.id)
            .reduce((itemSum, item) => itemSum + item.quantity, 0);
          return sum + productSales;
        }, 0);

      const revenueInPeriod = transactions
        .filter(t => {
          const transactionDate = new Date(t.timestamp);
          return transactionDate >= start && transactionDate <= end;
        })
        .reduce((sum, transaction) => {
          const productRevenue = transaction.items
            .filter(item => item.productId === product.id)
            .reduce((itemSum, item) => itemSum + item.total, 0);
          return sum + productRevenue;
        }, 0);

      return {
        ...product,
        salesInPeriod,
        revenueInPeriod,
        stockValue: product.price * product.stock,
        profitMargin: product.price > 0 ? ((product.price - product.cost) / product.price) * 100 : 0
      };
    });

    // Category analysis
    const categoryAnalysis = {};
    productPerformance.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!categoryAnalysis[category]) {
        categoryAnalysis[category] = {
          products: 0,
          totalStock: 0,
          totalValue: 0,
          totalSales: 0,
          totalRevenue: 0
        };
      }
      categoryAnalysis[category].products += 1;
      categoryAnalysis[category].totalStock += product.stock;
      categoryAnalysis[category].totalValue += product.stockValue;
      categoryAnalysis[category].totalSales += product.salesInPeriod;
      categoryAnalysis[category].totalRevenue += product.revenueInPeriod;
    });

    const inventoryReport = {
      summary: {
        totalProducts: products.length,
        totalStockValue: productPerformance.reduce((sum, p) => sum + p.stockValue, 0),
        lowStockItems: products.filter(p => p.stock <= (p.reorderLevel || 5)).length,
        outOfStockItems: products.filter(p => p.stock === 0).length
      },
      productPerformance: productPerformance.sort((a, b) => b.revenueInPeriod - a.revenueInPeriod),
      categoryAnalysis: Object.entries(categoryAnalysis).map(([category, data]) => ({
        category,
        ...data
      })),
      topSellingProducts: productPerformance
        .sort((a, b) => b.salesInPeriod - a.salesInPeriod)
        .slice(0, 10),
      mostProfitableProducts: productPerformance
        .sort((a, b) => b.revenueInPeriod - a.revenueInPeriod)
        .slice(0, 10)
    };

    dispatch({ type: 'SET_REPORT_DATA', reportType: 'inventory', payload: inventoryReport });
    return inventoryReport;
  };

  const generateCustomerReport = () => {
    const { customers, transactions } = globalState;
    const { start, end } = state.dateRange;

    const customerAnalysis = customers.map(customer => {
      const customerTransactions = transactions.filter(t => 
        t.customerId === customer.id &&
        new Date(t.timestamp) >= start &&
        new Date(t.timestamp) <= end
      );

      const totalSpentInPeriod = customerTransactions.reduce((sum, t) => sum + t.total, 0);
      const ordersInPeriod = customerTransactions.length;

      return {
        ...customer,
        totalSpentInPeriod,
        ordersInPeriod,
        avgOrderValueInPeriod: ordersInPeriod > 0 ? totalSpentInPeriod / ordersInPeriod : 0,
        lastOrderDate: customerTransactions.length > 0 
          ? new Date(Math.max(...customerTransactions.map(t => new Date(t.timestamp))))
          : null
      };
    });

    // Tier analysis
    const tierAnalysis = {
      Bronze: { count: 0, totalSpent: 0, avgSpent: 0 },
      Silver: { count: 0, totalSpent: 0, avgSpent: 0 },
      Gold: { count: 0, totalSpent: 0, avgSpent: 0 },
      VIP: { count: 0, totalSpent: 0, avgSpent: 0 }
    };

    customerAnalysis.forEach(customer => {
      const tier = customer.tier || 'Bronze';
      if (tierAnalysis[tier]) {
        tierAnalysis[tier].count += 1;
        tierAnalysis[tier].totalSpent += customer.totalSpentInPeriod;
      }
    });

    Object.keys(tierAnalysis).forEach(tier => {
      if (tierAnalysis[tier].count > 0) {
        tierAnalysis[tier].avgSpent = tierAnalysis[tier].totalSpent / tierAnalysis[tier].count;
      }
    });

    const customerReport = {
      summary: {
        totalCustomers: customers.length,
        activeCustomers: customerAnalysis.filter(c => c.ordersInPeriod > 0).length,
        newCustomers: customers.filter(c => {
          const customerDate = new Date(c.createdAt);
          return customerDate >= start && customerDate <= end;
        }).length,
        averageOrderValue: customerAnalysis.length > 0 
          ? customerAnalysis.reduce((sum, c) => sum + c.avgOrderValueInPeriod, 0) / customerAnalysis.length 
          : 0
      },
      customerAnalysis: customerAnalysis.sort((a, b) => b.totalSpentInPeriod - a.totalSpentInPeriod),
      tierAnalysis,
      topCustomers: customerAnalysis
        .sort((a, b) => b.totalSpentInPeriod - a.totalSpentInPeriod)
        .slice(0, 10),
      loyalCustomers: customerAnalysis
        .filter(c => c.totalOrders >= 5)
        .sort((a, b) => b.totalOrders - a.totalOrders)
        .slice(0, 10)
    };

    dispatch({ type: 'SET_REPORT_DATA', reportType: 'customer', payload: customerReport });
    return customerReport;
  };

  const setDateRange = (start, end) => {
    dispatch({ type: 'SET_DATE_RANGE', payload: { start, end } });
  };

  const setSelectedReport = (report) => {
    dispatch({ type: 'SET_SELECTED_REPORT', payload: report });
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const exportReport = (reportType, format = 'csv') => {
    const reportData = state.reportData[reportType] || state.dashboardData;
    
    if (format === 'csv') {
      // Convert data to CSV format
      const csvData = convertToCSV(reportData);
      downloadFile(csvData, `${reportType}_report.csv`, 'text/csv');
    } else if (format === 'json') {
      const jsonData = JSON.stringify(reportData, null, 2);
      downloadFile(jsonData, `${reportType}_report.json`, 'application/json');
    }
  };

  const convertToCSV = (data) => {
    // Simple CSV conversion - can be enhanced based on data structure
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {});
      const csvRows = [headers.join(',')];
      
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value}"` : value;
        });
        csvRows.push(values.join(','));
      });
      
      return csvRows.join('\n');
    }
    
    return JSON.stringify(data);
  };

  const downloadFile = (data, filename, mimeType) => {
    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <ReportsContext.Provider value={{
      state,
      setDateRange,
      setSelectedReport,
      setFilters,
      generateSalesReport,
      generateInventoryReport,
      generateCustomerReport,
      exportReport
    }}>
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};
