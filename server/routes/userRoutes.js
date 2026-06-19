import express from 'express'
import { addUserRating, getUserCourseProgress, getUserData, purchaseCourse, updateUserCourseProgress, userEnrolledCourses, updateFcmToken, sendTestNotification } from '../controllers/userController.js';


const userRouter = express.Router()

/**
 * @swagger
 * /api/user/data:
 *   get:
 *     summary: Get user Data
 *     description: Retrieves data for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 */
userRouter.get('/data', getUserData)

/**
 * @swagger
 * /api/user/purchase:
 *   post:
 *     summary: Purchase Course
 *     description: Initiates a course purchase for the user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Purchase initiated successfully
 */
userRouter.post('/purchase', purchaseCourse)

/**
 * @swagger
 * /api/user/enrolled-courses:
 *   get:
 *     summary: Get user enrolled courses
 *     description: Retrieves all courses the user is enrolled in.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enrolled courses retrieved successfully
 */
userRouter.get('/enrolled-courses', userEnrolledCourses)

/**
 * @swagger
 * /api/user/update-course-progress:
 *   post:
 *     summary: Update Course Progress
 *     description: Marks a lecture as completed for a specific course.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress updated successfully
 */
userRouter.post('/update-course-progress', updateUserCourseProgress)

/**
 * @swagger
 * /api/user/get-course-progress:
 *   post:
 *     summary: Get Course Progress
 *     description: Retrieves the user's progress for a specific course.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress retrieved successfully
 */
userRouter.post('/get-course-progress', getUserCourseProgress)

/**
 * @swagger
 * /api/user/add-rating:
 *   post:
 *     summary: Add Course Rating
 *     description: Adds or updates a rating for a specific course.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rating added successfully
 */
userRouter.post('/add-rating', addUserRating)

/**
 * @swagger
 * /api/user/update-fcm-token:
 *   post:
 *     summary: Update FCM Token
 *     description: Updates the Firebase Cloud Messaging token for push notifications.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: FCM Token Updated
 */
userRouter.post('/update-fcm-token', updateFcmToken)

/**
 * @swagger
 * /api/user/send-test-notification:
 *   post:
 *     summary: Send Test Notification
 *     description: Sends a test push notification to the user's registered FCM token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification sent successfully
 */
userRouter.post('/send-test-notification', sendTestNotification)

export default userRouter;