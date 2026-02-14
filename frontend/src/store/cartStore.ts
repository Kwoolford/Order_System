import { create } from 'zustand';
import type { CartState, Product } from '../types';

const TAX_RATE = 0.08; // 8% tax rate

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product: Product, quantity: number = 1) => {
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      return {
        items: [...state.items, { product, quantity }],
      };
    });
  },

  removeItem: (productId: number) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId: number, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  getSubtotal: () => {
    const state = get();
    return state.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  },

  getTax: () => {
    const subtotal = get().getSubtotal();
    return subtotal * TAX_RATE;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const tax = get().getTax();
    return subtotal + tax;
  },
}));
