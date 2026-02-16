import { useEffect, useState } from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getReceipt, type ReceiptData } from '../../api/orders';
import type { Order } from '../../types';

interface ReceiptProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
}

const Receipt = ({ isOpen, order, onClose }: ReceiptProps) => {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && order?.id) {
      loadReceipt();
    }
  }, [isOpen, order]);

  const loadReceipt = async () => {
    if (!order?.id) return;

    setLoading(true);
    try {
      const data = await getReceipt(order.id);
      setReceipt(data);
    } catch (error) {
      console.error('Failed to load receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Hide when printing */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 print:hidden">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">Order Complete</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : receipt ? (
            <div id="receipt-content" className="max-w-md mx-auto print:text-black">
              {/* Store Header */}
              <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">POS Store</h1>
                <p className="text-sm text-gray-600">123 Main Street</p>
                <p className="text-sm text-gray-600">Phone: (555) 123-4567</p>
                <p className="text-sm text-gray-600 mt-2">Thank you for your purchase!</p>
              </div>

              {/* Order Info */}
              <div className="mb-6 pb-4 border-b-2 border-dashed border-gray-300">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-semibold">{receipt.order_number}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Date:</span>
                  <span>{new Date(receipt.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cashier:</span>
                  <span>{receipt.cashier}</span>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6 pb-4 border-b-2 border-dashed border-gray-300">
                <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                <div className="space-y-3">
                  {receipt.items.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between">
                        <span className="text-gray-900">{item.name}</span>
                        <span className="font-medium">${item.line_total.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-gray-600 ml-2">
                        {item.qty} × ${item.unit_price.toFixed(2)}
                        {item.discount > 0 && ` (Discount: -$${item.discount.toFixed(2)})`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>${receipt.subtotal.toFixed(2)}</span>
                </div>
                {receipt.discount_total > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Discount:</span>
                    <span>-${receipt.discount_total.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Tax:</span>
                  <span>${receipt.tax_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t-2 border-gray-900">
                  <span>Total:</span>
                  <span>${receipt.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6 pb-4 border-b-2 border-dashed border-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold capitalize">{receipt.payment_method}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="bg-white p-3 rounded border border-gray-300">
                  <QRCodeSVG
                    value={`ORDER:${receipt.order_number}`}
                    size={128}
                    level="M"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-600 border-t-2 border-gray-300 pt-4">
                <p className="font-semibold mb-2">Thank you for shopping with us!</p>
                <p>Please retain this receipt for your records</p>
                <p className="mt-2">Visit us again soon!</p>
                <p className="mt-3 text-xs">Scan QR code to view order online</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Failed to load receipt
            </div>
          )}
        </div>

        {/* Footer - Hide when printing */}
        <div className="px-6 py-4 border-t border-gray-200 flex space-x-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Printer className="h-5 w-5" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
