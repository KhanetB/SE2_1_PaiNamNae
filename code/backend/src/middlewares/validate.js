const ApiError = require('../utils/ApiError');
const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
    try {
        const validationSchema = z.object({
            body: schema.body ?? z.any(),
            query: schema.query ?? z.any(),
            params: schema.params ?? z.any(),
            files: schema.files ?? z.any(), // 👈 เพิ่ม
        });

        const parsed = validationSchema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
            files: req.files,
        });

        req.body = parsed.body;
        req.query = parsed.query;
        req.params = parsed.params;
        req.files = parsed.files;

        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const messages = error.errors
                .map((i) => `${i.path.join('.')} - ${i.message}`)
                .join(', ');
            return next(new ApiError(400, `Validation error: ${messages}`));
        }
        next(error);
    }
};

module.exports = validate;
