const express = require('express');
const {
  login,
  getDashboard,
  listBusinesses,
  getBusiness,
  updateBusinessStatus,
  updateUserStatus,
  addBranch,
  removeBranch,
  getActivity,
  listLicenses,
  createLicense,
  updateLicenseStatus,
  extendLicense,
  changeLicensePlan
} = require('../controllers/ownerController');
const { ownerProtect } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.use(ownerProtect);
router.get('/dashboard', getDashboard);
router.get('/businesses', listBusinesses);
router.get('/businesses/:id', getBusiness);
router.patch('/businesses/:id/status', updateBusinessStatus);
router.post('/businesses/:id/branches', addBranch);
router.delete('/businesses/:id/branches/:branchId', removeBranch);
router.patch('/users/:userId/status', updateUserStatus);
router.get('/activity', getActivity);
router.get('/licenses', listLicenses);
router.post('/licenses', createLicense);
router.patch('/licenses/:id/status', updateLicenseStatus);
router.post('/licenses/:id/extend', extendLicense);
router.patch('/licenses/:id/plan', changeLicensePlan);

module.exports = router;