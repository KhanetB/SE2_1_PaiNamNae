const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth');


// GET /api/export/me
router.get('/me', protect, exportController.downloadMyData);

module.exports = router;

// POST /api/export/email
router.post('/email', protect, userController.handleAccountDeletion);
