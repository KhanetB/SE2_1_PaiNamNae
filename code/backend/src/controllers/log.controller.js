const asyncHandler = require("express-async-handler");
const logService = require("../services/log.service");
const getLogs = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    userId,
    username,
    ipAddress,
    action,
    accessResult,
    page = 1,
    pageLimit = 25,
  } = req.query;

  const result = await logService.getAllLogs({
    startDate,
    endDate,
    userId,
    username,
    ipAddress,
    action: action ? action.split(",") : undefined,
    accessResult,
    page: parseInt(page),
    pageLimit: parseInt(pageLimit),
  });

  res.status(200).json({
    success: true,
    message: "Logs retrived successfully",
    ...result,
  });
});

const verifyIntegrity = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 500;
  const result = await logService.verifyChainIntegrity(limit);

  res.status(200).json({
    success: true,
    message: result.valid
      ? "Records integrity verified — all checked records intact"
      : `Records integrity BROKEN at record ${result.corruptAt}`,
    data: result,
  });
});

const exportLogs = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    userId,
    username,
    ipAddress,
    action,
    accessResult,
    userFields,
    format = "csv",
  } = req.query;

  const filters = {
    startDate,
    endDate,
    userId,
    ipAddress,
    action: action ? action.split(",") : undefined,
    username,
    accessResult,
  };


  const selectedUserFileds = userFields ? userFields.split(",").map((f) => f.trim()) : [];
  const logs = await logService.getLogsToExport(filters, selectedUserFileds);
  const date = new Date().toISOString().split("T")[0];

  if (format == "json") {
    const fileName = `audit-log-export-${date}.json`;
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(logs);
  }

  /// default as csv format
  const csvContent = logService.logsToCSV(logs, selectedUserFileds);
  const fileName = `audit-log-export-${date}.csv`;
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.status(200).send(csvContent);
});
module.exports = { getLogs, verifyIntegrity, exportLogs };
