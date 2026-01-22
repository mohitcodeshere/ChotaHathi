import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_URL } from '../constants/config';

export interface OrderData {
  vendor_id: string;
  pickup_location: string;
  drop_location: string;
  load_type: string;
  load_weight_kg?: number;
}

export interface Order extends OrderData {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions matching your backend
export const orderAPI = {
  // Create new order - POST /api/orders
  // USED IN: BookingScreen.tsx
  createOrder: async (orderData: OrderData): Promise<ApiResponse<Order>> => {
    try {
      const response = await api.post<ApiResponse<Order>>('/orders', orderData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<Order>>;
      throw axiosError.response?.data || { error: axiosError.message };
    }
  },

  // Get all pending orders - GET /api/orders
  // USED IN: OrdersListScreen.tsx
  getPendingOrders: async (): Promise<ApiResponse<Order[]>> => {
    try {
      const response = await api.get<ApiResponse<Order[]>>('/orders');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<Order[]>>;
      throw axiosError.response?.data || { error: axiosError.message };
    }
  },

  // Get order by ID - GET /api/orders/:id
  // USED IN: OrderDetailScreen.tsx
  getOrderById: async (orderId: string): Promise<ApiResponse<Order>> => {
    try {
      const response = await api.get<ApiResponse<Order>>(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<Order>>;
      throw axiosError.response?.data || { error: axiosError.message };
    }
  },
};

export default api;
