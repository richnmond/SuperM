const express = require('express');
const { protect } = require('../middleware/auth');
const {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  supplierSummary
} = require('../controllers/supplierController');

const router = express.Router();

router.route('/')
  .get(protect, listSuppliers)
  .post(protect, createSupplier);

router.route('/summary').get(protect, supplierSummary);

router.route('/:id')
  .put(protect, updateSupplier)
  .delete(protect, deleteSupplier);

module.exports = router;
