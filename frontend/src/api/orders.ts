import apiClient from './client';
import type { Order, CartItem } from '../types';

export interface CartValidationResult {
  valid: boolean;
  errors: string[];
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
}

export interface OrderItemCreate {
  product_id: number;
  qty: number;
  unit_price: number;
  discount: number;
}

export interface OrderCreateData {
  customer_id?: number;
  items: OrderItemCreate[];
  subtotal: number;
  discount_total: number;
  tax_total: number;
  total: number;
  payment_details?: {
    method: string;
    cash_amount?: number;
    credit_amount?: number;
  };
}

export interface ReceiptData {
  order_number: string;
  date: string;
  items: {
    name: string;
    qty: number;
    unit_price: number;
    discount: number;
    line_total: number;
  }[];
  subtotal: number;
  discount_total: number;
  tax_total: number;
  total: number;
  payment_method: string;
  cashier: string;
}

export const validateCart = async (items: CartItem[]): Promise<CartValidationResult> => {
  const response = await apiClient.post('/cart/validate', {
    items: items.map(item => ({
      product_id: item.product.id,
      qty: item.quantity,
    })),
  });
  return response.data;
};

export const createOrder = async (orderData: OrderCreateData): Promise<Order> => {
  const response = await apiClient.post('/orders', orderData);
  return response.data;
};

export const getReceipt = async (orderId: number): Promise<ReceiptData> => {
  const response = await apiClient.post(`/orders/${orderId}/receipt`);
  return response.data;
};
