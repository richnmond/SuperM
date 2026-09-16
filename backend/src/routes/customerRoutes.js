const express = require('express');
const { protect } = require('../middleware/auth');
const {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  customerSummary,
  getCustomerPurchases
} = require('../controllers/customerController');

const router = express.Router();

router.route('/')
  .get(protect, listCustomers)
  .post(protect, createCustomer);

router.route('/summary').get(protect, customerSummary);
router.route('/:id/purchases').get(protect, getCustomerPurchases);

router.route('/:id')
  .put(protect, updateCustomer)
  .delete(protect, deleteCustomer);

module.exports = router;
