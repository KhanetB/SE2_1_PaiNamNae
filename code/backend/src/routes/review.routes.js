const express = require('express');
const reviewController = require('../controllers/review.controller');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const { createReviewSchema, editReviewSchema} = require('../validations/review.validation');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

// GET /api/reviews/me/:userId
router.get(
    '/me',
    protect,
    reviewController.getReviewsForUser
);

// GET /api/reviews/:reviewId
router.get(
    '/:reviewId',
    protect,
    reviewController.getReviewById
);

// POST /api/reviews
router.post(
    '/',
    protect,
    upload.array('files', 3),    
    validate(createReviewSchema),
    reviewController.createReview
);
// DELETE /api/reviews/:reviewId
router.delete(
    '/:reviewId',
    protect,
    reviewController.deleteReview
);

// PUT /api/reviews/:reviewId
router.put(
    '/:reviewId',
    protect,
    upload.array('files', 3),
    validate(editReviewSchema),
    reviewController.editReview
);
module.exports = router;