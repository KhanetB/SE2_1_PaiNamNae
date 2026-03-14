/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: Get all audit logs with filtering and pagination
 *     description: Retrieve audit logs with optional filters for date range, user, IP address, action, and access result. Supports pagination.
 *     tags:
 *       - Audit Logs
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs from this date (ISO 8601 format)
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs until this date (ISO 8601 format). Time set to 23:59:59.999
 *         example: "2024-12-31"
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter logs by user ID (case-insensitive partial match)
 *         example: "user123"
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Filter logs by username (case-insensitive partial match)
 *         example: "john_doe"
 *       - in: query
 *         name: ipAddress
 *         schema:
 *           type: string
 *         description: Filter logs by IP address
 *         example: "192.168.1.1"
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter logs by action (comma-separated values for multiple actions)
 *         example: "LOGIN,LOGOUT,CREATE_USER"
 *       - in: query
 *         name: accessResult
 *         schema:
 *           type: string
 *           enum: [SUCCESS, FAILURE]
 *         description: Filter logs by access result status
 *         example: "SUCCESS"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: pageLimit
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Number of records per page
 *         example: 25
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logs retrived successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique log ID
 *                       userId:
 *                         type: string
 *                         nullable: true
 *                         description: User ID associated with the log
 *                       action:
 *                         type: string
 *                         description: Action performed (e.g., LOGIN, CREATE_USER)
 *                       actionTimeStamp:
 *                         type: string
 *                         format: date-time
 *                         description: When the action occurred
 *                       ipAddress:
 *                         type: string
 *                         description: IP address of the request
 *                       userAgent:
 *                         type: string
 *                         description: User agent string from the request
 *                       deviceInfo:
 *                         type: string
 *                         nullable: true
 *                         description: Device information if available
 *                       httpMethod:
 *                         type: string
 *                         description: HTTP method (GET, POST, PUT, DELETE)
 *                       endpoint:
 *                         type: string
 *                         description: API endpoint that was called
 *                       resourceType:
 *                         type: string
 *                         description: Type of resource affected
 *                       accessResult:
 *                         type: string
 *                         enum: [SUCCESS, FAILURE]
 *                         description: Whether access was successful
 *                       httpStatusCode:
 *                         type: string
 *                         description: HTTP status code returned
 *                       metaData:
 *                         type: object
 *                         nullable: true
 *                         description: Additional metadata about the action
 *                       errorMessage:
 *                         type: string
 *                         nullable: true
 *                         description: Error message if the access failed
 *                       integrityHash:
 *                         type: string
 *                         description: SHA-256 hash for integrity verification
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: When the log record was created
 *                       user:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                             description: Username associated with the log
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageLimit:
 *                       type: integer
 *                       example: 25
 *                     total:
 *                       type: integer
 *                       description: Total number of matching records
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
 *
 * /api/logs/verify:
 *   get:
 *     summary: Verify audit log chain integrity
 *     description: Verify the integrity of audit logs by checking the SHA-256 hash chain. Returns whether all checked records are intact.
 *     tags:
 *       - Audit Logs
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 500
 *         description: Maximum number of recent records to check for integrity
 *         example: 500
 *     responses:
 *       200:
 *         description: Integrity verification completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Records integrity verified — all checked records intact"
 *                   description: Message indicating passed or broken integrity
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                       description: Whether all checked records are valid
 *                     totalChecked:
 *                       type: integer
 *                       description: Number of records checked
 *                     corruptAt:
 *                       type: string
 *                       nullable: true
 *                       description: ID of the record where corruption was detected (if any)
 *                     reason:
 *                       type: string
 *                       nullable: true
 *                       description: Reason for integrity check failure (e.g., "integrityHash mismatch")
 *       400:
 *         description: Invalid limit parameter
 *       500:
 *         description: Server error
 *
 * /api/logs/export:
 *   get:
 *     summary: Export audit logs in CSV or JSON format
 *     description: Export filtered audit logs in the specified format. Supports selective export of user fields.
 *     tags:
 *       - Audit Logs
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs from this date
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs until this date
 *         example: "2024-12-31"
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter logs by user ID (case-insensitive)
 *         example: "user123"
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Filter logs by username (case-insensitive)
 *         example: "john_doe"
 *       - in: query
 *         name: ipAddress
 *         schema:
 *           type: string
 *         description: Filter logs by IP address
 *         example: "192.168.1.1"
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Comma-separated action types to filter
 *         example: "LOGIN,CREATE_USER"
 *       - in: query
 *         name: accessResult
 *         schema:
 *           type: string
 *           enum: [SUCCESS, FAILURE]
 *         description: Filter by access result status
 *         example: "SUCCESS"
 *       - in: query
 *         name: userFields
 *         schema:
 *           type: string
 *         description: Comma-separated user fields to include in export (e.g., username, email, phoneNumber)
 *         example: "username,email"
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: csv
 *         description: Export format
 *         example: "csv"
 *     responses:
 *       200:
 *         description: Logs exported successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               description: CSV file with audit logs
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Array of log records with selected fields
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *             description: File attachment with generated filename (e.g., audit-log-export-2024-01-15.csv)
 *       400:
 *         description: Invalid format or query parameters
 *       500:
 *         description: Server error
 *
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the audit log
 *         userId:
 *           type: string
 *           nullable: true
 *           description: User ID who performed the action
 *         action:
 *           type: string
 *           description: Type of action performed
 *         actionTimeStamp:
 *           type: string
 *           format: date-time
 *           description: When the action was performed
 *         ipAddress:
 *           type: string
 *           description: IP address of the request
 *         userAgent:
 *           type: string
 *           description: User agent string
 *         deviceInfo:
 *           type: string
 *           nullable: true
 *           description: Device information
 *         httpMethod:
 *           type: string
 *           description: HTTP method used
 *         endpoint:
 *           type: string
 *           description: API endpoint called
 *         resourceType:
 *           type: string
 *           description: Type of resource being logged
 *         accessResult:
 *           type: string
 *           enum: [SUCCESS, FAILURE]
 *           description: Result of the action
 *         httpStatusCode:
 *           type: string
 *           description: HTTP status code
 *         metaData:
 *           type: object
 *           nullable: true
 *           description: Additional metadata
 *         errorMessage:
 *           type: string
 *           nullable: true
 *           description: Error message if failed
 *         integrityHash:
 *           type: string
 *           description: SHA-256 hash for integrity verification
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the log was created
 */
