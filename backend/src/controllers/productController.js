const Product = require('../models/Product');

const normalizeBarcode = (value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const getProducts = async (req, res) => {
  try {
    const { category, search, lowStock } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : null
    };
    if (productData.costPrice === undefined) {
      productData.costPrice = 0;
    }
    productData.barcode = normalizeBarcode(productData.barcode);
    if (productData.barcode === undefined) {
      delete productData.barcode;
    }

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.barcode) {
      return res.status(400).json({ message: 'Barcode already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const fieldsToSet = {
      ...req.body,
      updatedAt: Date.now()
    };
    if (fieldsToSet.costPrice === undefined) {
      fieldsToSet.costPrice = product.costPrice;
    }
    fieldsToSet.barcode = normalizeBarcode(fieldsToSet.barcode);

    if (req.file) {
      fieldsToSet.image = `/uploads/${req.file.filename}`;
    }

    const updateQuery = { $set: fieldsToSet };
    if (fieldsToSet.barcode === undefined) {
      delete updateQuery.$set.barcode;
      updateQuery.$unset = { barcode: 1 };
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.barcode) {
      return res.status(400).json({ message: 'Barcode already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.quantity = quantity;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
};
