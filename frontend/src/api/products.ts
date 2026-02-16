import apiClient from './client';
import type { Product } from '../types';

export interface ProductCreateData {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  cost: number;
  taxable: boolean;
  reorder_threshold: number;
  reorder_qty: number;
  location?: string;
}

export interface ProductUpdateData {
  sku?: string;
  barcode?: string;
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  cost?: number;
  taxable?: boolean;
  reorder_threshold?: number;
  reorder_qty?: number;
  location?: string;
  status?: string;
}

export const searchProducts = async (query: string): Promise<Product[]> => {
  const response = await apiClient.get('/products/search', {
    params: { q: query },
  });
  return response.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};

export const listProducts = async (params?: {
  skip?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<Product[]> => {
  const response = await apiClient.get('/products', { params });
  return response.data;
};

export const createProduct = async (data: ProductCreateData): Promise<Product> => {
  const response = await apiClient.post('/products', data);
  return response.data;
};

export const updateProduct = async (id: number, data: ProductUpdateData): Promise<Product> => {
  const response = await apiClient.patch(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<Product> => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};

export const getCategories = async (): Promise<string[]> => {
  const response = await apiClient.get('/products/categories/list');
  return response.data;
};
