import apiClient from './client';

export interface ReturnItem {
  order_item_id: number;
  qty: number;
  damaged: boolean;
}

export interface ReturnCreate {
  order_id: number;
  items: ReturnItem[];
  reason?: string;
}

export interface OrderLookup {
  id: number;
  order_number: string;
  created_at: string;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  total: number;
  payment_method: string;
  cashier_id: number;
  items: {
    id: number;
    product_id: number;
    product_name: string;
    qty: number;
    unit_price: number;
    discount: number;
    line_total: number;
  }[];
}

export interface ReturnResponse {
  order_id: number;
  order_number: string;
  refund_amount: number;
  refund_method: string;
  items_returned: {
    order_item_id: number;
    product_id: number;
    qty: number;
    damaged: boolean;
    refund_amount: number;
  }[];
  processed_at: string;
  processed_by: string;
}

export const lookupOrder = async (search: string): Promise<OrderLookup> => {
  const response = await apiClient.get(`/returns/lookup?search=${encodeURIComponent(search)}`);
  return response.data;
};

export const processReturn = async (returnData: ReturnCreate): Promise<ReturnResponse> => {
  const response = await apiClient.post('/returns', returnData);
  return response.data;
};
