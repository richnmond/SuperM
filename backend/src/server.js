const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const barcodeRoutes = require('./routes/barcodeRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const customerRoutes = require('./routes/customerRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const profitRoutes = require('./routes/profitRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const licenseRoutes = require('./routes/licenseRoutes');
const { protect, requireBusinessLicense } = require('./middleware/auth');
const Owner = require('./models/Owner');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (isProduction) {
  const frontendBuildPath = path.join(__dirname, '../../frontend/build');
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api', protect, requireBusinessLicense);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/barcode', barcodeRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/profit', profitRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
    const ownerPassword = process.env.OWNER_PASSWORD;
    if (ownerEmail && ownerPassword) {
      const existingOwner = await Owner.findOne({ email: ownerEmail });
      if (!existingOwner) await Owner.create({ email: ownerEmail, password: ownerPassword });
      console.log('Owner account is provisioned');
    } else {
      console.warn('Set OWNER_EMAIL and OWNER_PASSWORD to provision owner access');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
