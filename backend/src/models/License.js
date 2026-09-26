const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    immutable: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['starter', 'professional', 'enterprise'],
    required: true,
    default: 'starter'
  },
  startDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('License', licenseSchema);