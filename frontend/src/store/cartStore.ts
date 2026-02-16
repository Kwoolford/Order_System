import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartState, Product } from '../types';

const TAX_RATE = 0.085; // 8.5% tax rate

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartDiscount: 0,
      cartDiscountCode: undefined,

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
            items: [...state.items, { product, quantity, discount: 0 }],
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

      updateItemDiscount: (productId: number, discount: number, reason: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? { ...item, discount, discountReason: reason }
              : item
          ),
        }));
      },

      setCartDiscount: (discount: number, code?: string) => {
        set({ cartDiscount: discount, cartDiscountCode: code });
      },

      clearCart: () => {
        set({ items: [], cartDiscount: 0, cartDiscountCode: undefined });
      },

      getSubtotal: () => {
        const state = get();
        return state.items.reduce(
          (total, item) => {
            const lineTotal = item.product.price * item.quantity;
            const itemDiscount = item.discount || 0;
            return total + lineTotal - itemDiscount;
          },
          0
        );
      },

      getDiscountTotal: () => {
        const state = get();
        const itemDiscounts = state.items.reduce(
          (total, item) => total + (item.discount || 0),
          0
        );
        return itemDiscounts + state.cartDiscount;
      },

      getTax: () => {
        const subtotal = get().getSubtotal();
        const cartDiscount = get().cartDiscount;
        return (subtotal - cartDiscount) * TAX_RATE;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const cartDiscount = get().cartDiscount;
        const tax = get().getTax();
        return subtotal - cartDiscount + tax;
      },
    }),
    {
      name: 'pos-cart-storage',
    }
  )
);
