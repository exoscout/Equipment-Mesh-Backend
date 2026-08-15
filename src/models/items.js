const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  lister: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rentalPrice: {
    type: Number,
    required: true
  },
  pricingUnit: {
    type: String,
    enum: ['hour', 'day', 'week', 'month'],
    default: 'day'
  },
  location: {
    type: String,
    required: true
  },
  securityDeposit: {
    type: Number,
    default: 0
  },
  lateReturnPenalty: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['Electronics', 'Furniture', 'Clothing', 'Books', 'Other'],
    default: 'Other',
    required: true
  },
  condition: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  archivedAt: {
    type: Date,
    default: null
  }
});

module.exports = {
    Item: mongoose.model('Item', itemSchema),
}