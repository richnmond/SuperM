const express = require('express');
const { protect } = require('../middleware/auth');
const {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  expenseSummary
} = require('../controllers/expenseController');

const router = express.Router();

router.route('/')
  .get(protect, listExpenses)
  .post(protect, createExpense);

router.route('/summary').get(protect, expenseSummary);

router.route('/:id')
  .put(protect, updateExpense)
  .delete(protect, deleteExpense);

module.exports = router;
