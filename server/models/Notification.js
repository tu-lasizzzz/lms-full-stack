import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['welcome', 'enrollment', 'progress', 'certificate'], required: true },
    isRead: { type: Boolean, default: false },
    isSeedData: { type: Boolean, default: false }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
