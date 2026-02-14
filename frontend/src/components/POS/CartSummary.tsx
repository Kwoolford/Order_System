import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

interface CartSummaryProps {
  onCheckout: () => void;
}

const CartSummary = ({ onCheckout }: CartSummaryProps) => {
  const { items, updateQuantity, removeItem, getSubtotal, getTax, getTotal } = useCartStore();

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();

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
                className="border border-gray-200 rounded-lg p-4 space-y-3"
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
                    onClick={() => removeItem(item.product.id)}
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
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 rounded border border-gray-300 hover:bg-gray-100"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const qty = parseInt(e.target.value) || 1;
                        updateQuantity(item.product.id, qty);
                      }}
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded"
                      min="1"
                    />
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
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
            Press Ctrl+Enter to checkout
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSummary;
