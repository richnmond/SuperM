const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

const listSuppliers = async (req, res) => {
  try {
    const { search, active } = req.query;
    const query = {};

    if (typeof active !== 'undefined') {
      query.active = active === 'true';
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const suppliers = await Supplier.find(query).sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    await supplier.deleteOne();
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const supplierSummary = async (_req, res) => {
  try {
    const totalSuppliers = await Supplier.countDocuments();
    const activeSuppliers = await Supplier.countDocuments({ active: true });
    const categories = await Product.distinct('category');

    res.json({
      totalSuppliers,
      activeSuppliers,
      categories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  supplierSummary
};
