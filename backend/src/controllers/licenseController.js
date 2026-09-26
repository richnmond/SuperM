const Business = require('../models/Business');
const License = require('../models/License');
const User = require('../models/User');
const { importLegacyBusinesses } = require('../services/businessService');
const { getLicenseStatus, normalizeLicenseKey } = require('../services/licenseService');

const toCustomerLicense = (license, user) => ({
  plan: license.plan,
  startDate: license.startDate,
  expiryDate: license.expiryDate,
  status: getLicenseStatus(license),
  activated: String(user.activatedLicenseId || '') === String(license._id)
    && Boolean(user.licenseActivatedAt)
});

const getCurrentLicense = async (req, res) => {
  try {
    await importLegacyBusinesses();
    const user = await User.findById(req.user._id).select('businessId activatedLicenseId licenseActivatedAt');
    if (!user?.businessId) return res.json({ license: null });
    const business = await Business.findById(user.businessId).select('status');
    let license = await License.findOne({ business: user.businessId });
    if (!license) {
      const { ensureLicenseForBusiness } = require('../services/licenseService');
      license = await ensureLicenseForBusiness(user.businessId);
    }
    if (!business || !license) return res.json({ license: null, businessStatus: business?.status || 'unavailable' });
    res.json({ license: toCustomerLicense(license, user), businessStatus: business.status });
  } catch (error) {
    res.status(500).json({ message: 'Could not load current license' });
  }
};

const activateLicense = async (req, res) => {
  try {
    const licenseKey = normalizeLicenseKey(req.body.licenseKey);
    if (!licenseKey) return res.status(400).json({ message: 'Enter a license key' });
    const user = await User.findById(req.user._id).select('businessId activatedLicenseId licenseActivatedAt');
    if (!user?.businessId) return res.status(403).json({ message: 'This user is not assigned to a business' });
    const business = await Business.findById(user.businessId).select('status');
    if (!business || business.status !== 'active') {
      return res.status(403).json({ message: 'This business account is suspended', code: 'BUSINESS_SUSPENDED' });
    }
    const license = await License.findOne({ business: user.businessId });
    if (!license || normalizeLicenseKey(license.key) !== licenseKey) {
      return res.status(401).json({ message: 'This license key is not assigned to your business' });
    }
    const status = getLicenseStatus(license);
    if (status !== 'active') {
      return res.status(403).json({ message: `This license is ${status}` , code: `LICENSE_${status.toUpperCase()}` });
    }
    user.activatedLicenseId = license._id;
    user.licenseActivatedAt = new Date();
    await user.save();
    res.json({ license: toCustomerLicense(license, user) });
  } catch (error) {
    res.status(500).json({ message: 'Could not activate license' });
  }
};

module.exports = { getCurrentLicense, activateLicense };