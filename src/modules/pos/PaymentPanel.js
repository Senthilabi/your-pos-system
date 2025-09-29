// src/modules/pos/components/PaymentPanel.js
import React from 'react';
import { CreditCard, Smartphone, DollarSign, Building2 } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Card, Button } from '../../../shared/components/ui';

const PaymentPanel = () => {
  const { state, setPaymentMethod, processPayment } = usePOS();

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: DollarSign },
    { id: 'card', name: 'Card', icon: CreditCard },
    { id: 'upi', name: 'UPI', icon: Smartphone },
    { id: 'bank_transfer', name: 'Bank', icon: Building2 }
  ];

  return (
    <Card title="Payment" padding="small">
      <div className="space-y-4">
        {/* Payment methods */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map(method => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-3 rounded-lg border text-sm flex flex-col items-center space-y-1 transition-colors ${
                    state.paymentMethod === method.id
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{method.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Process payment button */}
        <Button
          onClick={processPayment}
          disabled={state.cart.length === 0 || state.isProcessingPayment}
          loading={state.isProcessingPayment}
          size="lg"
          className="w-full"
        >
          {state.isProcessingPayment 
            ? 'Processing...' 
            : `Process Payment ($${state.total.toFixed(2)})`
          }
        </Button>
      </div>
    </Card>
  );
};

export default PaymentPanel;
