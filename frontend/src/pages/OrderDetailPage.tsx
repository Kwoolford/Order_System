import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, RotateCcw, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getOrder, getReceipt, type ReceiptData } from '../api/orders';
import type { Order } from '../types';

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  const loadOrderDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const [orderData, receiptData] = await Promise.all([
        getOrder(parseInt(id)),
        getReceipt(parseInt(id))
      ]);
      setOrder(orderData);
      setReceipt(receiptData);
    } catch (error) {
      console.error('Failed to load order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order || !receipt) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Order not found</p>
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
    <div className="p-6">
      {/* Header - Hide when printing */}
      <div className="mb-6 print:hidden">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Orders
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600 mt-1">Order #{receipt.order_number}</p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Printer className="h-5 w-5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={() => navigate(`/receipt/${id}`)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <FileText className="h-5 w-5" />
              <span>View Receipt</span>
            </button>
            <button
              disabled
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed"
              title="Returns feature coming soon"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Return</span>
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Content */}
      <div className="max-w-4xl mx-auto">
        <div id="receipt-content" className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:p-0">
          {/* Store Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">POS Store</h1>
            <p className="text-gray-600">123 Main Street</p>
            <p className="text-gray-600">Phone: (555) 123-4567</p>
            <p className="text-gray-600">Email: info@posstore.com</p>
          </div>

          {/* Order Information */}
          <div className="grid grid-cols-2 gap-6 mb-8 pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-semibold">{receipt.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{formatDate(receipt.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cashier:</span>
                  <span>{receipt.cashier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="capitalize font-semibold">{receipt.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center items-start">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                <QRCodeSVG
                  value={`ORDER:${receipt.order_number}`}
                  size={150}
                  level="M"
                />
                <p className="text-xs text-center text-gray-500 mt-2">Scan to view order</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {receipt.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{item.qty}</td>
                    <td className="px-4 py-3 text-right text-gray-900">${item.unit_price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {item.discount > 0 ? `-$${item.discount.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ${item.line_total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="space-y-2 mb-2">
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
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2 border-gray-900">
                <span>Total:</span>
                <span>${receipt.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-600 border-t-2 border-gray-300 pt-6">
            <p className="font-semibold mb-2">Thank you for shopping with us!</p>
            <p className="text-sm">Please retain this receipt for your records</p>
            <p className="text-sm mt-2">Visit us again soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
