const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  mobile: { type: String, required: true, unique: true, trim: true, match: /^[0-9]{10}$/ },
  // Hashes are used for new accounts; 5-digit values remain accepted only for legacy migration.
  mpin: { type: String, required: true, validate: { validator: value => /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value) || /^[0-9]{5}$/.test(value), message: 'Invalid MPIN format.' } },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  paymentOptions: { upiId: { type: String, trim: true }, hasPaymentOption: { type: Boolean, default: false } },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
