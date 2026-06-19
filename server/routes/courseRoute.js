import express from 'express'
import { getAllCourse, getCourseId } from '../controllers/courseController.js';


const courseRouter = express.Router()

/**
 * @swagger
 * /api/course/all:
 *   get:
 *     summary: Retrieve a list of all published courses
 *     description: Retrieve all courses that have isPublished set to true. Removes sensitive fields like courseContent and enrolledStudents.
 *     responses:
 *       200:
 *         description: A list of courses
 */
// Get All Course
courseRouter.get('/all', getAllCourse)

/**
 * @swagger
 * /api/course/{id}:
 *   get:
 *     summary: Retrieve a specific course by ID
 *     description: Retrieve detailed information about a single course, including its chapters and lectures. Free lectures contain URLs, paid ones are hidden if user isn't enrolled.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Course details
 *       404:
 *         description: Course not found
 */
// Get Course Data By Id
courseRouter.get('/:id', getCourseId)

export default courseRouter;