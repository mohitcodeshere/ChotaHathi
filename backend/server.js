const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const connectDB = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/AuthRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: '🚛 ChotaHathi API is running with MongoDB!',
        version: '1.0.0',
        endpoints: {
            createOrder: 'POST /api/orders',
            getPendingOrders: 'GET /api/orders',
            getOrderById: 'GET /api/orders/:id'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});