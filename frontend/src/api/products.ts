import apiClient from './client';
import type { Product } from '../types';

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
