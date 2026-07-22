const express = require('express');
const { protect } = require('../middleware/auth');
const { getProfitSummary } = require('../controllers/profitController');

const router = express.Router();

router.get('/summary', protect, getProfitSummary);

module.exports = router;
