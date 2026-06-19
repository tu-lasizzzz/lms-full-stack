import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { requireAuth } from '@clerk/express'; // If you're using Clerk auth middleware

const notificationRouter = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     description: Retrieves all notifications for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
notificationRouter.get('/', requireAuth(), getNotifications);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     description: Marks all unread notifications for the user as read.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
notificationRouter.patch('/read-all', requireAuth(), markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a single notification as read
 *     description: Marks a specific notification as read by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The notification ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
notificationRouter.patch('/:id/read', requireAuth(), markAsRead);

export default notificationRouter;
