const asyncHandler = require("express-async-handler");
const logService = require("../services/log.service");
const ApiError = require("../utils/ApiError");
const getLogs = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    userId,
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
module.exports = { getLogs, verifyIntegrity };
