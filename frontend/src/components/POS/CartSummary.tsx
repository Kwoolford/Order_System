import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, Percent, Tag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

interface CartSummaryProps {
  onCheckout: () => void;
}

const CartSummary = ({ onCheckout }: CartSummaryProps) => {
  const { items, updateQuantity, removeItem, updateItemDiscount, setCartDiscount, cartDiscount, cartDiscountCode, getSubtotal, getTax, getTotal, getDiscountTotal } = useCartStore();
  const { user } = useAuthStore();
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [cartDiscountModalOpen, setCartDiscountModalOpen] = useState(false);
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [cartDiscountAmount, setCartDiscountAmount] = useState('');

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const discountTotal = getDiscountTotal();

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  // Keyboard shortcuts for quantity adjustment
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (selectedItemId && items.length > 0) {
        const item = items.find(i => i.product.id === selectedItemId);
        if (!item) return;

        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          if (item.quantity < item.product.on_hand) {
            updateQuantity(selectedItemId, item.quantity + 1);
          }
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          updateQuantity(selectedItemId, item.quantity - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId, items, updateQuantity]);

  // Auto-select first item when cart has items
  useEffect(() => {
    if (items.length > 0 && !selectedItemId) {
      setSelectedItemId(items[0].product.id);
    } else if (items.length === 0) {
      setSelectedItemId(null);
    }
  }, [items, selectedItemId]);

  const handleOpenDiscountModal = (productId: number) => {
    if (!isManager) return;
    setSelectedItemId(productId);
    const item = items.find(i => i.product.id === productId);
    setDiscountAmount(item?.discount?.toString() || '');
    setDiscountReason(item?.discountReason || '');
    setDiscountModalOpen(true);
  };

  const handleApplyItemDiscount = () => {
    if (!selectedItemId || !discountReason.trim()) return;
    const amount = parseFloat(discountAmount) || 0;
    if (amount < 0) return;

    updateItemDiscount(selectedItemId, amount, discountReason);
    setDiscountModalOpen(false);
    setDiscountAmount('');
    setDiscountReason('');
  };

  const handleOpenCartDiscountModal = () => {
    if (!isManager) return;
    setCartDiscountAmount(cartDiscount.toString());
    setDiscountCode(cartDiscountCode || '');
    setCartDiscountModalOpen(true);
  };

  const handleApplyCartDiscount = () => {
    const amount = parseFloat(cartDiscountAmount) || 0;
    if (amount < 0) return;

    setCartDiscount(amount, discountCode || undefined);
    setCartDiscountModalOpen(false);
    setCartDiscountAmount('');
    setDiscountCode('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-6 w-6 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Cart</h2>
          <span className="ml-auto text-sm text-gray-500">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <ShoppingCart className="h-16 w-16 mb-4" />
            <p className="text-lg">Cart is empty</p>
            <p className="text-sm">Search and add products to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                onClick={() => setSelectedItemId(item.product.id)}
                className={`border rounded-lg p-4 space-y-3 cursor-pointer transition-all ${
                  selectedItemId === item.product.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Product Info */}
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.product.id);
                    }}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="Remove item"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Quantity Controls and Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.product.id, item.quantity - 1);
                      }}
                      className="p-1 rounded border border-gray-300 hover:bg-gray-100"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        e.stopPropagation();
                        const qty = parseInt(e.target.value) || 1;
                        updateQuantity(item.product.id, qty);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded"
                      min="1"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.product.id, item.quantity + 1);
                      }}
                      className="p-1 rounded border border-gray-300 hover:bg-gray-100"
                      disabled={item.quantity >= item.product.on_hand}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      ${item.product.price.toFixed(2)} × {item.quantity}
                    </div>
                    <div className="font-semibold text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Line Item Discount */}
                {isManager && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDiscountModal(item.product.id);
                      }}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Percent className="h-4 w-4" />
                      <span>{item.discount ? 'Edit Discount' : 'Add Discount'}</span>
                    </button>
                    {item.discount && item.discount > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        -${item.discount.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                {item.discountReason && (
                  <div className="text-xs text-gray-600 italic">
                    Discount reason: {item.discountReason}
                  </div>
                )}

                {/* Stock Warning */}
                {item.quantity >= item.product.on_hand && (
                  <div className="text-xs text-orange-600">
                    Max stock reached ({item.product.on_hand} available)
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals and Checkout */}
      {items.length > 0 && (
        <div className="border-t border-gray-200 px-6 py-4 space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between text-gray-700">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {/* Discounts */}
          {discountTotal > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discounts:</span>
              <span>-${discountTotal.toFixed(2)}</span>
            </div>
          )}

          {/* Cart-level Discount Button */}
          {isManager && (
            <button
              onClick={handleOpenCartDiscountModal}
              className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50"
            >
              <Tag className="h-4 w-4" />
              <span>{cartDiscount > 0 ? 'Edit Cart Discount' : 'Add Cart Discount'}</span>
            </button>
          )}

          {/* Tax */}
          <div className="flex justify-between text-gray-700">
            <span>Tax (8.5%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          {/* Total */}
          <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={onCheckout}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Checkout
          </button>
          <div className="text-xs text-center text-gray-500">
            Press Ctrl+Enter to checkout | +/- for selected item quantity
          </div>
        </div>
      )}
      {/* Line Item Discount Modal */}
      {discountModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Apply Line Item Discount
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Required)
                </label>
                <textarea
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Manager approval, damaged item, etc."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setDiscountModalOpen(false);
                  setDiscountAmount('');
                  setDiscountReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyItemDiscount}
                disabled={!discountReason.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart-Level Discount Modal */}
      {cartDiscountModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Apply Cart Discount
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Code (Optional)
                </label>
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="PROMO10, SUMMER20, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cartDiscountAmount}
                  onChange={(e) => setCartDiscountAmount(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setCartDiscountModalOpen(false);
                  setCartDiscountAmount('');
                  setDiscountCode('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCartDiscount}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSummary;
