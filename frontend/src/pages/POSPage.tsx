import { useState, useEffect } from 'react';
import { useCartStore } from '../store/cartStore';
import ProductSearch from '../components/POS/ProductSearch';
import CartSummary from '../components/POS/CartSummary';
import CheckoutModal from '../components/POS/CheckoutModal';
import Receipt from '../components/POS/Receipt';
import type { Product, Order } from '../types';

const POSPage = () => {
  const { addItem, items } = useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Keyboard shortcut: Ctrl+Enter to checkout
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && items.length > 0 && !showCheckout) {
        e.preventDefault();
        setShowCheckout(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items.length, showCheckout]);

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (order: Order) => {
    setCompletedOrder(order);
    setShowCheckout(false);
    setShowReceipt(true);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setCompletedOrder(null);
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
        <p className="text-gray-600 text-sm mt-1">
          Search for products and add them to cart to complete a sale
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Left Column - Product Search */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Search</h2>
          <ProductSearch onAddToCart={handleAddToCart} />
        </div>

        {/* Right Column - Cart Summary */}
        <div className="lg:col-span-1 overflow-hidden">
          <CartSummary onCheckout={handleCheckout} />
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={handleCheckoutSuccess}
      />

      {/* Receipt Modal */}
      <Receipt
        isOpen={showReceipt}
        order={completedOrder}
        onClose={handleCloseReceipt}
      />
    </div>
  );
};

export default POSPage;
