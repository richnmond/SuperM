const express = require('express');
const {
  getProducts,
  getProductById,
  getInventoryValuation,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const { handleProductImageUpload, validateImageBuffers } = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(protect, getProducts)
  .post(protect, admin, handleProductImageUpload, validateImageBuffers, createProduct);

router.get('/valuation', protect, getInventoryValuation);

router.route('/:id')
  .get(protect, getProductById)
  .put(protect, admin, handleProductImageUpload, validateImageBuffers, updateProduct)
  .delete(protect, admin, deleteProduct);

router.put('/:id/stock', protect, admin, updateStock);

module.exports = router;