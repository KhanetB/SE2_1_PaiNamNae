const crypto = require("crypto");
const prisma = require("../utils/prisma");
const { includes } = require("zod/v4");

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


async function createLog(data) {
  const now = new Date();
  const logData = {
     userId: data.userId || null,
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
  };
  logData.integrityHash = computeHash(logData);
  const log = await prisma.auditLog.create({ data: logData });
  console.log("Log: ", log.createdAt);
  return log;
}

async function getAllLogs(filters = {}) {
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
  } = filters;

  const where = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    // if (endDate) where.createdAt.lte = new Date(endDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23,59,59, 999);
      where.createdAt.lte = new Date(end);
    }
  }

  if (userId) {
    where.userId = { contains: userId, mode: "insensitive" };
  }

  if (username) {
    where.user = {
      username: {
        contains: username,
        mode: "insensitive",
      },
    };
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
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
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

    // Verify integrityHash by recomputing
    const recomputedHash = computeHash(log);
    if (recomputedHash !== log.integrityHash) {
      return {
        valid: false,
        totalChecked: i + 1,
        corruptAt: log.id,
        reason: "integrityHash mismatch",
      };
    }
  }

  return { valid: true, totalChecked: logs.length };
}

function logsToCSV(logs, selectedUserFields = []) {
  if (!logs || logs.length === 0) return "";

  const baseHeaders = ["id", "userId", "ipAddress", "action", "createdAt"];
  const headers = [...baseHeaders, ...selectedUserFields];

  const rows = logs.map((log) => {
    const row = headers.map((header) => {
      let value = "";

      if (baseHeaders.includes(header)) {
        value = log[header];
      } else if (selectedUserFields.includes(header)) {
        value = log.user ? log.user[header] : "";
      }

      if (value === null || value === undefined || value === "") return '""';
      if (value instanceof Date) return `"${value.toISOString()}"`;
      if (typeof value === "object") {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }

      return `"${String(value).replace(/"/g, '""')}"`;
    });

    return row.join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

async function getLogsToExport(filters = {}, selectedUserFields = []) {
  const {
    startDate,
    endDate,
    userId,
    ipAddress,
    action,
    accessResult,
    username,
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

  if (username) {
    where.user = {
      username: {
        contains: username,
        mode: "insensitive",
      },
    };
  }

  let includeUser = false;

  if (selectedUserFields.length > 0) {
    const userSelect = {};
    selectedUserFields.forEach((field) => {
      userSelect[field] = true;
    });

    includeUser = {
      select: userSelect,
    };
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: includeUser,
    },
  });

  return logs;
}

function maskPII(data) {
  if (!data) return null;

  const sanitized = { ...data };

  const sensitiveFields = [
    "password",
    "currentPassword",
    "newPassword",
    "token",
    "accessToken",
    "refreshToken",
    "otpCode",
  ];

  const partialFields = {
    email: (val) => {
      if (!val) return val;
      const [name, domain] = val.split("@");
      return `${name.substring(0, 3)}***@${domain}`;
    },
    phoneNumber: (val) => {
      val ? val.replace(/(\d{3})\d{4}(\d{3})/, "$1XXXX$2") : val;
    },
    nationalIdNumber: (val) =>
      val ? val.replace(/(\d{1})\d{8}(\d{4})/, "$1XXXXXXXX$2") : val,
  };

  for (const field of sensitiveFields) {
    if (sanitized[field]) sanitized[field] = "[REDACTED]";
  }

  for (const [field, masker] of Object.entries(partialFields)) {
    if (sanitized[field]) sanitized[field] = masker(sanitized[field]);
  }
  return sanitized;
}

module.exports = {
  createLog,
  getAllLogs,
  verifyChainIntegrity,
  logsToCSV,
  getLogsToExport,
  maskPII,
};
