import { Notification } from '../models/Notification.js';

// Get notifications for the logged-in user
export const getNotifications = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        
        // Also get unread count
        const unreadCount = notifications.filter(n => !n.isRead).length;

        res.json({ success: true, notifications, unreadCount });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Mark a single notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth.userId;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.json({ success: false, message: 'Notification not found' });
        }

        res.json({ success: true, message: 'Marked as read', notification });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Mark all notifications as read for the user
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.auth.userId;

        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
