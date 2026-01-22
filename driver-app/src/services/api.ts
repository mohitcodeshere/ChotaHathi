import { API_URL } from '../constants/config';

export interface Booking {
  id: string;
  pickup_location: string;
  drop_location: string;
  load_type: string;
  fare: number;
  customer_name: string;
  customer_phone: string;
  distance: string;
  created_at: string;
  vehicle_type: string;
  status: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  vehicle_number: string;
  vehicle_type: string;
  rating: number;
  total_trips: number;
  total_earnings: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Get available bookings for drivers
export const bookingsAPI = {
  getAvailableBookings: async (): Promise<ApiResponse<Booking[]>> => {
    try {
      const response = await fetch(`${API_URL}/api/bookings/available`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to fetch bookings' };
    }
  },

  acceptBooking: async (bookingId: string, driverId: string): Promise<ApiResponse<Booking>> => {
    try {
      const response = await fetch(`${API_URL}/api/bookings/${bookingId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driver_id: driverId }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to accept booking' };
    }
  },

  rejectBooking: async (bookingId: string, driverId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_URL}/api/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driver_id: driverId }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to reject booking' };
    }
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<ApiResponse<Booking>> => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to update order status' };
    }
  },

  getActiveOrders: async (driverId: string): Promise<ApiResponse<Booking[]>> => {
    try {
      const response = await fetch(`${API_URL}/api/drivers/${driverId}/active-orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to fetch active orders' };
    }
  },
};

// Driver authentication
export const driverAuthAPI = {
  sendOTP: async (phoneNumber: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/driver/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneNumber }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to send OTP' };
    }
  },

  verifyOTP: async (phoneNumber: string, otp: string): Promise<ApiResponse<{ token: string; driver: DriverProfile }>> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/driver/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneNumber, otp }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to verify OTP' };
    }
  },
};

// Driver profile
export const driverAPI = {
  getProfile: async (driverId: string): Promise<ApiResponse<DriverProfile>> => {
    try {
      const response = await fetch(`${API_URL}/api/drivers/${driverId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to fetch profile' };
    }
  },

  updateOnlineStatus: async (driverId: string, isOnline: boolean): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_URL}/api/drivers/${driverId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_online: isOnline }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to update status' };
    }
  },

  getEarnings: async (driverId: string): Promise<ApiResponse<{ today: number; week: number; month: number }>> => {
    try {
      const response = await fetch(`${API_URL}/api/drivers/${driverId}/earnings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to fetch earnings' };
    }
  },
};
