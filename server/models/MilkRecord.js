const mongoose = require('mongoose');

const milkRecordSchema = new mongoose.Schema({
  customer: { type: String, required: true, trim: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', index: true },
  quantityKg: { type: Number, required: true },       // Stored numeric quantity; display unit is stored separately
  quantityUnit: { type: String, enum: ['kg', 'liter'], default: 'kg' },
  amount: { type: Number, required: true },
  whatsapp: { type: String, trim: true },
  shift: { type: String, enum: ['morning', 'evening'], default: 'morning' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  paidAmount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('MilkRecord', milkRecordSchema); 