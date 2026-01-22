import { io, Socket } from 'socket.io-client';
import { API_URL } from '../constants/config';

export interface Booking {
  id: string;
  pickup_location: string;
  drop_location: string;
  load_type: string;
  fare: number;
  customer_name: string;
  customer_phone: string;
  distance?: string;
  created_at: string;
  vehicle_type: string;
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  vehicle_number: string;
}

class DriverSocketService {
  private socket: Socket | null = null;
  private driverId: string = '';
  private listeners: Map<string, Set<Function>> = new Map();

  connect(driverId: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.driverId = driverId;

    this.socket = io(API_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Driver connected to server:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Driver disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.log('🔌 Connection error:', error.message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.goOffline();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Driver goes online - start receiving bookings
  goOnline(): void {
    if (this.socket?.connected && this.driverId) {
      this.socket.emit('driver:online', this.driverId);
      console.log('🟢 Driver is now online');
    }
  }

  // Driver goes offline - stop receiving bookings
  goOffline(): void {
    if (this.socket?.connected && this.driverId) {
      this.socket.emit('driver:offline', this.driverId);
      console.log('🔴 Driver is now offline');
    }
  }

  // Accept a booking
  acceptBooking(bookingId: string, driverInfo: DriverInfo): void {
    if (this.socket?.connected) {
      this.socket.emit('booking:accept', {
        bookingId,
        driverId: this.driverId,
        driverInfo,
      });
    }
  }

  // Reject a booking
  rejectBooking(bookingId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('booking:reject', {
        bookingId,
        driverId: this.driverId,
      });
    }
  }

  // Send driver's current location to customer
  sendLocation(bookingId: string, location: { latitude: number; longitude: number }): void {
    if (this.socket?.connected) {
      this.socket.emit('driver:location', {
        bookingId,
        location,
      });
    }
  }

  // Update trip status (reached_pickup, in_transit, delivered)
  updateTripStatus(bookingId: string, status: 'accepted' | 'reached_pickup' | 'in_transit' | 'delivered'): void {
    if (this.socket?.connected) {
      this.socket.emit('trip:status', {
        bookingId,
        status,
      });
      console.log(`📍 Trip status updated: ${status}`);
    }
  }

  // Listen for new bookings
  onNewBooking(callback: (booking: Booking) => void): void {
    this.addListener('booking:new', callback);
  }

  // Listen for list of current active bookings
  onBookingsList(callback: (bookings: Booking[]) => void): void {
    this.addListener('bookings:list', callback);
  }

  // Listen for booking taken by another driver
  onBookingTaken(callback: (data: { bookingId: string }) => void): void {
    this.addListener('booking:taken', callback);
  }

  // Listen for booking cancelled by customer
  onBookingCancelled(callback: (data: { bookingId: string }) => void): void {
    this.addListener('booking:cancelled', callback);
  }

  // Remove all listeners
  removeAllListeners(): void {
    this.listeners.forEach((_, event) => {
      this.removeListener(event);
    });
  }

  private addListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
    this.socket?.on(event, callback as any);
  }

  private removeListener(event: string): void {
    this.listeners.get(event)?.forEach((callback) => {
      this.socket?.off(event, callback as any);
    });
    this.listeners.delete(event);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const driverSocketService = new DriverSocketService();
