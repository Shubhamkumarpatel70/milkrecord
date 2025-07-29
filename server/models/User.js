const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[0-9]{10}$/
  },
  mpin: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{5}$/
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  paymentOptions: {
    upiId: {
      type: String,
      trim: true
    },
    hasPaymentOption: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 