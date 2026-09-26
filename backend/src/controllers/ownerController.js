const jwt = require('jsonwebtoken');
const Owner = require('../models/Owner');
const Business = require('../models/Business');
const User = require('../models/User');
const OwnerActivity = require('../models/OwnerActivity');
const License = require('../models/License');
const { importLegacyBusinesses } = require('../services/businessService');
const { generateLicenseKey, getLicenseStatus, importLegacyLicenses } = require('../services/licenseService');

const licensePlans = ['starter', 'professional', 'enterprise'];

const recordOwnerActivity = (action, description, businessId) => OwnerActivity.create({ action, description, businessId });

const login = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const owner = await Owner.findOne({ email });
    if (!owner || !(await owner.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid owner credentials' });
    }
    const token = jwt.sign({ id: owner._id, type: 'owner' }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, owner: { id: owner._id, email: owner.email } });
  } catch (error) {
    res.status(500).json({ message: 'Owner sign-in failed' });
  }
};

const getDashboard = async (req, res) => {
  try {
    await importLegacyBusinesses();
    await importLegacyLicenses();
    const now = new Date();
    const [totalBusinesses, totalUsers, totalBranches, allLicenses, businesses, activity] = await Promise.all([
      Business.countDocuments(),
      User.countDocuments(),
      Business.aggregate([{ $project: { branchCount: { $size: '$branches' } } }, { $group: { _id: null, count: { $sum: '$branchCount' } } }]),
      License.find().select('status startDate expiryDate'),
      Business.find().sort({ updatedAt: -1 }).limit(5).lean(),
      OwnerActivity.find().sort({ createdAt: -1 }).limit(8).populate('businessId', 'name').lean()
    ]);
    const activeLicenses = allLicenses.filter((license) => getLicenseStatus(license, now) === 'active').length;
    const expiredLicenses = allLicenses.filter((license) => getLicenseStatus(license, now) === 'expired').length;
    res.json({
      stats: { totalBusinesses, totalUsers, totalBranches: totalBranches[0]?.count || 0, activeLicenses, expiredLicenses },
      recentBusinesses: businesses,
      activity
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load owner dashboard' });
  }
};

const listBusinesses = async (req, res) => {
  try {
    await importLegacyBusinesses();
    await importLegacyLicenses();
    const query = {};
    const search = String(req.query.search || '').trim();
    const status = String(req.query.status || 'all');
    const license = String(req.query.license || 'all');
    if (search) query.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (status === 'active' || status === 'suspended') query.status = status;

    const businesses = await Business.find(query).sort({ name: 1 }).lean();
    const ids = businesses.map((business) => business._id);
    const users = await User.find({ businessId: { $in: ids } }).select('username email role isActive businessId createdAt').lean();
    const licenses = await License.find({ business: { $in: ids } }).lean();
    const licenseByBusiness = new Map(licenses.map((license) => [String(license.business), { ...license, effectiveStatus: getLicenseStatus(license) }]));
    const filteredBusinesses = license === 'all'
      ? businesses
      : businesses.filter((business) => licenseByBusiness.get(String(business._id))?.effectiveStatus === license);
    const userGroups = new Map();
    for (const user of users) {
      const key = String(user.businessId);
      userGroups.set(key, [...(userGroups.get(key) || []), user]);
    }
    res.json(filteredBusinesses.map((business) => ({ ...business, users: userGroups.get(String(business._id)) || [], license: licenseByBusiness.get(String(business._id)) || null })));
  } catch (error) {
    res.status(500).json({ message: 'Failed to list businesses' });
  }
};

const getBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).lean();
    if (!business) return res.status(404).json({ message: 'Business not found' });
    const [users, license] = await Promise.all([
      User.find({ businessId: business._id }).select('username email role isActive createdAt').lean(),
      License.findOne({ business: business._id }).lean()
    ]);
    res.json({ ...business, users, license: license ? { ...license, effectiveStatus: getLicenseStatus(license) } : null });
  } catch (error) {
    res.status(400).json({ message: 'Invalid business ID' });
  }
};

const updateBusinessStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) return res.status(400).json({ message: 'Invalid business status' });
    const business = await Business.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!business) return res.status(404).json({ message: 'Business not found' });
    await OwnerActivity.create({ action: status === 'suspended' ? 'business_suspended' : 'business_reactivated', description: `${business.name} was ${status}`, businessId: business._id });
    res.json(business);
  } catch (error) {
    res.status(400).json({ message: 'Could not update business status' });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') return res.status(400).json({ message: 'isActive must be a boolean' });
    const user = await User.findByIdAndUpdate(req.params.userId, { isActive }, { new: true }).select('username email role isActive businessId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    await OwnerActivity.create({ action: isActive ? 'user_reactivated' : 'user_suspended', description: `${user.email} was ${isActive ? 'reactivated' : 'suspended'}`, businessId: user.businessId, userId: user._id });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Could not update user status' });
  }
};

const addBranch = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const location = String(req.body.location || '').trim();
    if (!name) return res.status(400).json({ message: 'Branch name is required' });
    const business = await Business.findByIdAndUpdate(req.params.id, { $push: { branches: { name, location } } }, { new: true });
    if (!business) return res.status(404).json({ message: 'Business not found' });
    await OwnerActivity.create({ action: 'branch_added', description: `Branch ${name} added to ${business.name}`, businessId: business._id });
    res.status(201).json(business);
  } catch (error) {
    res.status(400).json({ message: 'Could not add branch' });
  }
};

