const asyncHandler = require("express-async-handler");
const userService = require("../services/user.service");
<<<<<<< HEAD
const ApiError = require("../utils/ApiError");
const { uploadToCloudinary } = require("../utils/cloudinary");
const reviewService = require("../services/review.service");
=======
const ApiError = require('../utils/ApiError');
const { uploadToCloudinary } = require('../utils/cloudinary');
const reviewService = require('../services/review.service');
const { success } = require('zod/v4-mini');
>>>>>>> origin/Thanathat_2110-test_review

// GET /reviews/user
const getReviewsForUser = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const reviews = await reviewService.getReviewsForUser(userId);
  res.json(reviews);
<<<<<<< HEAD
});

// GET /reviews/:reviewId
const getReviewById = asyncHandler(async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;
    const userId = req.user.sub;
    const review = await reviewService.getReviewById(reviewId, userId);
    res.json(review);
  } catch (error) {
    next(
      new ApiError(
        error.statusCode || 500,
        error.message || "An error occurred while fetching the review",
      ),
    );
  }
});

//GET /reviews/booking/:bookingId
const getReviewByBookingId = asyncHandler(async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId;
    const userId = req.user.sub;
    const review = await reviewService.getReviewByBookingId(bookingId, userId);
    res.json(review);
  } catch (error) {
    next(
      new ApiError(
        error.statusCode || 500,
        error.message || "An error occurred while fetching the review",
      ),
    );
  }
=======
>>>>>>> origin/Thanathat_2110-test_review
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
<<<<<<< HEAD
    next(
      new ApiError(
        error.statusCode || 500,
        error.message || "An error occurred while creating the review",
      ),
    );
=======
    next(new ApiError(error.statusCode || 500, error.message || 'An error occurred while creating the review'))
>>>>>>> origin/Thanathat_2110-test_review
  }
};

// DELETE /reviews/:reviewId
const deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;
    await reviewService.deleteReview(reviewId, req.user.sub);
    res.json({
      success: true,
<<<<<<< HEAD
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(
      new ApiError(
        error.statusCode || 500,
        error.message || "An error occurred while deleting the review",
      ),
    );
=======
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(new ApiError(error.statusCode || 500, error.message || 'An error occurred while deleting the review'))
>>>>>>> origin/Thanathat_2110-test_review
  }
};
// PUT /reviews/:reviewId
const editReview = async (req, res) => {
<<<<<<< HEAD
  try {
    const reviewId = req.params.reviewId;
=======
  const reviewId = req.params.reviewId;
>>>>>>> origin/Thanathat_2110-test_review

  try {
    const updatedReview = await reviewService.editReview(
      reviewId,
      req.user.sub,
      {
        rating: req.body.rating,
        comment: req.body.comment,
        labels: req.body.labels,
      },
<<<<<<< HEAD
      req.files, // 👈 สำคัญมาก
=======
      req.files // 👈 สำคัญมาก
>>>>>>> origin/Thanathat_2110-test_review
    );

    res.json({
      success: true,
      data: updatedReview,
    });
<<<<<<< HEAD
  } catch (err) {
    res.status(err.statusCode).json({
      success: false,
    });
=======
  } catch (error) {
    res.status(error.statusCode).json({
      success: false,
    })
>>>>>>> origin/Thanathat_2110-test_review
  }
};

module.exports = {
  getReviewsForUser,
  createReview,
  deleteReview,
<<<<<<< HEAD
  editReview,
  getReviewById,
  getReviewByBookingId,
};
=======
  editReview
}
>>>>>>> origin/Thanathat_2110-test_review
