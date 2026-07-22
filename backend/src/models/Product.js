const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: { 
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  costPrice: {
    type: Number,
    min: 0,
    default: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Groceries', 'Beverages', 'Snacks', 'Dairy', 'Meat', 'Produce', 'Household', 'Other']
  },
  image: {
    type: String,
    default: null
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
