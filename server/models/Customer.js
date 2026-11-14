const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0.01 },
  paymentDate: { type: Date, required: true },
  billingMonth: { type: String, match: /^[0-9]{4}-(0[1-9]|1[0-2])$/ },
  remark: { type: String, trim: true, maxlength: 500, default: '' }
}, { timestamps: true });

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  whatsapp: { type: String, required: true, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paymentTransactions: { type: [paymentTransactionSchema], default: [] }
}, { timestamps: true });

// Compound index to ensure whatsapp numbers are unique per user
customerSchema.index({ user: 1, whatsapp: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema); 