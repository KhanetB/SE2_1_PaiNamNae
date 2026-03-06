const { z } = require("zod");

const reviewLabelEnum = z.enum([
  "SAFE_DRIVING",
  "CLEAN_CAR",
  "FRIENDLY_DRIVER",
  "GOOD_MUSIC",
]);

const createReviewSchema = {
  body: z.object({
    bookingId: z.string().cuid(),
    rating: z.coerce.number().min(0).max(5),
    comment: z.string().trim().max(1000).optional(),
    labels: z.string().optional(),
    now: z.string().optional(), // for testing purposes
  }),

  files: z
    .array(
      z.object({
        mimetype: z.string().regex(/^(image|video)\//),
        buffer: z.instanceof(Buffer),
      })
    )
    .max(3, "You can upload up to 3 files")
    .optional(),
    
};

const editReviewSchema = {
  body: z
    .object({
      rating: z.coerce.number().min(1).max(5).optional(),
      comment: z.string().trim().max(1000).optional(),
      labels: z.string().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
};

module.exports = {
  createReviewSchema,
  editReviewSchema,
};
