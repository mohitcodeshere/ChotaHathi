import axios from 'axios';
import { API_URL } from '../constants/config';

const api = axios. create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions matching your backend
export const orderAPI = {
  // Create new order - POST /api/orders
  // USED IN: BookingScreen.js
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error. response?.data || error.message;
    }
  },

  // Get all pending orders - GET /api/orders
  // USED IN: OrdersListScreen.js
  getPendingOrders:  async () => {
    try {
      const response = await api. get('/orders');
      return response.data;
    } catch (error) {
      throw error. response?.data || error.message;
    }
  },

  // Get order by ID - GET /api/orders/:id
  // USED IN: OrderDetailScreen. js
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default api;