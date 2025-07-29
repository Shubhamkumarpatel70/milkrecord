const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  whatsapp: { type: String, required: true, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Compound index to ensure whatsapp numbers are unique per user
customerSchema.index({ user: 1, whatsapp: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema); 