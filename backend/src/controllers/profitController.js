const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

const getProfitSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const salesAgg = await Sale.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totalAmount' },
          cogs: { $sum: '$totalCost' }
        }
      }
    ]);

    const expenseAgg = await Expense.aggregate([
      { $match: startDate && endDate ? { incurredOn: { $gte: new Date(startDate), $lte: new Date(endDate) } } : {} },
      {
        $group: {
          _id: null,
          expenses: { $sum: '$amount' }
        }
      }
    ]);

    const revenue = salesAgg[0]?.revenue || 0;
    const cogs = salesAgg[0]?.cogs || 0;
    const expenses = expenseAgg[0]?.expenses || 0;
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - expenses;

    res.json({
      revenue,
      cogs,
      expenses,
      grossProfit,
      netProfit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfitSummary };
