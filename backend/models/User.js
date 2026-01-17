const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  role: {
    type: String,
    enum: ['vendor', 'driver', 'admin'],
    default: 'vendor',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    code: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 },
  },
  lastLogin: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);