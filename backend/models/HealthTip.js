const mongoose = require('mongoose');

const healthTipSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['medication', 'exercise', 'nutrition', 'mental-health', 'general'],
    default: 'general'
  },
  tip: {
    type: String,
    required: true
  },
  icon: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthTip', healthTipSchema);