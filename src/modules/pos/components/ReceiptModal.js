import React from 'react';
import { Printer, Mail, Download } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Modal, Button } from '../../../shared/components/ui';

const ReceiptModal = () => {
  const { state, dispatch } = usePOS();

  const handleClose = () => {
    dispatch({ type: 'HIDE_RECEIPT' });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!state.showReceipt || !state.receiptData) return null;

  const { transaction, customer, company } = state.receiptData;

  return (
    <Modal
      isOpen={state.showReceipt}
      onClose={handleClose}
      title="Transaction Receipt"
      size="lg"
      footer={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint} icon={<Printer className="h-4 w-4" />}>
            Print
          </Button>
          <Button variant="outline" icon={<Mail className="h-4 w-4" />}>
            Email
          </Button>
          <Button variant="outline" icon={<Download className="h-4 w-4" />}>
            Download
          </Button>
          <Button onClick={handleClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="bg-white p-6 font-mono text-sm" id="receipt">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold">{company.name}</h2>
          <p>{company.address}</p>
          <p>{company.phone} | {company.email}</p>
          <hr className="my-2" />
        </div>

        {/* Transaction info */}
        <div className="mb-4">
          <div className="flex justify-between">
            <span>Receipt #:</span>
            <span>{transaction.receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{transaction.timestamp.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span>{transaction.timestamp.toLocaleTimeString()}</span>
          </div>
          {customer && (
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{customer.name}</span>
            </div>
          )}
        </div>

        <hr className="my-4" />

        {/* Items */}
        <div className="mb-4">
          {transaction.items.map((item, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between">
                <span>{item.productName}</span>
                <span>${item.total.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-600 ml-2">
                {item.quantity} × ${item.unitPrice.toFixed(2)}
                {item.discount > 0 && ` (Discount: $${item.discount.toFixed(2)})`}
              </div>
            </div>
          ))}
        </div>

        <hr className="my-4" />

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${transaction.subtotal.toFixed(2)}</span>
          </div>
          {transaction.discountAmount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-${transaction.discountAmount.toFixed(2)}</span>
            </div>
          )}
          {transaction.taxAmount > 0 && (
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${transaction.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>TOTAL:</span>
            <span>${transaction.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="capitalize">{transaction.paymentMethod}</span>
          </div>
        </div>

        <hr className="my-4" />

        {/* Footer */}
        <div className="text-center text-xs">
          <p>Thank you for your business!</p>
          <p>Please keep this receipt for your records</p>
          {customer && customer.points && (
            <p className="mt-2">Loyalty Points Balance: {customer.points}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;