const express = require('express');
const { getCurrentLicense, activateLicense } = require('../controllers/licenseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/current', getCurrentLicense);
router.post('/activate', activateLicense);

module.exports = router;