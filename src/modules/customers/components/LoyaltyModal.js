import React, { useState } from 'react';
import { Award, Plus, Minus } from 'lucide-react';
import { useCustomers } from '../context/CustomerContext';
import { Modal, Button, Input, Badge } from '../../../shared/components/ui';

const LoyaltyModal = () => {
  const { state, awardLoyaltyPoints, redeemLoyaltyPoints, hideModal } = useCustomers();
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [action, setAction] = useState('award'); // award, redeem

  const customer = state.editingCustomer;

  const handleLoyaltyAction = async () => {
    if (!customer || !points) return;

    try {
      const pointsAmount = parseInt(points);
      
      if (action === 'award') {
        awardLoyaltyPoints(customer.id, pointsAmount, reason);
      } else {
        const success = redeemLoyaltyPoints(customer.id, pointsAmount, reason);
        if (!success) return; // Error already shown
      }

      handleClose();
    } catch (error) {
      console.error('Failed to process loyalty points:', error);
    }
  };

  const handleClose = () => {
    hideModal('Loyalty');
    setPoints('');
    setReason('');
    setAction('award');
  };

  const tierColors = {
    Bronze: 'default',
    Silver: 'info',
    Gold: 'warning',
    VIP: 'error'
  };

  const tierRequirements = {
    Bronze: { min: 0, max: 199 },
    Silver: { min: 200, max: 499 },
    Gold: { min: 500, max: 999 },
    VIP: { min: 1000, max: Infinity }
  };

  const getNextTier = (currentPoints) => {
    if (currentPoints < 200) return { tier: 'Silver', pointsNeeded: 200 - currentPoints };
    if (currentPoints < 500) return { tier: 'Gold', pointsNeeded: 500 - currentPoints };
    if (currentPoints < 1000) return { tier: 'VIP', pointsNeeded: 1000 - currentPoints };
    return null;
  };

  const nextTier = customer ? getNextTier(customer.points || 0) : null;

  return (
    <Modal
      isOpen={state.showLoyaltyModal}
      onClose={handleClose}
      title={`Loyalty Management - ${customer?.name || ''}`}
      size="md"
      footer={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleLoyaltyAction}
            disabled={!points}
          >
            {action === 'award' ? 'Award Points' : 'Redeem Points'}
          </Button>
        </div>
      }
    >
      {customer && (
        <div className="space-y-6">
          {/* Customer loyalty overview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Current Points</span>
              </div>
              <Badge variant={tierColors[customer.tier || 'Bronze']} size="lg">
                {customer.tier || 'Bronze'}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {customer.points || 0}
              </div>
              
              {nextTier && (
                <div className="text-sm text-gray-600">
                  {nextTier.pointsNeeded} points to reach {nextTier.tier}
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, ((customer.points || 0) / (nextTier.pointsNeeded + (customer.points || 0))) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Points action selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAction('award')}
                className={`p-3 rounded-lg border flex items-center justify-center space-x-2 ${
                  action === 'award'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>Award Points</span>
              </button>
              <button
                type="button"
                onClick={() => setAction('redeem')}
                className={`p-3 rounded-lg border flex items-center justify-center space-x-2 ${
                  action === 'redeem'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Minus className="h-4 w-4" />
                <span>Redeem Points</span>
              </button>
            </div>
          </div>

          {/* Points input */}
          <Input
            label="Points Amount"
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="Enter points amount"
            min="1"
            max={action === 'redeem' ? customer.points : undefined}
          />

          {/* Reason input */}
          <Input
            label="Reason (Optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              action === 'award' 
                ? 'e.g. Birthday bonus, Special promotion'
                : 'e.g. Product discount, Free item'
            }
          />

          {/* Preview */}
          {points && (
            <div className={`p-4 rounded-lg ${
              action === 'award' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${
                  action === 'award' ? 'text-green-700' : 'text-red-700'
                }`}>
                  New Points Balance:
                </span>
                <span className={`text-lg font-bold ${
                  action === 'award' ? 'text-green-900' : 'text-red-900'
                }`}>
                  {action === 'award' 
                    ? (customer.points || 0) + parseInt(points || 0)
                    : Math.max(0, (customer.points || 0) - parseInt(points || 0))
                  }
                </span>
              </div>
            </div>
          )}

          {/* Tier requirements info */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tier Requirements</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(tierRequirements).map(([tier, req]) => (
                <div key={tier} className="flex justify-between items-center">
                  <Badge variant={tierColors[tier]} size="sm">
                    {tier}
                  </Badge>
                  <span className="text-gray-600">
                    {req.min === 0 ? '0' : req.min.toLocaleString()}{' '}
                    {req.max === Infinity ? '+' : ` - ${req.max.toLocaleString()}`} points
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default LoyaltyModal;
