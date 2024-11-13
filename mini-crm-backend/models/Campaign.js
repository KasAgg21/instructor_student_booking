// models/Campaign.js
const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: String,
  segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment' },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Campaign', campaignSchema);
