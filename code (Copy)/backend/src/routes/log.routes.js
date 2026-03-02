const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middlewares/auth');
const logController = require('../controllers/log.controller');

// All log routes require admin authentication
router.use(protect, requireAdmin);

// Log viewing and stats
router.get('/', logController.getLogs);
router.get('/stats', logController.getLogStats);
router.get('/verify', logController.verifyIntegrity);

// Quick export (immediate download)
router.get('/export', logController.exportLogs);

// Export requests (SLA-based)
router.post('/export-requests', logController.createExportRequest);
router.get('/export-requests', logController.listExportRequests);
router.get('/export-requests/:id', logController.getExportRequest);
router.get('/export-requests/:id/download', logController.downloadExportRequest);

module.exports = router;
