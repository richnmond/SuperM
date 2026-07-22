const express = require('express');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Lookup product by barcode
router.get('/lookup/:barcode', protect, async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if barcode exists
router.get('/check/:barcode', protect, async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode });
    res.json({ exists: !!product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate a unique barcode (optional - for manual entry)
router.get('/generate', protect, async (req, res) => {
  try {
    let barcode;
    let exists = true;
    
    // Generate unique 13-digit EAN-13 style barcode
    while (exists) {
      barcode = Math.floor(Math.random() * 9000000000000) + 1000000000000;
      const existing = await Product.findOne({ barcode: barcode.toString() });
      exists = !!existing;
    }
    
    res.json({ barcode: barcode.toString() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;