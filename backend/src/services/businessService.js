const Business = require('../models/Business');
const User = require('../models/User');
let legacyImportPromise;

const getBusinessKey = (name) => name.trim().toLocaleLowerCase().replace(/\s+/g, ' ');

const linkBusinessUser = async (user, name) => {
  const trimmedName = name.trim();
  const key = getBusinessKey(trimmedName);
  let business = user.businessId ? await Business.findById(user.businessId) : null;

  if (business) {
    const existingBusiness = await Business.findOne({ key });
    if (existingBusiness && String(existingBusiness._id) !== String(business._id)) {
      const error = new Error('That business name is already in use');
      error.code = 'BUSINESS_NAME_IN_USE';
      throw error;
    }
    business.name = trimmedName;
    business.key = key;
    await business.save();
    await User.updateMany({ businessId: business._id }, { $set: { businessName: trimmedName } });
  } else {
    business = await Business.findOneAndUpdate(
      { key },
      { $setOnInsert: { key, name: trimmedName } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  user.businessName = trimmedName;
  user.businessId = business._id;
  await user.save();
  return business;
};

const performLegacyImport = async () => {
  const users = await User.find({ businessName: { $type: 'string', $ne: '' } });
  for (const user of users) {
    if (!user.businessName.trim()) continue;
    const key = getBusinessKey(user.businessName);
    const business = await Business.findOneAndUpdate(
      { key },
      { $setOnInsert: { key, name: user.businessName.trim() } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    if (String(user.businessId || '') !== String(business._id)) {
      await User.updateOne({ _id: user._id }, { $set: { businessId: business._id } });
    }
  }
};

const importLegacyBusinesses = () => {
  if (!legacyImportPromise) {
    legacyImportPromise = performLegacyImport().catch((error) => {
      legacyImportPromise = null;
      throw error;
    });
  }
  return legacyImportPromise;
};

module.exports = { getBusinessKey, linkBusinessUser, importLegacyBusinesses };