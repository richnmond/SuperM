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
  sellingPrice: {
    type: Number,
    min: 0,
    default: 0
  },
  price: {
    type: Number,
    min: 0,
    default: 0
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
  stockQuantity: {
    type: Number,
    min: 0,
    default: 0
  },
  quantity: {
    type: Number,
    min: 0,
    default: 0
  },
  reorderLevel: {
    type: Number,
    min: 0,
    default: 20
  },
  lowStockThreshold: {
    type: Number,
    min: 0,
    default: 20
  },
  profitPerUnit: {
    type: Number,
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
  const effectiveSellingPrice = Number(this.sellingPrice ?? this.price ?? 0);
  const effectiveCostPrice = Number(this.costPrice ?? 0);
  const effectiveStockQuantity = Number(this.stockQuantity ?? this.quantity ?? 0);
  const effectiveReorderLevel = Number(this.reorderLevel ?? this.lowStockThreshold ?? 20);

  this.sellingPrice = effectiveSellingPrice;
  this.price = effectiveSellingPrice;
  this.costPrice = effectiveCostPrice;
  this.stockQuantity = effectiveStockQuantity;
  this.quantity = effectiveStockQuantity;
  this.reorderLevel = effectiveReorderLevel;
  this.lowStockThreshold = effectiveReorderLevel;
  this.profitPerUnit = Number((effectiveSellingPrice - effectiveCostPrice).toFixed(2));
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
