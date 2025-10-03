import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Card, Button } from '../../../shared/components/ui';

const CartPanel = () => {
  const { state, updateCartItem, removeFromCart } = usePOS();

  return (
    <Card title={`Cart (${state.cart.length} items)`} padding="small">
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {state.cart.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Cart is empty
          </div>
        ) : (
          state.cart.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  ${item.price.toFixed(2)} each
                </p>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => updateCartItem(item.id, { quantity: item.quantity - 1 })}
                >
                  <Minus className="h-3 w-3" />
                </Button>

                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => updateCartItem(item.id, { quantity: item.quantity + 1 })}
                  disabled={item.quantity >= item.stock}
                >
                  <Plus className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart totals */}
      <div className="border-t pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>${state.subtotal.toFixed(2)}</span>
        </div>
        
        {state.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount:</span>
            <span>-${state.discountAmount.toFixed(2)}</span>
          </div>
        )}
        
        {state.taxAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span>Tax:</span>
            <span>${state.taxAmount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total:</span>
          <span className="text-green-600">${state.total.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
};

export default CartPanel;
