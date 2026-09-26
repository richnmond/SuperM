const mongoose = require('mongoose');

const ownerActivitySchema = new mongoose.Schema({
  action: { type: String, required: true },
  description: { type: String, required: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OwnerActivity', ownerActivitySchema);