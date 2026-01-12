const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    vendor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    driver_id: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    pickup_location: {
        type:  String,
        required: true
    },
    drop_location: {
        type:  String,
        required: true
    },
    load_type: {
        type: String,
        required: true
    },
    load_weight_kg: {
        type: Number
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_transit', 'delivered', 'cancelled'],
        default:  'pending'
    },
    fare_amount: {
        type:  Number
    }
}, {
    timestamps: true  // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Order', orderSchema);