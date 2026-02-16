const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');

// CRUD operations for reviews
const createReview = async(data) => {

    // Extract review data
    const { 
        bookingId , 
        driverId , 
        passengerId,
        rating,
        comment,
        images = [],
        labels = [],
    } = data;
    
    // Validate Rating
    if (rating < 0 || rating > 5) {
        throw new ApiError(400, 'Rating must be between 0 and 5');
    }

    // Check duplicate review for the same booking
    const existingReview = await prisma.review.findFirst({
        where: {
            bookingId,
            driverId,
            passengerId,
        },
    });
    if (existingReview) {
        throw new ApiError(400, 'Review already exists for this booking');
    }

    // Valiidate booking existence and status
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { route: true },
    });
    if (!booking) {
        throw new ApiError(404, 'Booking not found');
    }

    // Create Review
    const review = await prisma.review.create({
        data: {
        booking: {
            connect: { id: bookingId },
        },
        driver: {
            connect: { id: driverId },
        },
        passenger: {
            connect: { id: passengerId },
        },
        rating,
        comment,
        images,
        labels,
        },
        include: {
        driver: {
            select: { id: true, name: true },
        },
        passenger: {
            select: { id: true, name: true },
        },
        booking: true,
        },
    });
  return review;
};

module.exports = {
    createReview,
}