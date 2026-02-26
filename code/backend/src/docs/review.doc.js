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
 *                     bookingId:
 *                       type: string
 *                     driverId:
 *                       type: string
 *                     passengerId:
 *                       type: string
 *                     rating:
 *                       type: number
 *                     comment:
 *                       type: string
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: string
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Bad request (e.g. route not completed / over 7 days)
 *       403:
 *         description: Forbidden (not owner of booking)
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Booking already reviewed
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
