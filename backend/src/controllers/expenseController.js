const Expense = require('../models/Expense');

const listExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.incurredOn = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (category) {
      query.category = category;
    }

    const expenses = await Expense.find(query).sort({ incurredOn: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      recordedBy: req.user?._id
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    await expense.deleteOne();
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const expenseSummary = async (_req, res) => {
  try {
    const summary = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalExpense = summary.reduce((sum, item) => sum + (item.total || 0), 0);

    res.json({ totalExpense, breakdown: summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  expenseSummary
};
