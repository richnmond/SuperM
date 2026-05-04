const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');

const createSale = async (req, res) => {
  try {
    const { items, paymentMethod, totalAmount } = req.body;
    let totalCost = 0;
    const itemsWithCost = [];

    // Validate stock and update quantities
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productName} not found` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}` 
        });
      }

      const costSubtotal = (product.costPrice || 0) * item.quantity;
      totalCost += costSubtotal;
      itemsWithCost.push({
        ...item,
        costPrice: product.costPrice || 0,
        costSubtotal
      });
    }

    // Create sale
    const sale = await Sale.create({
      items: itemsWithCost,
      totalAmount,
      totalCost,
      paymentMethod,
      cashier: req.user._id
    });

    // Update product quantities
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.quantity }
      });
    }

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSales = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (period) {
      const now = new Date();
      let start = new Date();

      switch (period) {
        case 'daily':
          start.setHours(0, 0, 0, 0);
          break;
        case 'weekly':
          start.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          start.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }

      query.createdAt = { $gte: start };
    }

    const sales = await Sale.find(query)
      .populate('cashier', 'username')
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSalesSummary = async (req, res) => {
  try {
    const totalSales = await Sale.countDocuments();
    
    const revenueData = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    });

    const totalProducts = await Product.countDocuments();

    res.json({
      totalSales,
      totalRevenue,
      lowStockProducts,
      totalProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportSalesToCSV = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('cashier', 'username')
      .sort({ createdAt: -1 });

    const csvWriter = createObjectCsvWriter({
      path: 'temp_sales_export.csv',
      header: [
        { id: 'id', title: 'Sale ID' },
        { id: 'date', title: 'Date' },
        { id: 'items', title: 'Items' },
        { id: 'totalAmount', title: 'Total Amount' },
        { id: 'paymentMethod', title: 'Payment Method' },
        { id: 'cashier', title: 'Cashier' }
      ]
    });

    const records = sales.map(sale => ({
      id: sale._id.toString(),
      date: sale.createdAt.toISOString(),
      items: sale.items.map(item => `${item.productName} (${item.quantity})`).join('; '),
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      cashier: sale.cashier.username
    }));

    await csvWriter.writeRecords(records);

    res.download('temp_sales_export.csv', 'sales_export.csv', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      fs.unlinkSync('temp_sales_export.csv');
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSale,
  getSales,
  getSalesSummary,
  exportSalesToCSV
};
