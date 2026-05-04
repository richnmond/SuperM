const express = require('express');
const {
  createSale,
  getSales,
  getSalesSummary,
  exportSalesToCSV
} = require('../controllers/saleController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createSale)
  .get(protect, getSales);

router.get('/summary', protect, getSalesSummary);
router.get('/export/csv', protect, exportSalesToCSV);

module.exports = router;
