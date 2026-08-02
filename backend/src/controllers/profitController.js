const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const { getProfitOverview } = require('../services/profitService');

const getPreviousRange = (startDate, endDate) => {
  const currentDuration = endDate.getTime() - startDate.getTime() + 1;
  const previousEnd = new Date(startDate.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - currentDuration + 1);
  return { previousStart, previousEnd };
};

const createDateRange = (startDate, endDate) => ({
  start: new Date(startDate),
  end: new Date(endDate)
});

const getDefaultMonthlyRange = () => {
  const now = new Date();
  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  return { currentStart, currentEnd, previousStart, previousEnd };
};

const calculatePercentageChange = (current, previous) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
};

const aggregateSalesMetrics = async (match) => {
  const salesAgg = await Sale.aggregate([
    { $match: match },
    { $unwind: '$items' },
    {
      $group: {
        _id: null,
        revenue: {
          $sum: {
            $multiply: ['$items.price', '$items.quantity']
          }
        },
        cogs: {
          $sum: {
            $multiply: [{ $ifNull: ['$items.costPrice', 0] }, '$items.quantity']
          }
        }
      }
    }
  ]);

  return {
    revenue: salesAgg[0]?.revenue || 0,
    cogs: salesAgg[0]?.cogs || 0
  };
};

const aggregateExpenseTotal = async (match) => {
  const expenseAgg = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        expenses: { $sum: '$amount' }
      }
    }
  ]);

  return expenseAgg[0]?.expenses || 0;
};

const getProfitSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await getProfitOverview(req.user._id, startDate, endDate);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfitSummary };
