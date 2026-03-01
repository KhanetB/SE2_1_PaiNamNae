const logService = require('../services/log.service');

/**
 * Map request path + method to a LogEventType.
 */
function mapToEventType(req, statusCode) {
    const path = req.path || req.originalUrl || '';
    const method = (req.method || '').toUpperCase();

    // Auth events
    if (path.includes('/auth/login')) {
        return statusCode < 400 ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED';
    }
    if (path.includes('/auth/logout') || path.includes('/logout')) {
        return 'LOGOUT';
    }
    if (path.includes('/auth/change-password') || path.includes('/change-password')) {
        return 'PASSWORD_CHANGE';
    }

    // Driver verification
    if (path.includes('/driver-verification')) {
        return 'DRIVER_VERIFICATION';
    }

    // Booking actions
    if (path.includes('/booking')) {
        return 'BOOKING_ACTION';
    }

    // Route actions
    if (path.includes('/routes') && !path.includes('/logs')) {
        return 'ROUTE_ACTION';
    }

    // Profile / user updates
    if (path.includes('/users') && (method === 'PUT' || method === 'PATCH')) {
        return 'PROFILE_UPDATE';
    }
    if (path.includes('/users') && method === 'DELETE') {
        return 'ACCOUNT_DEACTIVATED';
    }

    // File operations
    if (path.includes('/upload')) {
        return 'FILE_UPLOAD';
    }
    if (path.includes('/download') || path.includes('/export')) {
        return 'FILE_DOWNLOAD';
    }

    // Admin log operations (don't double-log — these are logged by the controller)
    if (path.includes('/logs')) {
        return null; // Skip — controller handles this
    }

    // Map by HTTP method for generic API access
    switch (method) {
        case 'POST':
            return 'DATA_CREATE';
        case 'GET':
            return 'DATA_READ';
        case 'PUT':
        case 'PATCH':
            return 'DATA_UPDATE';
        case 'DELETE':
            return 'DATA_DELETE';
        default:
            return 'API_ACCESS';
    }
}

/**
 * Extract resource type from the URL path.
 */
function extractResourceType(path) {
    const segments = path.replace(/^\/api\//, '').split('/');
    const resource = segments[0] || '';

    const map = {
        auth: 'AUTH',
        users: 'USER',
        vehicles: 'VEHICLE',
        routes: 'ROUTE',
        bookings: 'BOOKING',
        'driver-verifications': 'DRIVER_VERIFICATION',
        notifications: 'NOTIFICATION',
        reviews: 'REVIEW',
        export: 'EXPORT',
        logs: 'AUDIT_LOG',
    };

    return map[resource] || resource.toUpperCase() || null;
}

/**
 * Extract resource ID from the URL path.
 */
function extractResourceId(path) {
    const segments = path.split('/');
    // Look for CUID-like IDs (starts with 'c' and has at least 20 chars)
    for (const seg of segments) {
        if (seg.length >= 20 && /^c[a-z0-9]+$/i.test(seg)) {
            return seg;
        }
    }
    return null;
}

/**
 * Sanitize request body — remove sensitive fields.
 */
function sanitizeBody(body) {
    if (!body || typeof body !== 'object') return null;

    const sensitiveFields = [
        'password',
        'currentPassword',
        'newPassword',
        'token',
        'accessToken',
        'refreshToken',
        'nationalIdNumber',
        'otpCode',
    ];

    const sanitized = { ...body };
    for (const field of sensitiveFields) {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    }
    return sanitized;
}

/**
 * Express middleware that automatically logs every HTTP request.
 * Runs after the response is sent (res.on('finish')).
 */
const logger = (req, res, next) => {
    next();

    res.on('finish', async () => {
        try {
            const path = req.originalUrl || req.path || '';

            // Skip health check, metrics, docs, and static assets
            if (
                path.includes('/health') ||
                path.includes('/metrics') ||
                path.includes('/documentation') ||
                path.includes('/favicon')
            ) {
                return;
            }

            const eventType = mapToEventType(req, res.statusCode);

            // Skip if null (e.g., log routes — they self-log)
            if (!eventType) return;

            const accessResult =
                res.statusCode < 400
                    ? 'SUCCESS'
                    : res.statusCode === 401 || res.statusCode === 403
                        ? 'DENIED'
                        : 'ERROR';

            await logService.createLog({
                eventType,
                userId: req.user?.sub || null,
                userEmail: null, // Will be populated if needed from user lookup
                userRole: req.user?.role || null,
                ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
                userAgent: req.headers['user-agent'] || null,
                httpMethod: req.method,
                endpoint: path,
                resourceType: extractResourceType(path),
                resourceId: extractResourceId(path),
                accessResult,
                statusCode: res.statusCode,
                errorMessage: res.locals.errorMessage || null,
                details: sanitizeBody(req.body),
                sessionId: req.headers['x-session-id'] || null,
            });
        } catch (err) {
            // Never let logging errors crash the application
            console.error('[AuditLog] Failed to create log entry:', err.message);
        }
    });
};

module.exports = logger;
