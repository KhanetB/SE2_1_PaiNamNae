const crypto = require('crypto');
const prisma = require('../utils/prisma');

/**
 * Compute SHA-256 hash for a log entry's key fields.
 * This forms the chain integrity mechanism.
 */
function computeHash(data) {
  const payload = [
    data.eventType,
    data.userId || '',
    data.ipAddress,
    data.httpMethod || '',
    data.endpoint || '',
    data.accessResult,
    data.statusCode || '',
    data.errorMessage || '',
    data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt,
    data.previousHash || '',
  ].join('|');

  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Get the hash of the most recent log entry (for chain linking).
 */
async function getLastHash() {
  const lastLog = await prisma.auditLog.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { currentHash: true },
  });
  return lastLog ? lastLog.currentHash : null;
}

/**
 * Create an immutable audit log entry with chain hashing.
 * @param {Object} data - Log entry data
 * @returns {Promise<Object>} Created log entry
 */
async function createLog(data) {
  const previousHash = await getLastHash();

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 90); // 90-day minimum retention

  const logData = {
    eventType: data.eventType,
    userId: data.userId || null,
    userEmail: data.userEmail || null,
    userRole: data.userRole || null,
    nationalIdHash: data.nationalIdHash || null,
    ipAddress: data.ipAddress || 'unknown',
    userAgent: data.userAgent || null,
    httpMethod: data.httpMethod || null,
    endpoint: data.endpoint || null,
    resourceType: data.resourceType || null,
    resourceId: data.resourceId || null,
    accessResult: data.accessResult || 'SUCCESS',
    statusCode: data.statusCode || null,
    errorMessage: data.errorMessage || null,
    details: data.details || null,
    sessionId: data.sessionId || null,
    previousHash: previousHash,
    createdAt: now,
    expiresAt: expiresAt,
  };

  logData.currentHash = computeHash(logData);

  const log = await prisma.auditLog.create({ data: logData });
  return log;
}

/**
 * Query audit logs with filters and pagination.
 */
async function getAllLogs(filters = {}) {
  const {
    startDate,
    endDate,
    userId,
    ipAddress,
    eventTypes,
    accessResult,
    page = 1,
    pageSize = 25,
  } = filters;

  const where = {};

  // Date range filter
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  // User filter
  if (userId) {
    where.OR = [
      { userId: { contains: userId, mode: 'insensitive' } },
      { userEmail: { contains: userId, mode: 'insensitive' } },
    ];
  }

  // IP filter
  if (ipAddress) {
    where.ipAddress = { contains: ipAddress };
  }

  // Event type filter (multi-select)
  if (eventTypes && eventTypes.length > 0) {
    where.eventType = { in: eventTypes };
  }

  // Access result filter
  if (accessResult) {
    where.accessResult = accessResult;
  }

  const skip = (page - 1) * pageSize;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: logs,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Verify the integrity of the hash chain.
 * Checks that each log's currentHash matches a recomputed hash and
 * each log's previousHash matches the prior log's currentHash.
 * @param {number} limit - Number of recent records to check
 * @returns {{ valid: boolean, totalChecked: number, corruptAt?: string }}
 */
async function verifyChainIntegrity(limit = 500) {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  if (logs.length === 0) {
    return { valid: true, totalChecked: 0 };
  }

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];

    // Verify currentHash by recomputing
    const recomputedHash = computeHash(log);
    if (recomputedHash !== log.currentHash) {
      return {
        valid: false,
        totalChecked: i + 1,
        corruptAt: log.id,
        reason: 'currentHash mismatch',
      };
    }

    // Verify chain linkage (previousHash of current = currentHash of previous)
    if (i > 0) {
      if (log.previousHash !== logs[i - 1].currentHash) {
        return {
          valid: false,
          totalChecked: i + 1,
          corruptAt: log.id,
          reason: 'previousHash chain break',
        };
      }
    } else {
      // First record should have null previousHash
      // (or match if there are older records not in this batch)
    }
  }

  return { valid: true, totalChecked: logs.length };
}

/**
 * Get log statistics grouped by event type for the last 30 days.
 */
async function getLogStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const stats = await prisma.auditLog.groupBy({
    by: ['eventType'],
    _count: { id: true },
    where: {
      createdAt: { gte: thirtyDaysAgo },
    },
    orderBy: { _count: { id: 'desc' } },
  });

  const totalLogs = await prisma.auditLog.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  });

  const byAccessResult = await prisma.auditLog.groupBy({
    by: ['accessResult'],
    _count: { id: true },
    where: { createdAt: { gte: thirtyDaysAgo } },
  });

  return {
    byEventType: stats.map((s) => ({
      eventType: s.eventType,
      count: s._count.id,
    })),
    byAccessResult: byAccessResult.map((s) => ({
      accessResult: s.accessResult,
      count: s._count.id,
    })),
    totalLogs,
    period: {
      from: thirtyDaysAgo.toISOString(),
      to: new Date().toISOString(),
    },
  };
}

/**
 * Export logs as CSV string based on filters.
 */
function logsToCSV(logs, includeNationalId = false) {
  const headers = [
    'ID',
    'Timestamp',
    'Event Type',
    'User ID',
    'User Email',
    'User Role',
    ...(includeNationalId ? ['National ID Hash'] : []),
    'IP Address',
    'User Agent',
    'HTTP Method',
    'Endpoint',
    'Resource Type',
    'Resource Id',
    'Access Result',
    'Status Code',
    'Session ID',
    'Details',
  ];

  const rows = logs.map((log) => {
    const row = [
      log.id,
      log.createdAt.toISOString(),
      log.eventType,
      log.userId || '',
      log.userEmail || '',
      log.userRole || '',
      ...(includeNationalId ? [log.nationalIdHash || ''] : []),
      log.ipAddress,
      log.userAgent || '',
      log.httpMethod || '',
      log.endpoint || '',
      log.resourceType || '',
      log.resourceId || '',
      log.accessResult,
      log.statusCode || '',
      log.sessionId || '',
      log.details ? JSON.stringify(log.details).replace(/"/g, '""') : '',
    ];
    return row.map((field) => `"${field}"`).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Get all logs for export (no pagination limit).
 */
async function getLogsForExport(filters = {}) {
  const {
    startDate,
    endDate,
    userId,
    ipAddress,
    eventTypes,
    accessResult,
  } = filters;

  const where = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }
  if (userId) {
    where.OR = [
      { userId: { contains: userId, mode: 'insensitive' } },
      { userEmail: { contains: userId, mode: 'insensitive' } },
    ];
  }
  if (ipAddress) where.ipAddress = { contains: ipAddress };
  if (eventTypes && eventTypes.length > 0) where.eventType = { in: eventTypes };
  if (accessResult) where.accessResult = accessResult;

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

// =============================================
// Export Request Management (SLA Compliance)
// =============================================

async function createExportRequest(data) {
  return prisma.exportRequest.create({ data });
}

async function listExportRequests() {
  return prisma.exportRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

async function getExportRequestById(id) {
  return prisma.exportRequest.findUnique({ where: { id } });
}

async function updateExportRequest(id, data) {
  // Use raw query to update since AuditLog has triggers, but ExportRequest does not
  return prisma.exportRequest.update({ where: { id }, data });
}

module.exports = {
  createLog,
  getAllLogs,
  verifyChainIntegrity,
  getLogStats,
  logsToCSV,
  getLogsForExport,
  createExportRequest,
  listExportRequests,
  getExportRequestById,
  updateExportRequest,
  computeHash, // exported for testing
};
