import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Modal, Button, Input } from '../../../shared/components/ui';

const StockModal = () => {
  const { state, adjustStock, hideModal } = useInventory();
  const [adjustment, setAdjustment] = useState('');
  const [reason, setReason] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('add'); // add, remove, set

  const product = state.editingItem;

  const handleStockAdjustment = async () => {
    if (!product || !adjustment) return;

    try {
      let finalAdjustment = parseInt(adjustment);
      
      if (adjustmentType === 'remove') {
        finalAdjustment = -finalAdjustment;
      } else if (adjustmentType === 'set') {
        finalAdjustment = finalAdjustment - product.stock;
      }

      await adjustStock(product.id, finalAdjustment, reason);
      handleClose();
    } catch (error) {
      console.error('Failed to adjust stock:', error);
    }
  };

  const handleClose = () => {
    hideModal('Stock');
    setAdjustment('');
    setReason('');
    setAdjustmentType('add');
  };

  const getNewStockLevel = () => {
    if (!product || !adjustment) return product?.stock || 0;
    
    const adj = parseInt(adjustment) || 0;
    
    switch (adjustmentType) {
      case 'add':
        return product.stock + adj;
      case 'remove':
        return Math.max(0, product.stock - adj);
      case 'set':
        return Math.max(0, adj);
      default:
        return product?.stock || 0;
    }
  };

  return (
    <Modal
      isOpen={state.showStockModal}
      onClose={handleClose}
      title={`Adjust Stock - ${product?.name || ''}`}
      size="md"
      footer={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleStockAdjustment}
            disabled={!adjustment}
          >
            Update Stock
          </Button>
        </div>
      }
    >
      {product && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-sm text-gray-600">{product.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Current Stock</p>
                <p className="text-2xl font-bold">{product.stock}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjustment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('add')}
                className={`p-3 text-sm rounded-lg border ${
                  adjustmentType === 'add'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                Add Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('remove')}
                className={`p-3 text-sm rounded-lg border ${
                  adjustmentType === 'remove'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                Remove Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('set')}
                className={`p-3 text-sm rounded-lg border ${
                  adjustmentType === 'set'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                Set Stock
              </button>
            </div>
          </div>

          <Input
            label={
              adjustmentType === 'add' ? 'Quantity to Add' :
              adjustmentType === 'remove' ? 'Quantity to Remove' :
              'New Stock Level'
            }
            type="number"
            value={adjustment}
            onChange={(e) => setAdjustment(e.target.value)}
            placeholder="0"
          />

          <Input
            label="Reason (Optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Received new shipment, Damaged goods, Manual count"
          />

          {adjustment && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">New Stock Level:</span>
                <span className="text-lg font-bold text-blue-900">
                  {getNewStockLevel()} units
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default StockModal;
