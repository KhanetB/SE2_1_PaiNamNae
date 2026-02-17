const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// get all reviews for user 
const getReviewsForUser = async (userId) => {
    const reviews = await prisma.review.findMany({
        where: {
            OR: [
                { driverId: userId },
                { passengerId: userId },
            ],
        }
    });
    return reviews;
}

const createReview = async ({
    bookingId,
    rating,
    comment,
    labels,
    files = [],
    userId,
}) => {
    // 1. ตรวจสอบ booking
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            route: true,
        },
    });

    if (!booking) {
        throw new ApiError(404, 'Booking not found');
    }

    // 2. ตรวจสอบเจ้าของ booking
    if (booking.passengerId !== userId) {
        console.log('User ID:', userId);
        console.log('Booking Passenger ID:', booking.passengerId);
        throw new ApiError(403, 'You are not allowed to review this booking');
    }

    // 3. route ต้อง COMPLETED
    if (booking.route.status !== 'COMPLETED') {
        throw new ApiError(400, 'You can review only completed routes');
    }

    // 4. booking นี้ต้องยังไม่เคย review
    const existingReview = await prisma.review.findUnique({
        where: { bookingId },
    });

    if (existingReview) {
        throw new ApiError(409, 'This booking has already been reviewed');
    }
    // ตรวจสอบว่าเกิน 7 วันหรือยัง
    const completedAt = booking.route.completedAt;
    if (!completedAt) {
        throw new ApiError(400, 'Route completion time not found');
    }
    const diffInDays = Math.floor(
        (Date.now() - completedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffInDays > 7) {
        throw new ApiError(400, 'You can create review only within 7 days');
    }

    const uploadedImages = [];

    try {
        // 5. upload images
        for (const file of files) {
            const uploaded = await uploadToCloudinary(file.buffer, 'reviews');
            uploadedImages.push(uploaded);
        }
        console.log(labels);
        // 6. create review (enum array ใส่ตรงๆ)
        if (typeof labels === 'string') {
                labels = labels.split(',');
              
            }
        const review = await prisma.review.create({
            data: {
                bookingId,
                driverId: booking.route.driverId,
                passengerId: booking.passengerId,
                rating,
                comment,
                labels, 
                images: uploadedImages.map(img => img.url),
            },
        });

        return review;
    } catch (error) {
        // rollback images
        await Promise.all(
            uploadedImages.map(img =>
                deleteFromCloudinary(img.public_id)
            )
        );
        throw error;
    }
};

//DELETE review by id (ownner review)
const deleteReview = async (reviewId, userId) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });
    // ตรวจสอบว่า review นี้มีอยู่จริง
    if (!review) {
        throw new ApiError(404, 'Review not found');
    }
    // ตรวจสอบว่า user นี้เป็นเจ้าของ review
    if (review.passengerId !== userId) {
        throw new ApiError(403, 'You are not allowed to delete this review');
    }
    // ตรวจสอบว่าครบ 7 วันหรือยัง
    const booking = await prisma.booking.findUnique({
        where: { id: review.bookingId },
        include: { route: true },
    });
    const completedAt = booking.route.completedAt;
    if (!completedAt) {
        throw new ApiError(400, 'Route completion time not found');
    }
    const diffInDays = Math.floor(
        (Date.now() - completedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffInDays > 7) {
        throw new ApiError(400, 'You can delete review only within 7 days');
    }
    // ลบ review
    await prisma.review.delete({
        where: { id: reviewId },
    });
}

const editReview = async (
    reviewId,
    userId,
    { rating, comment, labels },
    images // req.files
) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!review) throw new ApiError(404, 'Review not found');
    if (review.passengerId !== userId)
        throw new ApiError(403, 'You are not allowed to edit this review');

    const booking = await prisma.booking.findUnique({
        where: { id: review.bookingId },
        include: { route: true },
    });

    if (booking.route.status !== 'COMPLETED') {
        throw new ApiError(400, 'You can edit review only for completed routes');
    }

    const completedAt = booking.route.completedAt;
    if (!completedAt) {
        throw new ApiError(400, 'Route completion time not found');
    }

    const diffInDays = Math.floor(
        (Date.now() - completedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays > 7) {
        throw new ApiError(400, 'You can edit review only within 7 days');
    }

    // 🔹 เตรียม data update
    const data = {};
    if (rating !== undefined) data.rating = rating;
    if (comment !== undefined) data.comment = comment;
    if (labels !== undefined) data.labels = labels;

    // 🔹 ถ้ามีรูปใหม่ → PUT ทับ images ทั้ง array
    if (images && images.length > 0) {
        let uploadedImages = [];

        try {
            for (const file of images) {
                const uploaded = await uploadToCloudinary(
                    file.buffer,
                    'reviews'
                );
                uploadedImages.push(uploaded.url);
            }
        } catch (err) {
            // rollback cloudinary (ถ้าจำเป็น)
            throw err;
        }

        data.images = uploadedImages;
    }

    return prisma.review.update({
        where: { id: reviewId },
        data,
    });
};



module.exports = {
    createReview,
    getReviewsForUser,
    deleteReview,
    editReview,
};