import { useState } from 'react';
import { X, CreditCard, DollarSign, Split } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { createOrder, validateCart } from '../../api/orders';
import type { Order } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

type PaymentMethod = 'cash' | 'credit' | 'split';

const CheckoutModal = ({ isOpen, onClose, onSuccess }: CheckoutModalProps) => {
  const { items, getSubtotal, getTax, getTotal, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      // Validate cart first
      const validation = await validateCart(items);
      if (!validation.valid) {
        setError(validation.errors.join(', '));
        setLoading(false);
        return;
      }

      // Validate payment amounts for split payment
      if (paymentMethod === 'split') {
        const cash = parseFloat(cashAmount) || 0;
        const credit = parseFloat(creditAmount) || 0;
        const totalPayment = cash + credit;

        if (Math.abs(totalPayment - total) > 0.01) {
          setError(`Total payment ($${totalPayment.toFixed(2)}) must equal order total ($${total.toFixed(2)})`);
          setLoading(false);
          return;
        }
      }

      // Create order
      const orderData = {
        items: items.map(item => ({
          product_id: item.product.id,
          qty: item.quantity,
          unit_price: item.product.price,
          discount: 0,
        })),
        subtotal,
        discount_total: 0,
        tax_total: tax,
        total,
        payment_details: {
          method: paymentMethod,
          ...(paymentMethod === 'split' && {
            cash_amount: parseFloat(cashAmount),
            credit_amount: parseFloat(creditAmount),
          }),
        },
      };

      const order = await createOrder(orderData);
      clearCart();
      onSuccess(order);
    } catch (err: any) {
      console.error('Checkout failed:', err);
      setError(err.response?.data?.detail || 'Failed to complete checkout');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentFields = () => {
    if (paymentMethod === 'cash') {
      return (
        <div className="text-center py-6 text-gray-600">
          Cash payment of ${total.toFixed(2)}
        </div>
      );
    }

    if (paymentMethod === 'credit') {
      return (
        <div className="text-center py-6 text-gray-600">
          Credit card payment of ${total.toFixed(2)}
        </div>
      );
    }

    if (paymentMethod === 'split') {
      return (
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cash Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                value={cashAmount}
                onChange={(e) => {
                  setCashAmount(e.target.value);
                  const cash = parseFloat(e.target.value) || 0;
                  setCreditAmount((total - cash).toFixed(2));
                }}
                className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credit Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                value={creditAmount}
                onChange={(e) => {
                  setCreditAmount(e.target.value);
                  const credit = parseFloat(e.target.value) || 0;
                  setCashAmount((total - credit).toFixed(2));
                }}
                className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Payment:</span>
              <span className="font-medium">
                ${((parseFloat(cashAmount) || 0) + (parseFloat(creditAmount) || 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Checkout</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Order Summary */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Order Summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (8.5%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Payment Method</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'cash'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Cash</span>
              </button>

              <button
                onClick={() => setPaymentMethod('credit')}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'credit'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Credit</span>
              </button>

              <button
                onClick={() => {
                  setPaymentMethod('split');
                  setCashAmount((total / 2).toFixed(2));
                  setCreditAmount((total / 2).toFixed(2));
                }}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'split'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Split className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Split</span>
              </button>
            </div>
          </div>

          {/* Payment Fields */}
          {renderPaymentFields()}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Complete Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
