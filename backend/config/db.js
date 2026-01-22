const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('⚠️ MongoDB connection failed:', err.message);
        console.log('🔌 Server will continue without MongoDB (WebSockets still work)');
        // Don't exit - allow server to run for WebSocket testing
    }
};

module.exports = connectDB;