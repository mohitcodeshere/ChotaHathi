const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const connectDB = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/AuthRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Socket.io connection handling
const onlineDrivers = new Map(); // driverId -> socketId
const activeBookings = new Map(); // bookingId -> booking data
const activeTrips = new Map(); // bookingId -> { customerId, driverId, status, driverLocation }

io.on('connection', (socket) => {
  console.log('🔌 New connection:', socket.id);

  // Driver goes online
  socket.on('driver:online', (driverId) => {
    onlineDrivers.set(driverId, socket.id);
    socket.join('drivers'); // Join drivers room
    socket.join(`driver_${driverId}`); // Personal room for driver
    console.log(`🚛 Driver ${driverId} is now online. Total drivers: ${onlineDrivers.size}`);
    
    // Send current active bookings to newly connected driver
    const bookings = Array.from(activeBookings.values());
    socket.emit('bookings:list', bookings);
  });

  // Driver goes offline
  socket.on('driver:offline', (driverId) => {
    onlineDrivers.delete(driverId);
    socket.leave('drivers');
    socket.leave(`driver_${driverId}`);
    console.log(`😴 Driver ${driverId} is now offline. Total drivers: ${onlineDrivers.size}`);
  });

  // Customer joins their personal room for updates
  socket.on('customer:join', (customerId) => {
    socket.join(`customer_${customerId}`);
    console.log(`👤 Customer ${customerId} joined for updates`);
  });

  // Customer creates a new booking
  socket.on('booking:new', (booking) => {
    console.log('📦 New booking received:', booking.id);
    activeBookings.set(booking.id, { ...booking, customerSocketId: socket.id });
    
    // Broadcast to all online drivers
    io.to('drivers').emit('booking:new', booking);
    
    // Send confirmation to customer with driver count
    socket.emit('booking:confirmed', {
      bookingId: booking.id,
      driversNotified: onlineDrivers.size
    });
  });

  // Driver accepts a booking
  socket.on('booking:accept', ({ bookingId, driverId, driverInfo }) => {
    console.log(`✅ Driver ${driverId} accepted booking ${bookingId}`);
    
    const booking = activeBookings.get(bookingId);
    if (booking) {
      // Remove from active bookings
      activeBookings.delete(bookingId);
      
      // Create active trip for location tracking
      activeTrips.set(bookingId, {
        bookingId,
        driverId,
        driverInfo,
        customerSocketId: booking.customerSocketId,
        pickup_location: booking.pickup_location,
        drop_location: booking.drop_location,
        status: 'accepted', // accepted -> reached_pickup -> in_transit -> delivered
        driverLocation: null,
      });
      
      // Notify the customer who created this booking
      io.emit('booking:accepted', {
        bookingId,
        driver: driverInfo
      });
      
      // Notify other drivers that this booking is taken
      socket.to('drivers').emit('booking:taken', { bookingId });
    }
  });

  // Driver updates their location
  socket.on('driver:location', ({ bookingId, location }) => {
    const trip = activeTrips.get(bookingId);
    if (trip) {
      trip.driverLocation = location;
      // Send location to the customer
      io.to(trip.customerSocketId).emit('driver:location', {
        bookingId,
        location,
        status: trip.status,
      });
      console.log(`📍 Driver location update for booking ${bookingId}: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
    }
  });

  // Driver updates trip status
  socket.on('trip:status', ({ bookingId, status }) => {
    const trip = activeTrips.get(bookingId);
    if (trip) {
      trip.status = status;
      console.log(`🚛 Trip ${bookingId} status: ${status}`);
      
      // Notify customer of status change
      io.to(trip.customerSocketId).emit('trip:status', {
        bookingId,
        status,
      });
      
      // If delivered, clean up
      if (status === 'delivered') {
        activeTrips.delete(bookingId);
        console.log(`✅ Trip ${bookingId} completed`);
      }
    }
  });

  // Driver rejects a booking
  socket.on('booking:reject', ({ bookingId, driverId }) => {
    console.log(`❌ Driver ${driverId} rejected booking ${bookingId}`);
  });

  // Customer cancels booking
  socket.on('booking:cancel', (bookingId) => {
    console.log(`🚫 Booking ${bookingId} cancelled`);
    activeBookings.delete(bookingId);
    io.to('drivers').emit('booking:cancelled', { bookingId });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Find and remove driver from online list
    for (const [driverId, socketId] of onlineDrivers.entries()) {
      if (socketId === socket.id) {
        onlineDrivers.delete(driverId);
        console.log(`🔌 Driver ${driverId} disconnected`);
        break;
      }
    }
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: '🚛 ChotaHathi API is running with MongoDB + Socket.io!',
        version: '1.0.0',
        onlineDrivers: onlineDrivers.size,
        activeBookings: activeBookings.size,
        endpoints: {
            createOrder: 'POST /api/orders',
            getPendingOrders: 'GET /api/orders',
            getOrderById: 'GET /api/orders/:id'
        }
    });
});

// Start server with Socket.io
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server ready`);
});