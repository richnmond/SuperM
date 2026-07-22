const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  taxRate: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  costPrice: {
    type: Number,
    default: 0
  },
  costSubtotal: {
    type: Number,
    default: 0
  }
});

const saleSchema = new mongoose.Schema({
  saleId: {
    type: Number,
    unique: true,
    required: true,
    index: true
  },
  items: [saleItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile'],
    required: true
  },
  totalCost: {
    type: Number,
    default: 0
  },
  cashier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Counter = mongoose.model('Counter', new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
}));

saleSchema.pre('validate', async function(next) {
  if (this.saleId) return next();

  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: 'saleId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.saleId = counter.seq;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Sale', saleSchema);
