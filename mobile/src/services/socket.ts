import { io, Socket } from 'socket.io-client';
import { API_URL } from '../constants/config';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(API_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to server:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.log('🔌 Connection error:', error.message);
    });

    // Re-register all listeners on reconnect
    this.socket.on('connect', () => {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach((callback) => {
          this.socket?.on(event, callback as any);
        });
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Emit a new booking to all drivers
  emitNewBooking(booking: {
    id: string;
    pickup_location: string;
    drop_location: string;
    load_type: string;
    fare: number;
    customer_name: string;
    customer_phone: string;
    vehicle_type: string;
  }): void {
    if (this.socket?.connected) {
      console.log('📤 Emitting booking immediately:', booking.id);
      this.socket.emit('booking:new', booking);
    } else {
      // Wait for connection then emit
      console.log('⏳ Waiting for socket connection to emit booking...');
      this.socket?.once('connect', () => {
        console.log('📤 Socket connected, emitting booking:', booking.id);
        this.socket?.emit('booking:new', booking);
      });
    }
  }

  // Cancel a booking
  cancelBooking(bookingId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('booking:cancel', bookingId);
    }
  }

  // Listen for booking accepted
  onBookingAccepted(callback: (data: { bookingId: string; driver: any }) => void): void {
    this.addListener('booking:accepted', callback);
  }

  // Listen for booking confirmation (with driver count)
  onBookingConfirmed(callback: (data: { bookingId: string; driversNotified: number }) => void): void {
    this.addListener('booking:confirmed', callback);
  }

  // Remove listener
  offBookingAccepted(): void {
    this.removeListener('booking:accepted');
  }

  offBookingConfirmed(): void {
    this.removeListener('booking:confirmed');
  }

  // Listen for driver location updates
  onDriverLocation(callback: (data: { bookingId: string; location: { latitude: number; longitude: number }; status?: string }) => void): void {
    this.addListener('driver:location', callback);
  }

  offDriverLocation(): void {
    this.removeListener('driver:location');
  }

  // Listen for trip status updates
  onTripStatus(callback: (data: { bookingId: string; status: string }) => void): void {
    this.addListener('trip:status', callback);
  }

  offTripStatus(): void {
    this.removeListener('trip:status');
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

export const socketService = new SocketService();
