const crypto = require("crypto");
const prisma = require("../utils/prisma");

/**
 * Compute SHA-256 hash for log entry key field.
 **/
function computeHash(data) {
  const payload = [
    data.action,
    data.userId || "",
    data.ipAddress,
    data.httpMethod || "",
    data.endpoint || "",
    data.accessResult,
    data.httpStatusCode || "",
    data.errorMessage || "",
    data.actionTimeStamp instanceof Date
      ? data.actionTimeStamp.toISOString()
      : data.actionTimeStamp,
  ].join("|");

  return crypto.createHash("sha256").update(payload).digest("hex");
}

async function getLastHash() {
  const lastLog = await prisma.auditLog.findFirst({
    orderBy: { createdAt: "desc" },
    select: { currentHash: true },
  });

  return lastLog ? lastLog.currentHash : null;
}

async function createLog(data) {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 90);
  const logData = {
    userId: data.userId || null,
    userSnapshot: data.userSnapshot || null,
    action: data.action,
    actionTimeStamp: data.actionTimeStamp || now,
    ipAddress: data.ipAddress || "unknown",
    userAgent: data.userAgent || "unknown",
    deviceInfo: data.deviceInfo || null,
    httpMethod: data.httpMethod || null,
    endpoint: data.endpoint || "unknown",
    resourceType: data.resourceType || "UNKNOWN",
    accessResult: data.accessResult || "SUCCESS",
    httpStatusCode: data.httpStatusCode || "200",
    metaData: data.metaData || null,
    errorMessage: data.errorMessage || null,
    createdAt: now,
    expiresAt: expiresAt,
  };
  console.log("Log Data: ", logData);
  logData.intergrityHash = computeHash(logData);
  const log = await prisma.auditLog.create({ data: logData });
  return log;
}

async function getAllLogs(filters = {}) {
  const {
    startDate,
    endDate,
    userId,
    ipAddress,
    action,
    accessResult,
    page = 1,
    pageLimit = 25,
  } = filters;
  const where = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  if (userId) {
    where.userId = { contains: userId, mode: "insensitive" };
  }

  if (ipAddress) {
    where.ipAddress = { contains: ipAddress };
  }

  if (action && action.length > 0) {
    where.action = { in: action };
  }

  if (accessResult) {
    where.accessResult = accessResult;
  }

  const skip = (page - 1) * pageLimit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageLimit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: logs,
    pagination: {
      page,
      pageLimit,
      total,
      totalPages: Math.ceil(total / pageLimit),
    },
  };
}

async function verifyChainIntegrity(limit = 500) {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  if (logs.length === 0) {
    return { valid: true, totalChecked: 0 };
  }

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];

    // Verify intergrityHash by recomputing
    const recomputedHash = computeHash(log);
    if (recomputedHash !== log.intergrityHash) {
      return {
        valid: false,
        totalChecked: i + 1,
        corruptAt: log.id,
        reason: "intergrityHash mismatch",
      };
    }
  }

  return { valid: true, totalChecked: logs.length };
}
function getLogStats() {}

function logsToCSV() {}

function getLogsToExport() {}

module.exports = { createLog, getAllLogs, verifyChainIntegrity };
