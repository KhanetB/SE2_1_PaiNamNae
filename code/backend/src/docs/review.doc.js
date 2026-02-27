/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management for completed bookings
 */

/**
 * @swagger
 * /api/reviews/me:
 *   get:
 *     summary: Get all reviews related to current user
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ดึงรีวิวทั้งหมดที่ผู้ใช้ที่ล็อกอินมีส่วนเกี่ยวข้อง  
 *       - driverId = current user  
 *       - passengerId = current user
 *     responses:
 *       200:
 *         description: List of reviews (empty array if no data)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: cmlphxmxj000172r2z0lli7xf
 *                   bookingId:
 *                     type: string
 *                     example: cmlpala0e0004gzvu6je2mlbb
 *                   driverId:
 *                     type: string
 *                     example: cmlj778ls0001pkoq1imzxuto
 *                   passengerId:
 *                     type: string
 *                     example: cmlj7ebjj000ppkoqf7xwcbbj
 *                   rating:
 *                     type: number
 *                     format: float
 *                     example: 3.5
 *                   comment:
 *                     type: string
 *                     example: ดีมากมั้ง
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *                       example: https://res.cloudinary.com/.../reviews/img.jpg
 *                   labels:
 *                     type: array
 *                     items:
 *                       type: string
 *                       example: SAFE_DRIVING
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 */


/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a review for completed booking (Passenger only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - rating
 *             properties:
 *               bookingId:
 *                 type: string
 *                 example: cmlpala0e0004gzvu6je2mlbb
 *               rating:
 *                 type: number
 *                 format: float
 *                 example: 4.5
 *               comment:
 *                 type: string
 *                 example: บริการดีมาก
 *               labels:
 *                 oneOf:
 *                   - type: string
 *                     example: SAFE_DRIVING,FRIENDLY_DRIVER
 *                   - type: array
 *                     items:
 *                       type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               now:
 *                  type: number
 *                  example: 1700000000000
 *                  description: "For testing purposes only. Do not send in production requests. Default is the server time if not provided."
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: cmm3js7pu0003sn3ptz9bitsa
 *                     bookingId:
 *                       type: string
 *                       example: cmm3i3k2200041rem47p8dzfi
 *                     driverId:
 *                       type: string
 *                       example: cmlrk4dcc0006pa5d1r9q0did
 *                     passengerId:
 *                       type: string
 *                       example: cmlrk38lz0003pa5dzw3w5vpb
 *                     rating:
 *                       type: number
 *                       format: float
 *                       example: 3.5
 *                     comment:
 *                       type: string
 *                       example: ดีมากมั้ง
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             example: https://res.cloudinary.com/.../image.jpg
 *                           type:
 *                             type: string
 *                             enum: [IMAGE, VIDEO]
 *                             example: IMAGE
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-02-26T14:17:29.106Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-02-26T14:17:29.106Z
 *       400:
 *         description: Bad request (file validation or business rule failed)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 data:
 *                   nullable: true
 *             examples:
 *               invalidFileType:
 *                 summary: Invalid file type
 *                 value:
 *                   success: false
 *                   message: Only image or video files are allowed!
 *                   data: null
 *               fileTooLarge:
 *                 summary: File size exceeds limit
 *                 value:
 *                   success: false
 *                   message: File size must not exceed 10 MB
 *                   data: null
 *               tooManyFiles:
 *                 summary: More than 3 files uploaded
 *                 value:
 *                   success: false
 *                   message: Unexpected field
 *                   data: null
 *               CanCreateOnlyWithin7Days:
 *                 summary: Can create review only within 7 days
 *                 value:
 *                   success: false
 *                   message: You can create review only within 7 days
 *                   data: null
 *               BookingNotCompleted:
 *                summary: Booking not completed yet
 *                value:
 *                   success: false
 *                   message: Booking not completed yet
 *                   data: null
 *                     
 *               validationMissingBookingId:
 *                 summary: Missing bookingId
 *                 value:
 *                   success: false
 *                   message: "Validation error: body.bookingId - Required"
 *                   data: null
 *
 *               validationMissingBookingIdAndInvalidRating:
 *                 summary: Missing bookingId and invalid rating
 *                 value:
 *                   success: false
 *                   message: "Validation error: body.bookingId - Required, body.rating - Expected number, received nan"
 *                   data: null
 *
 *               validationInvalidRating:
 *                 summary: Invalid rating (NaN)
 *                 value:
 *                   success: false
 *                   message: "Validation error: body.rating - Expected number, received nan"
 *                   data: null
 * 
 *       403:
 *         description: Forbidden (not owner of booking)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: You are not allowed to review this booking
 *                 data: 
 *                  nullable: true
 *                  example: null
 *                   
 * 
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Booking not found
 *                 data: 
 *                  nullable: true
 *                  example: null
 * 
 *       409:
 *         description: Booking already reviewed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: This booking has already been reviewed
 *                 data: 
 *                  nullable: true
 *                  example: null
 * 
 */

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     summary: Delete review (Owner only, within 7 days)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
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
 *                   example: Review deleted successfully
 *       400:
 *         description: Can delete only within 7 days / route completion time not found
 *       403:
 *         description: Not allowed to delete this review
 *       404:
 *         description: Review not found
 */


/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   put:
 *     summary: Edit review (Owner only, within 7 days)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 format: float
 *                 example: 4.5
 *               comment:
 *                 type: string
 *                 example: แก้ไขรีวิวแล้ว ดีมาก
 *               labels:
 *                 oneOf:
 *                   - type: string
 *                     example: SAFE_DRIVING,FRIENDLY_DRIVER
 *                   - type: array
 *                     items:
 *                       type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Can edit only within 7 days / only completed routes
 *       403:
 *         description: Not allowed to edit this review
 *       404:
 *         description: Review not found
 */
