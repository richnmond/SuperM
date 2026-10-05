const Product = require('../models/Product');
const { uploadFile, removeProductImages } = require('../services/storageService');

const PRODUCT_UNITS = ['Piece', 'Pack', 'Carton', 'Gram (g)', 'Kilogram (kg)', 'Millilitre (ml)', 'Litre (L)'];

const generateUniqueBarcode = async () => {
  let barcode;
  let exists = true;

  while (exists) {
    barcode = Math.floor(Math.random() * 9000000000000) + 1000000000000;
    const existing = await Product.findOne({ barcode: barcode.toString() });
    exists = !!existing;
  }

  return barcode.toString();
};

const normalizeBarcode = (value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const normalizeTaxRate = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.min(100, Math.max(0, numericValue));
};

const normalizeProductFields = (productData = {}) => {
  const sellingPrice = Number(productData.sellingPrice ?? productData.price ?? 0);
  const costPrice = Number(productData.costPrice ?? 0);
  const stockQuantity = Number(productData.stockQuantity ?? productData.quantity ?? 0);
  const reorderLevel = Number(productData.reorderLevel ?? productData.lowStockThreshold ?? 20);
  const unit = PRODUCT_UNITS.includes(productData.unit) ? productData.unit : 'Piece';

  return {
    ...productData,
    sellingPrice,
    price: sellingPrice,
    costPrice,
    stockQuantity,
    quantity: stockQuantity,
    reorderLevel,
    lowStockThreshold: reorderLevel,
    unit,
    profitPerUnit: Number((sellingPrice - costPrice).toFixed(2))
  };
};

const getUploadedFiles = (files = {}) => [...(files.image || []), ...(files.images || [])];

const getProductImageUrls = (product) => [...new Set([...(product.images || []), product.image].filter(Boolean))];

const parseRetainedImages = (value, existingImages) => {
  if (value === undefined) return existingImages;

  let requestedImages;
  try {
    requestedImages = JSON.parse(value);
  } catch (_error) {
    const error = new Error('The retained product image list is invalid.');
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(requestedImages)) {
    const error = new Error('The retained product image list must be an array.');
    error.statusCode = 400;
    throw error;
  }
  return [...new Set(requestedImages.filter((image) => typeof image === 'string' && existingImages.includes(image)))];
};

const safelyRemoveProductImages = async (imageUrls) => {
  try {
    await removeProductImages(imageUrls);
  } catch (error) {
    console.error(error.message);
  }
};

const uploadProductImages = async (files) => {
  const imageUrls = [];
  try {
    for (const file of files) {
      imageUrls.push(await uploadFile(file, { folder: 'products' }));
    }
  } catch (error) {
    await safelyRemoveProductImages(imageUrls);
    throw error;
  }
  return imageUrls;
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
      query.$or = [
        { $expr: { $lte: ['$stockQuantity', '$reorderLevel'] } },
        { $expr: { $lte: ['$quantity', '$lowStockThreshold'] } }
      ];
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

const getInventoryValuation = async (_req, res) => {
  try {
    const products = await Product.find().select('name unit quantity stockQuantity costPrice sellingPrice price').sort({ name: 1 });
    const valuation = products.map((product) => {
      const availableStock = Number(product.quantity ?? product.stockQuantity ?? 0);
      const costPrice = Number(product.costPrice || 0);
      const sellingPrice = Number(product.sellingPrice ?? product.price ?? 0);
      const totalCostValue = availableStock * costPrice;
      const totalSellingValue = availableStock * sellingPrice;
      return {
        productId: product._id,
        name: product.name,
        unit: product.unit || 'Piece',
        availableStock,
        costPrice,
        sellingPrice,
        totalCostValue,
        totalSellingValue,
        potentialProfit: totalSellingValue - totalCostValue
      };
    });

    res.json({
      products: valuation,
      totals: valuation.reduce((totals, product) => ({
        totalCostValue: totals.totalCostValue + product.totalCostValue,
        totalSellingValue: totals.totalSellingValue + product.totalSellingValue,
        potentialProfit: totals.potentialProfit + product.potentialProfit
      }), { totalCostValue: 0, totalSellingValue: 0, potentialProfit: 0 })
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  const uploadedImageUrls = [];
  try {
    uploadedImageUrls.push(...await uploadProductImages(getUploadedFiles(req.files)));
    const productData = normalizeProductFields({
      ...req.body,
      image: uploadedImageUrls[0] || null,
      images: uploadedImageUrls
    });

    if (productData.costPrice === undefined) {
      productData.costPrice = 0;
    }
    productData.taxRate = normalizeTaxRate(productData.taxRate);
    productData.barcode = normalizeBarcode(productData.barcode);
    if (productData.barcode === undefined) {
      productData.barcode = await generateUniqueBarcode();
    }

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    if (uploadedImageUrls.length > 0) await safelyRemoveProductImages(uploadedImageUrls);
    if (error.code === 11000 && error.keyPattern?.barcode) {
      return res.status(400).json({ message: 'Barcode already exists' });
    }
    res.status(error.statusCode || 500).json({ message: error.message || 'Unable to create product' });
  }
};

const updateProduct = async (req, res) => {
  const uploadedImageUrls = [];
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existingImages = getProductImageUrls(product);
    const uploadedFiles = getUploadedFiles(req.files);
    const hasImageChanges = req.body.retainedImages !== undefined || uploadedFiles.length > 0;
    const retainedImages = hasImageChanges
      ? parseRetainedImages(req.body.retainedImages, existingImages)
      : existingImages;
    uploadedImageUrls.push(...await uploadProductImages(uploadedFiles));

    const productFields = { ...req.body };
    delete productFields.retainedImages;
    const fieldsToSet = normalizeProductFields({ ...productFields, updatedAt: Date.now() });
    if (fieldsToSet.costPrice === undefined) {
      fieldsToSet.costPrice = product.costPrice;
    }
    if (fieldsToSet.taxRate === undefined) {
      fieldsToSet.taxRate = product.taxRate;
    }
    fieldsToSet.taxRate = normalizeTaxRate(fieldsToSet.taxRate);
    fieldsToSet.barcode = normalizeBarcode(fieldsToSet.barcode);

    if (fieldsToSet.barcode === undefined) {
      fieldsToSet.barcode = product.barcode || (await generateUniqueBarcode());
    }

    const nextImages = [...new Set([...retainedImages, ...uploadedImageUrls])];
    if (hasImageChanges) {
      fieldsToSet.images = nextImages;
      fieldsToSet.image = nextImages[0] || null;
    }

    const updateQuery = { $set: fieldsToSet };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      { new: true }
    );

    if (hasImageChanges) {
      await safelyRemoveProductImages(existingImages.filter((image) => !nextImages.includes(image)));
    }
    res.json(updatedProduct);
  } catch (error) {
    if (uploadedImageUrls.length > 0) await safelyRemoveProductImages(uploadedImageUrls);
    if (error.code === 11000 && error.keyPattern?.barcode) {
      return res.status(400).json({ message: 'Barcode already exists' });
    }
    res.status(error.statusCode || 500).json({ message: error.message || 'Unable to update product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const imageUrls = getProductImageUrls(product);
    await product.deleteOne();
    await safelyRemoveProductImages(imageUrls);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const quantity = Number(req.body.quantity);
    if (!Number.isFinite(quantity) || quantity < 0) {
      return res.status(400).json({ message: 'Stock quantity must be a non-negative number' });
    }
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
  getInventoryValuation,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
};
