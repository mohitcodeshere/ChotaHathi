const Order = require('../models/Order');

// Create new order
exports.createOrder = async (req, res) => {
    try {
        const { vendor_id, pickup_location, drop_location, load_type, load_weight_kg } = req.body;

        if (!vendor_id || !pickup_location || !drop_location || !load_type) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields' 
            });
        }

        const order = await Order.create({
            vendor_id,
            pickup_location,
            drop_location,
            load_type,
            load_weight_kg,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: '✅ Order created successfully',
            order
        });
    } catch (err) {
        console.error('❌ Error creating order:', err);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
};

// Get all pending orders
exports.getPendingOrders = async (req, res) => {
    try {
        const orders = await Order.find({ status: 'pending' })
            .sort({ createdAt: -1 });

        res.status(200).json({ 
            success: true,
            count: orders.length,
            orders 
        });
    } catch (err) {
        console.error('❌ Error fetching orders:', err);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ 
                success: false,
                error: 'Order not found' 
            });
        }

        res.status(200).json({ 
            success: true,
            order 
        });
    } catch (err) {
        console.error('❌ Error fetching order:', err);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
};