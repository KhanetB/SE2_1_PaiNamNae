const asyncHandler = require("express-async-handler");
const userService = require("../services/user.service");
const ApiError = require("../utils/ApiError");
const { uploadToCloudinary } = require("../utils/cloudinary");
const reviewService = require("../services/review.service");

// GET /reviews/user
const getReviewsForUser = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const reviews = await reviewService.getReviewsForUser(userId);
  res.json(reviews);
});

// GET /reviews/:reviewId
const getReviewById = asyncHandler(async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const userId = req.user.sub;
    const review = await reviewService.getReviewById(reviewId, userId);
    res.json(review);
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "An error occurred while fetching the review",
    );
  }
});

// POST /reviews
const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview({
      bookingId: req.body.bookingId,
      rating: req.body.rating,
      comment: req.body.comment,
      files: req.files,
      userId: req.user.sub,
      labels: req.body.labels,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(
      new ApiError(
        error.statusCode || 500,
        error.message || "An error occurred while creating the review",
      ),
    );
  }
};

// DELETE /reviews/:reviewId
const deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;
    await reviewService.deleteReview(reviewId, req.user.sub);
    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "An error occurred while deleting the review",
    );
  }
};
// PUT /reviews/:reviewId
const editReview = async (req, res) => {
  const reviewId = req.params.reviewId;

  const updatedReview = await reviewService.editReview(
    reviewId,
    req.user.sub,
    {
      rating: req.body.rating,
      comment: req.body.comment,
      labels: req.body.labels,
    },
    req.files, // 👈 สำคัญมาก
  );

  res.json({
    success: true,
    data: updatedReview,
  });
};

module.exports = {
  getReviewsForUser,
  createReview,
  deleteReview,
  editReview,
  getReviewById,
};
