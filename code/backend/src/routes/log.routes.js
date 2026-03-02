const express = require("express");

const { protect, requireAdmin } = require("../middlewares/auth");
const logController = require("../controllers/log.controller");

const router = express.Router();
// All log routes require admin authentication
router.use(protect, requireAdmin);

// GET /api/logs
router.get("/", logController.getLogs);

// GET /api/logs/verify
router.get("/verify", logController.verifyIntegrity);

// GET /api/logs/export
router.get("/export", logController.exportLogs);

// // Export requests (SLA-based)
// router.post("/export-requests", logController.createExportRequest);
// router.get("/export-requests", logController.listExportRequests);
// router.get("/export-requests/:id", logController.getExportRequest);
// router.get(
//   "/export-requests/:id/download",
//   logController.downloadExportRequest,
// );

module.exports = router;