const removeBranch = async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { $pull: { branches: { _id: req.params.branchId } } },
      { new: true }
    );
    if (!business) return res.status(404).json({ message: 'Business not found' });
    await OwnerActivity.create({ action: 'branch_removed', description: `A branch was removed from ${business.name}`, businessId: business._id });
    res.json(business);
  } catch (error) {
    res.status(400).json({ message: 'Could not remove branch' });
  }
};

const getActivity = async (req, res) => {
  try {
    const [ownerEvents, newUsers] = await Promise.all([
      OwnerActivity.find().sort({ createdAt: -1 }).limit(100).populate('businessId', 'name').lean(),
      User.find().sort({ createdAt: -1 }).limit(30).select('email businessName createdAt').lean()
    ]);
    const registrations = newUsers.map((user) => ({
      action: 'user_registered',
      description: `${user.email} registered${user.businessName ? ` for ${user.businessName}` : ''}`,
      createdAt: user.createdAt,
      businessId: null
    }));
    res.json([...ownerEvents, ...registrations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 100));
  } catch (error) {
    res.status(500).json({ message: 'Failed to load activity' });
  }
};

const listLicenses = async (req, res) => {
  try {
    await importLegacyBusinesses();
    await importLegacyLicenses();
    const licenses = await License.find().populate('business', 'name status').sort({ updatedAt: -1 }).lean();
    const statusFilter = String(req.query.status || 'all');
    const results = licenses.map((license) => ({ ...license, effectiveStatus: getLicenseStatus(license) }));
    res.json(statusFilter === 'all' ? results : results.filter((license) => license.effectiveStatus === statusFilter));
  } catch (error) {
    res.status(500).json({ message: 'Could not load licenses' });
  }
};

const createLicense = async (req, res) => {
  try {
    const { businessId, plan } = req.body;
    const startDate = req.body.startDate ? new Date(req.body.startDate) : new Date();
    const expiryDate = req.body.expiryDate ? new Date(req.body.expiryDate) : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
    if (!businessId || !licensePlans.includes(plan)) return res.status(400).json({ message: 'Business and a valid plan are required' });
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(expiryDate.getTime()) || expiryDate <= startDate) {
      return res.status(400).json({ message: 'Expiry date must be later than the start date' });
    }
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    if (await License.exists({ business: business._id })) {
      return res.status(409).json({ message: 'This business already has a license. Extend, update, or suspend its current license.' });
    }
    const license = await License.create({ key: generateLicenseKey(), business: business._id, plan, startDate, expiryDate, status: 'active' });
    await recordOwnerActivity('license_created', `${plan} license created for ${business.name}`, business._id);
    res.status(201).json(license);
  } catch (error) {
    res.status(400).json({ message: 'Could not create license' });
  }
};

const updateLicenseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) return res.status(400).json({ message: 'Status must be active or suspended' });
    const license = await License.findById(req.params.id).populate('business', 'name');
    if (!license) return res.status(404).json({ message: 'License not found' });
    license.status = status;
    await license.save();
    await recordOwnerActivity(`license_${status}`, `License for ${license.business.name} was ${status}`, license.business._id);
    res.json({ ...license.toObject(), effectiveStatus: getLicenseStatus(license) });
  } catch (error) {
    res.status(400).json({ message: 'Could not update license status' });
  }
};

const extendLicense = async (req, res) => {
  try {
    const days = Number(req.body.days);
    if (!Number.isInteger(days) || days < 1 || days > 3650) return res.status(400).json({ message: 'Extension must be between 1 and 3650 days' });
    const license = await License.findById(req.params.id).populate('business', 'name');
    if (!license) return res.status(404).json({ message: 'License not found' });
    const currentExpiry = new Date(license.expiryDate);
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
    license.expiryDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
    await license.save();
    await recordOwnerActivity('license_extended', `License for ${license.business.name} extended by ${days} days`, license.business._id);
    res.json({ ...license.toObject(), effectiveStatus: getLicenseStatus(license) });
  } catch (error) {
    res.status(400).json({ message: 'Could not extend license' });
  }
};

const changeLicensePlan = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!licensePlans.includes(plan)) return res.status(400).json({ message: 'Invalid license plan' });
    const license = await License.findById(req.params.id).populate('business', 'name');
    if (!license) return res.status(404).json({ message: 'License not found' });
    const previousPlan = license.plan;
    license.plan = plan;
    await license.save();
    await recordOwnerActivity('license_plan_changed', `${license.business.name} plan changed from ${previousPlan} to ${plan}`, license.business._id);
    res.json({ ...license.toObject(), effectiveStatus: getLicenseStatus(license) });
  } catch (error) {
    res.status(400).json({ message: 'Could not change license plan' });
  }
};

module.exports = { login, getDashboard, listBusinesses, getBusiness, updateBusinessStatus, updateUserStatus, addBranch, removeBranch, getActivity, listLicenses, createLicense, updateLicenseStatus, extendLicense, changeLicensePlan };