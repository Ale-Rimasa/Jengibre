import axios, { AxiosError } from 'axios';
import { Product, User } from '../types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Could dispatch a global event here if needed
    }
    return Promise.reject(error);
  }
);

export interface ProductsResponse {
  products: Product[];
}

export interface ProductResponse {
  product: Product;
  message?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface MeResponse {
  user: User;
}

export type CreateProductData = Omit<Product, 'id' | 'active' | 'createdAt' | 'updatedAt'>;
export type UpdateProductData = Partial<CreateProductData & { active: boolean }>;

export const apiService = {
  // Products
  async getProducts(search?: string, category?: string): Promise<ProductsResponse> {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category && category !== 'todas') params.category = category;

    const response = await api.get<ProductsResponse>('/products', { params });
    return response.data;
  },

  async getProduct(id: number): Promise<ProductResponse> {
    const response = await api.get<ProductResponse>(`/products/${id}`);
    return response.data;
  },

  async createProduct(data: CreateProductData): Promise<ProductResponse> {
    const response = await api.post<ProductResponse>('/products', data);
    return response.data;
  },

  async updateProduct(id: number, data: UpdateProductData): Promise<ProductResponse> {
    const response = await api.put<ProductResponse>(`/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/products/${id}`);
    return response.data;
  },

  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/logout');
    return response.data;
  },

  async getMe(): Promise<MeResponse> {
    const response = await api.get<MeResponse>('/auth/me');
    return response.data;
  },

  // Orders
  async createOrder(data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerAddress?: string;
    notes?: string;
    total: number;
    items: Array<{
      productId?: number;
      productName: string;
      productImg: string;
      price: number;
      quantity: number;
      subtotal: number;
    }>;
  }) {
    const response = await api.post('/orders', data);
    return response.data;
  },

  async getOrders() {
    const response = await api.get('/orders');
    return response.data as { orders: import('../types').Order[] };
  },

  async updateOrderStatus(id: number, status: string) {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },
};

export default api;
