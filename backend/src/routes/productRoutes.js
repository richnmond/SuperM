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
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(protect, getProducts)
  .post(protect, admin, upload.single('image'), createProduct);

router.get('/valuation', protect, getInventoryValuation);

router.route('/:id')
  .get(protect, getProductById)
  .put(protect, admin, upload.single('image'), updateProduct)
  .delete(protect, admin, deleteProduct);

router.put('/:id/stock', protect, admin, updateStock);

module.exports = router;