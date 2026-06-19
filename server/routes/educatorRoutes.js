import express from 'express'
import { addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateRoleToEducator } from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
import { protectEducator } from '../middlewares/authMiddleware.js';


const educatorRouter = express.Router()

/**
 * @swagger
 * /api/educator/update-role:
 *   get:
 *     summary: Add Educator Role
 *     description: Assigns the educator role to the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role updated successfully
 */
educatorRouter.get('/update-role', updateRoleToEducator)

/**
 * @swagger
 * /api/educator/add-course:
 *   post:
 *     summary: Add a new course
 *     description: Creates a new course. Requires educator role.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Course added successfully
 */
educatorRouter.post('/add-course', upload.single('image'), protectEducator, addCourse)

/**
 * @swagger
 * /api/educator/courses:
 *   get:
 *     summary: Get Educator Courses
 *     description: Retrieves all courses created by the authenticated educator.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of educator courses
 */
educatorRouter.get('/courses', protectEducator, getEducatorCourses)

/**
 * @swagger
 * /api/educator/dashboard:
 *   get:
 *     summary: Get Educator Dashboard Data
 *     description: Retrieves dashboard statistics and earnings for the educator.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved
 */
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData)

/**
 * @swagger
 * /api/educator/enrolled-students:
 *   get:
 *     summary: Get Educator Students Data
 *     description: Retrieves the list of students enrolled in the educator's courses.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enrolled students retrieved
 */
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData)

export default educatorRouter;