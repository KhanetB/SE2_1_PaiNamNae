const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const { protect } = require('../middlewares/auth');


// GET /api/export/me
router.get('/me', protect, exportController.downloadMyData);

module.exports = router;