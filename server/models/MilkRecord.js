const mongoose = require('mongoose');

const milkRecordSchema = new mongoose.Schema({
  customer: { type: String, required: true, trim: true },
  quantityKg: { type: Number, required: true },       // Primary unit (kilograms)
  amount: { type: Number, required: true },
  whatsapp: { type: String, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  paidAmount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('MilkRecord', milkRecordSchema); 