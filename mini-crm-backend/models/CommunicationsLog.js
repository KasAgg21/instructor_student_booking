// models/CommunicationsLog.js
const mongoose = require('mongoose');

const communicationsLogSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  message: String,
  status: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CommunicationsLog', communicationsLogSchema);
