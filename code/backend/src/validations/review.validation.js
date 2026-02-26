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
  }),

  files: z
    .array(
      z.object({
        mimetype: z.enum(["image/jpeg", "image/png", "image/webp"]),
        buffer: z.instanceof(Buffer),
      }),
    )
    .max(3, "You can upload up to 3 images")
    .optional(),
};

const editReviewSchema = {
  body: z
    .object({
      rating: z.coerce.number().min(1).max(5).optional(),
      comment: z.string().trim().max(1000).optional(),
      labels: z.array(reviewLabelEnum).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
};

module.exports = {
  createReviewSchema,
  editReviewSchema,
};
