const asyncHandler = require('express-async-handler');
const logService = require('../services/log.service');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/logs
 * Get paginated audit logs with filters (Admin only)
 */
const getLogs = asyncHandler(async (req, res) => {
    const {
        startDate,
        endDate,
        userId,
        ipAddress,
        eventTypes,
        accessResult,
        page = 1,
        pageSize = 25,
    } = req.query;

    // Log the admin viewing logs
    await logService.createLog({
        eventType: 'ADMIN_LOG_VIEWED',
        userId: req.user.sub,
        userRole: req.user.role,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
        userAgent: req.headers['user-agent'],
        httpMethod: 'GET',
        endpoint: '/api/logs',
        accessResult: 'SUCCESS',
        statusCode: 200,
    });

    const result = await logService.getAllLogs({
        startDate,
        endDate,
        userId,
        ipAddress,
        eventTypes: eventTypes ? eventTypes.split(',') : undefined,
        accessResult,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
    });

    res.status(200).json({
        success: true,
        message: 'Logs retrieved successfully',
        ...result,
    });
});

/**
 * GET /api/logs/stats
 * Get log statistics for dashboard charts
 */
const getLogStats = asyncHandler(async (req, res) => {
    const stats = await logService.getLogStats();

    res.status(200).json({
        success: true,
        message: 'Log statistics retrieved successfully',
        data: stats,
    });
});

/**
 * GET /api/logs/verify
 * Verify hash chain integrity
 */
const verifyIntegrity = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 500;
    const result = await logService.verifyChainIntegrity(limit);

    res.status(200).json({
        success: true,
        message: result.valid
            ? 'Chain integrity verified — all records intact'
            : `Chain integrity BROKEN at record ${result.corruptAt}`,
        data: result,
    });
});

/**
 * GET /api/logs/export
 * Quick export logs as CSV or JSON (Admin only)
 */
