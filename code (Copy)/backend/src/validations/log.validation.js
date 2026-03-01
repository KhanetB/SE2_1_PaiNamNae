const { z } = require('zod');

/**
 * Validation schema for log query parameters.
 */
const logQuerySchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    userId: z.string().optional(),
    ipAddress: z.string().optional(),
    eventTypes: z.string().optional(), // comma-separated
    accessResult: z.enum(['SUCCESS', 'DENIED', 'ERROR']).optional(),
    includeNationalId: z.enum(['true', 'false']).optional(),
    page: z.string().regex(/^\d+$/).optional().default('1'),
    pageSize: z.string().regex(/^\d+$/).optional().default('25'),
});

/**
 * Validation schema for export request creation.
 */
const exportRequestSchema = z.object({
    officerName: z.string().min(1, 'Officer name is required'),
    officerOrganization: z.string().min(1, 'Officer organization is required'),
    deadline: z.string().datetime('Invalid deadline date format'),
    filters: z
        .object({
            startDate: z.string().optional(),
            endDate: z.string().optional(),
            userId: z.string().optional(),
            ipAddress: z.string().optional(),
            eventTypes: z.array(z.string()).optional(),
            includeNationalId: z.boolean().optional(),
        })
        .optional(),
    format: z.enum(['csv', 'json']).optional().default('csv'),
});

/**
 * Validation schema for export query parameters.
 */
const exportQuerySchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    userId: z.string().optional(),
    ipAddress: z.string().optional(),
    eventTypes: z.string().optional(),
    accessResult: z.enum(['SUCCESS', 'DENIED', 'ERROR']).optional(),
    includeNationalId: z.enum(['true', 'false']).optional(),
    format: z.enum(['csv', 'json']).optional().default('csv'),
});

module.exports = {
    logQuerySchema,
    exportRequestSchema,
    exportQuerySchema,
};
