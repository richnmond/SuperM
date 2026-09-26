const Business = require('../models/Business');
const User = require('../models/User');
let legacyImportPromise;

const getBusinessKey = (name) => name.trim().toLocaleLowerCase().replace(/\s+/g, ' ');

const linkBusinessUser = async (user, name) => {
  const trimmedName = name.trim();
  const key = getBusinessKey(trimmedName);
  const business = await Business.findOneAndUpdate(
    { key },
    { $setOnInsert: { key, name: trimmedName } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

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