const exportLogs = asyncHandler(async (req, res) => {
    const {
        startDate,
        endDate,
        userId,
        ipAddress,
        eventTypes,
        accessResult,
        includeNationalId,
        format = 'csv',
    } = req.query;

    const filters = {
        startDate,
        endDate,
        userId,
        ipAddress,
        eventTypes: eventTypes ? eventTypes.split(',') : undefined,
        accessResult,
    };

    const logs = await logService.getLogsForExport(filters);

    // Log the export action
    await logService.createLog({
        eventType: 'ADMIN_LOG_EXPORTED',
        userId: req.user.sub,
        userRole: req.user.role,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
        userAgent: req.headers['user-agent'],
        httpMethod: 'GET',
        endpoint: '/api/logs/export',
        accessResult: 'SUCCESS',
        statusCode: 200,
        details: { filters, format, recordCount: logs.length },
    });

    const date = new Date().toISOString().split('T')[0];

    if (format === 'json') {
        const fileName = `audit-log-export-${date}.json`;
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(logs);
    }

    // Default: CSV
    const csvContent = logService.logsToCSV(logs, includeNationalId === 'true');
    const fileName = `audit-log-export-${date}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.status(200).send(csvContent);
});

/**
 * POST /api/logs/export-requests
 * Create an export request with SLA deadline (Admin only)
 */
const createExportRequest = asyncHandler(async (req, res) => {
    const {
        officerName,
        officerOrganization,
        deadline,
        filters,
        format = 'csv',
    } = req.body;

    if (!officerName || !officerOrganization || !deadline) {
        throw new ApiError(400, 'officerName, officerOrganization, and deadline are required');
    }

    // Validate SLA deadline (7-15 days from now)
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const minDeadline = new Date(now);
    minDeadline.setDate(minDeadline.getDate() + 7);
    const maxDeadline = new Date(now);
    maxDeadline.setDate(maxDeadline.getDate() + 15);

    if (deadlineDate < minDeadline) {
        throw new ApiError(400, 'Deadline must be at least 7 days from now (SLA requirement)');
    }
    if (deadlineDate > maxDeadline) {
        throw new ApiError(400, 'Deadline must not exceed 15 days from now (SLA requirement)');
    }

    const exportRequest = await logService.createExportRequest({
        requestedBy: req.user.sub,
        officerName,
        officerOrganization,
        deadline: deadlineDate,
        filters: filters || {},
        format,
        status: 'PENDING',
    });

    // Log the export request creation
    await logService.createLog({
        eventType: 'ADMIN_ACTION',
        userId: req.user.sub,
        userRole: req.user.role,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
        userAgent: req.headers['user-agent'],
        httpMethod: 'POST',
        endpoint: '/api/logs/export-requests',
        resourceType: 'EXPORT_REQUEST',
        resourceId: exportRequest.id,
        accessResult: 'SUCCESS',
        statusCode: 201,
        details: { officerName, officerOrganization, deadline },
    });

    res.status(201).json({
        success: true,
        message: 'Export request created successfully',
        data: exportRequest,
    });
});

/**
 * GET /api/logs/export-requests
 * List all export requests
 */
const listExportRequests = asyncHandler(async (req, res) => {
    const requests = await logService.listExportRequests();

    res.status(200).json({
        success: true,
        message: 'Export requests retrieved successfully',
        data: requests,
    });
});

/**
 * GET /api/logs/export-requests/:id
 * Get a specific export request + process if PENDING
 */
const getExportRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let exportRequest = await logService.getExportRequestById(id);

    if (!exportRequest) {
        throw new ApiError(404, 'Export request not found');
    }

    // Auto-process PENDING requests
    if (exportRequest.status === 'PENDING') {
        try {
            await logService.updateExportRequest(id, { status: 'PROCESSING' });

            const filters = exportRequest.filters || {};
            const logs = await logService.getLogsForExport(filters);

            let fileContent;
            let fileName;
            const date = new Date().toISOString().split('T')[0];

            if (exportRequest.format === 'json') {
                fileContent = JSON.stringify(logs, null, 2);
                fileName = `export-request-${id}-${date}.json`;
            } else {
                fileContent = logService.logsToCSV(logs, !!filters.includeNationalId);
                fileName = `export-request-${id}-${date}.csv`;
            }

            // In a production system, this would save to a file storage service.
            // For now, we mark as completed and serve inline.
            await logService.updateExportRequest(id, {
                status: 'COMPLETED',
                completedAt: new Date(),
                fileUrl: fileName,
            });

            exportRequest = await logService.getExportRequestById(id);
        } catch (err) {
            console.error('[ExportRequest] Processing failed:', err);
            await logService.updateExportRequest(id, { status: 'PENDING' });
        }
    }

    res.status(200).json({
        success: true,
        message: 'Export request retrieved',
        data: exportRequest,
    });
});

/**
 * GET /api/logs/export-requests/:id/download
 * Download the exported file for a completed request
 */
const downloadExportRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const exportRequest = await logService.getExportRequestById(id);

    if (!exportRequest) {
        throw new ApiError(404, 'Export request not found');
    }
    if (exportRequest.status !== 'COMPLETED') {
        throw new ApiError(400, 'Export request is not yet completed');
    }

    // Re-generate the file content for download
    const filters = exportRequest.filters || {};
    const logs = await logService.getLogsForExport(filters);

    const date = exportRequest.completedAt
        ? exportRequest.completedAt.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

    if (exportRequest.format === 'json') {
        const fileName = `export-request-${id}-${date}.json`;
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(logs);
    }

    const csvContent = logService.logsToCSV(logs, !!filters.includeNationalId);
    const fileName = `export-request-${id}-${date}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.status(200).send(csvContent);
});

module.exports = {
    getLogs,
    getLogStats,
    verifyIntegrity,
    exportLogs,
    createExportRequest,
    listExportRequests,
    getExportRequest,
    downloadExportRequest,
};
