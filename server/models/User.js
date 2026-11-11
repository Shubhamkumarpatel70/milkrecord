const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  mobile: { type: String, required: true, unique: true, trim: true, match: /^[0-9]{10}$/ },
  mpin: { type: String, required: true, validate: { validator: value => /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value) || /^[0-9]{5}$/.test(value), message: 'Invalid MPIN format.' } },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  businessProfile: {
    shopName: { type: String, trim: true, maxlength: 100, default: '' },
    milkRate: { type: Number, min: 0, default: 50 },
    quantityUnit: { type: String, enum: ['kg', 'liter'], default: 'kg' },
    isConfigured: { type: Boolean, default: false }
  },
  paymentOptions: { upiId: { type: String, trim: true }, hasPaymentOption: { type: Boolean, default: false } },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);