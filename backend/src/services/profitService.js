const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

const formatDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentRange = (startDate, endDate) => {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

const getPreviousRange = (currentStart, currentEnd) => {
  const duration = currentEnd.getTime() - currentStart.getTime() + 1;
  const previousEnd = new Date(currentStart.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration + 1);
  return { previousStart, previousEnd };
};

const buildDateSeries = (start, end) => {
  const dates = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(formatDateKey(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const calculatePercentageChange = (current, previous) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
};

const aggregateSalesMetrics = async (match) => {
  const result = await Sale.aggregate([
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
            $multiply: ['$items.costPrice', '$items.quantity']
          }
        }
      }
    }
  ]);

  return {
    revenue: result[0]?.revenue || 0,
    cogs: result[0]?.cogs || 0
  };
};

const aggregateExpenseTotal = async (match) => {
  const result = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        expenses: { $sum: '$amount' }
      }
    }
  ]);

  return result[0]?.expenses || 0;
};

const getTopProducts = async (match, limit = 5) => {
  const products = await Sale.aggregate([
    { $match: match },
    { $unwind: '$items' },
    {
      $group: {
        _id: {
          productId: '$items.productId',
          productName: '$items.productName'
        },
        unitsSold: { $sum: '$items.quantity' },
        revenue: {
          $sum: {
            $multiply: ['$items.price', '$items.quantity']
          }
        },
        cogs: {
          $sum: {
            $multiply: ['$items.costPrice', '$items.quantity']
          }
        }
      }
    },
    {
      $project: {
        productId: '$_id.productId',
        productName: '$_id.productName',
        unitsSold: 1,
        revenue: 1,
        cogs: 1,
        profit: { $subtract: ['$revenue', '$cogs'] }
      }
    },
    { $sort: { profit: -1 } },
    { $limit: limit }
  ]);

  return products;
};

const getTopExpenseCategories = async (match, limit = 5) => {
  const categories = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' }
      }
    },
    { $sort: { total: -1 } },
    { $limit: limit }
  ]);

  return categories.map((item) => ({ category: item._id, total: item.total }));
};

const getProfitTrend = async (saleMatch, expenseMatch, start, end) => {
  const daySeries = buildDateSeries(start, end);
  const trendMap = daySeries.reduce((acc, date) => {
    acc[date] = { date, revenue: 0, cogs: 0, expenses: 0, grossProfit: 0, netProfit: 0 };
    return acc;
  }, {});

  const salesTrend = await Sale.aggregate([
    { $match: saleMatch },
    { $unwind: '$items' },
    {
      $group: {
        _id: {
          day: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          }
        },
        revenue: {
          $sum: { $multiply: ['$items.price', '$items.quantity'] }
        },
        cogs: {
          $sum: { $multiply: ['$items.costPrice', '$items.quantity'] }
        }
      }
    },
    { $sort: { '_id.day': 1 } }
  ]);

  const expenseTrend = await Expense.aggregate([
    { $match: expenseMatch },
    {
      $group: {
        _id: {
          day: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$incurredOn'
            }
          }
        },
        expenses: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.day': 1 } }
  ]);

  salesTrend.forEach((entry) => {
    const date = entry._id.day;
    if (!trendMap[date]) return;
    trendMap[date].revenue = entry.revenue;
    trendMap[date].cogs = entry.cogs;
    trendMap[date].grossProfit = entry.revenue - entry.cogs;
  });

  expenseTrend.forEach((entry) => {
    const date = entry._id.day;
    if (!trendMap[date]) return;
    trendMap[date].expenses = entry.expenses;
  });

  Object.values(trendMap).forEach((item) => {
    item.netProfit = item.grossProfit - item.expenses;
  });

  return Object.values(trendMap);
};

const getProfitOverview = async (userId, startDate, endDate) => {
  const { start: currentStart, end: currentEnd } = getCurrentRange(startDate, endDate);
  const { previousStart, previousEnd } = getPreviousRange(currentStart, currentEnd);

  const currentSalesMatch = {
    cashier: userId,
    createdAt: { $gte: currentStart, $lte: currentEnd }
  };
  const previousSalesMatch = {
    cashier: userId,
    createdAt: { $gte: previousStart, $lte: previousEnd }
  };
  const currentExpenseMatch = {
    recordedBy: userId,
    incurredOn: { $gte: currentStart, $lte: currentEnd }
  };
  const previousExpenseMatch = {
    recordedBy: userId,
    incurredOn: { $gte: previousStart, $lte: previousEnd }
  };

  const [currentSales, previousSales, currentExpenses, previousExpenses] = await Promise.all([
    aggregateSalesMetrics(currentSalesMatch),
    aggregateSalesMetrics(previousSalesMatch),
    aggregateExpenseTotal(currentExpenseMatch),
    aggregateExpenseTotal(previousExpenseMatch)
  ]);

  const revenue = currentSales.revenue;
  const cogs = currentSales.cogs;
  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - currentExpenses;
  const profitMargin = revenue ? (netProfit / revenue) * 100 : 0;

  const previousGrossProfit = previousSales.revenue - previousSales.cogs;
  const previousNetProfit = previousGrossProfit - previousExpenses;
  const previousProfitMargin = previousSales.revenue ? (previousNetProfit / previousSales.revenue) * 100 : 0;

  const [topProducts, topExpenseCategories, profitTrend] = await Promise.all([
    getTopProducts(currentSalesMatch),
    getTopExpenseCategories(currentExpenseMatch),
    getProfitTrend(currentSalesMatch, currentExpenseMatch, currentStart, currentEnd)
  ]);

  return {
    revenue: { value: revenue, change: calculatePercentageChange(revenue, previousSales.revenue) },
    cogs: { value: cogs, change: calculatePercentageChange(cogs, previousSales.cogs) },
    grossProfit: { value: grossProfit, change: calculatePercentageChange(grossProfit, previousGrossProfit) },
    expenses: { value: currentExpenses, change: calculatePercentageChange(currentExpenses, previousExpenses) },
    netProfit: { value: netProfit, change: calculatePercentageChange(netProfit, previousNetProfit) },
    profitMargin: { value: Number(profitMargin.toFixed(1)), change: Number(calculatePercentageChange(profitMargin, previousProfitMargin).toFixed(1)) },
    topProducts,
    topExpenseCategories,
    profitTrend
  };
};

module.exports = {
  getProfitOverview
};
