const Customer = require('../models/Customer');

const listCustomers = async (req, res) => {
  try {
    const { search, vip } = req.query;
    const query = {};

    if (typeof vip !== 'undefined') {
      query.vip = vip === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    await customer.deleteOne();
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const customerSummary = async (_req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const vipCustomers = await Customer.countDocuments({ vip: true });
    const totalLoyaltyPoints = await Customer.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$loyaltyPoints' }
        }
      }
    ]);

    res.json({
      totalCustomers,
      vipCustomers,
      totalLoyaltyPoints: totalLoyaltyPoints[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  customerSummary
};
