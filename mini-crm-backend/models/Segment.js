// models/Segment.js
const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  name: String,
  conditions: Array, // Array of conditions
  logicOperator: String, // AND / OR
});

module.exports = mongoose.model('Segment', segmentSchema);
