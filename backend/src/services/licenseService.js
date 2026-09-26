const crypto = require('crypto');
const License = require('../models/License');
const Business = require('../models/Business');

const generateLicenseKey = () => crypto.randomBytes(18).toString('hex').toUpperCase().match(/.{1,6}/g).join('-');

const normalizeLicenseKey = (key) => String(key || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const getLicenseStatus = (license, now = new Date()) => {
  if (license.status === 'suspended') return 'suspended';
  if (new Date(license.expiryDate) <= now) return 'expired';
  if (new Date(license.startDate) > now) return 'pending';
  return 'active';
};

const ensureLicenseForBusiness = async (businessId) => {
  const business = await Business.findById(businessId).select('createdAt licenseExpiresAt');
  if (!business || !business.licenseExpiresAt) return null;
  try {
    return await License.findOneAndUpdate(
      { business: business._id },
      {
        $setOnInsert: {
          key: generateLicenseKey(),
          business: business._id,
          plan: 'starter',
          startDate: business.createdAt || new Date(),
          expiryDate: business.licenseExpiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          status: 'active'
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    if (error.code === 11000) return License.findOne({ business: business._id });
    throw error;
  }
};

const importLegacyLicenses = async () => {
  const legacyBusinesses = await Business.find({ licenseExpiresAt: { $exists: true, $ne: null } }).select('_id');
  for (const business of legacyBusinesses) await ensureLicenseForBusiness(business._id);
};

module.exports = { generateLicenseKey, normalizeLicenseKey, getLicenseStatus, ensureLicenseForBusiness, importLegacyLicenses };