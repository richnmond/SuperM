const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Owner = require('../models/Owner');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type === 'owner') {
        return res.status(403).json({ message: 'Owner credentials cannot access business services' });
      }
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user || req.user.isActive === false) {
        return res.status(401).json({ message: 'Account is inactive or unavailable' });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const requireBusinessLicense = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user?.businessId) {
      return res.status(403).json({ message: 'A business license is required', code: 'LICENSE_REQUIRED' });
    }
    const Business = require('../models/Business');
    const License = require('../models/License');
    const { ensureLicenseForBusiness, getLicenseStatus } = require('../services/licenseService');
    const business = await Business.findById(user.businessId).select('status');
    if (!business) return res.status(403).json({ message: 'Business account unavailable', code: 'BUSINESS_UNAVAILABLE' });
    if (business.status !== 'active') {
      return res.status(403).json({ message: 'This business account is suspended', code: 'BUSINESS_SUSPENDED' });
    }
    let license = await License.findOne({ business: user.businessId });
    if (!license) license = await ensureLicenseForBusiness(user.businessId);
    if (!license) return res.status(403).json({ message: 'A business license is required', code: 'LICENSE_REQUIRED' });
    const status = getLicenseStatus(license);
    if (status !== 'active') {
      return res.status(403).json({ message: `Business license is ${status}`, code: `LICENSE_${status.toUpperCase()}` });
    }
    if (String(user.activatedLicenseId || '') !== String(license._id) || !user.licenseActivatedAt) {
      return res.status(403).json({ message: 'Activate your business license to continue', code: 'LICENSE_NOT_ACTIVATED' });
    }
    req.license = license;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Could not verify business license', code: 'LICENSE_CHECK_FAILED' });
  }
};

const ownerProtect = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || '';
    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Owner authorization required' });
    }
    const decoded = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
    if (decoded.type !== 'owner') {
      return res.status(403).json({ message: 'Owner access required' });
    }
    req.owner = await Owner.findById(decoded.id).select('-password');
    if (!req.owner) return res.status(401).json({ message: 'Owner account unavailable' });
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as admin' });
  }
};

module.exports = { protect, admin, ownerProtect, requireBusinessLicense };