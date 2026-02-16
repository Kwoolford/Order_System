import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getReceipt, type ReceiptData } from '../api/orders';

const ReceiptPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadReceipt();
    }
  }, [id]);

  const loadReceipt = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await getReceipt(parseInt(id));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Receipt not found</p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header - Hide when printing */}
      <div className="max-w-2xl mx-auto mb-6 print:hidden">
        <button
          onClick={() => navigate(`/orders/${id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Order Details
        </button>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Receipt</h1>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Printer className="h-5 w-5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Receipt Content */}
      <div id="receipt-content" className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 print:shadow-none print:max-w-none">
        {/* Store Header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">POS Store</h1>
          <p className="text-gray-600">123 Main Street</p>
          <p className="text-gray-600">Phone: (555) 123-4567</p>
          <p className="text-gray-600">Email: info@posstore.com</p>
          <p className="text-sm text-gray-600 mt-3">Thank you for your purchase!</p>
        </div>

        {/* Order Info */}
        <div className="mb-8 pb-6 border-b-2 border-dashed border-gray-300">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Order Number:</span>
            <span className="font-semibold">{receipt.order_number}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Date:</span>
            <span>{new Date(receipt.date).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cashier:</span>
            <span>{receipt.cashier}</span>
          </div>
        </div>

        {/* Items */}
        <div className="mb-8 pb-6 border-b-2 border-dashed border-gray-300">
          <h3 className="font-semibold text-gray-900 mb-4">Items</h3>
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
        <div className="space-y-2 mb-8">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal:</span>
            <span>${receipt.subtotal.toFixed(2)}</span>
          </div>
          {receipt.discount_total > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Total Discount:</span>
              <span className="text-red-600">-${receipt.discount_total.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-700">
            <span>Tax:</span>
            <span>${receipt.tax_total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2 border-gray-900">
            <span>Total:</span>
            <span>${receipt.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-8 pb-6 border-b-2 border-dashed border-gray-300">
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-semibold capitalize">{receipt.payment_method}</span>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
            <QRCodeSVG
              value={`ORDER:${receipt.order_number}`}
              size={150}
              level="M"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 border-t-2 border-gray-300 pt-6">
          <p className="font-semibold mb-2">Thank you for shopping with us!</p>
          <p className="text-sm">Please retain this receipt for your records</p>
          <p className="text-sm mt-2">Visit us again soon!</p>
          <p className="text-xs mt-3">Scan QR code to view order online</p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;
