import { useState } from 'react';
import { Search, RotateCcw, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { lookupOrder, processReturn, OrderLookup, ReturnItem } from '../api/returns';
import { useAuthStore } from '../store/authStore';

interface ReturnItemState extends ReturnItem {
  product_name: string;
  unit_price: number;
  max_qty: number;
  line_total: number;
}

const ReturnsPage = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderLookup | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItemState[]>([]);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if user has cashier+ access
  const hasAccess = user?.role === 'cashier' || user?.role === 'manager' || user?.role === 'admin';

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter an order number or receipt number');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setOrder(null);
    setReturnItems([]);

    try {
      const foundOrder = await lookupOrder(searchTerm.trim());
      setOrder(foundOrder);

      // Initialize return items (all unselected)
      setReturnItems(
        foundOrder.items.map(item => ({
          order_item_id: item.id,
          qty: 0,
          damaged: false,
          product_name: item.product_name,
          unit_price: item.unit_price,
          max_qty: item.qty,
          line_total: item.line_total,
        }))
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const newReturnItems = [...returnItems];
    const maxQty = newReturnItems[index].max_qty;

    // Ensure quantity is within valid range
    newReturnItems[index].qty = Math.max(0, Math.min(maxQty, qty));
    setReturnItems(newReturnItems);
  };

  const handleDamagedToggle = (index: number) => {
    const newReturnItems = [...returnItems];
    newReturnItems[index].damaged = !newReturnItems[index].damaged;
    setReturnItems(newReturnItems);
  };

  const calculateRefundAmount = () => {
    return returnItems.reduce((total, item) => {
      if (item.qty > 0) {
        const refund = (item.line_total / item.max_qty) * item.qty;
        return total + refund;
      }
      return total;
    }, 0);
  };

  const handleProcessReturn = async () => {
    if (!order) return;

    // Filter items with qty > 0
    const itemsToReturn = returnItems.filter(item => item.qty > 0);

    if (itemsToReturn.length === 0) {
      setError('Please select at least one item to return');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await processReturn({
        order_id: order.id,
        items: itemsToReturn.map(item => ({
          order_item_id: item.order_item_id,
          qty: item.qty,
          damaged: item.damaged,
        })),
        reason: reason.trim() || undefined,
      });

      setSuccess(
        `Return processed successfully! Refund amount: $${result.refund_amount.toFixed(2)} via ${result.refund_method}`
      );

      // Reset form
      setOrder(null);
      setReturnItems([]);
      setSearchTerm('');
      setReason('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process return');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!hasAccess) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">Access denied. Cashier role or higher required.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <RotateCcw className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Returns & Refunds</h1>
        </div>
        <p className="text-gray-600">Search for an order and process returns</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Lookup</h2>
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter order number or receipt number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Search className="h-5 w-5 mr-2" />
            Search
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Order Details & Return Form */}
      {order && (
        <div className="space-y-6">
          {/* Order Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-semibold">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold capitalize">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold">${order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Return Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Select Items to Return</h2>
            <div className="space-y-4">
              {returnItems.map((item, index) => (
                <div key={item.order_item_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                      <p className="text-sm text-gray-600">
                        Original: {item.max_qty} x ${item.unit_price.toFixed(2)} = ${item.line_total.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Return Qty</label>
                        <input
                          type="number"
                          min="0"
                          max={item.max_qty}
                          value={item.qty}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`damaged-${index}`}
                          checked={item.damaged}
                          onChange={() => handleDamagedToggle(index)}
                          disabled={item.qty === 0}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`damaged-${index}`}
                          className={`text-sm ${item.qty === 0 ? 'text-gray-400' : 'text-gray-700'}`}
                        >
                          Damaged
                          {item.damaged && item.qty > 0 && (
                            <span className="ml-2 text-xs text-orange-600">(Won't restock)</span>
                          )}
                        </label>
                      </div>
                      {item.qty > 0 && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Refund</p>
                          <p className="font-semibold text-green-600">
                            ${((item.line_total / item.max_qty) * item.qty).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reason */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for return..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Total Refund */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-gray-900">Total Refund Amount</p>
                  <p className="text-sm text-gray-600">Refund via {order.payment_method}</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  ${calculateRefundAmount().toFixed(2)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setOrder(null);
                  setReturnItems([]);
                  setSearchTerm('');
                  setReason('');
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessReturn}
                disabled={loading || calculateRefundAmount() === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Process Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!order && !loading && !error && !success && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Order Selected</h3>
          <p className="text-gray-600">Search for an order above to begin processing a return</p>
        </div>
      )}
    </div>
  );
};

export default ReturnsPage;
