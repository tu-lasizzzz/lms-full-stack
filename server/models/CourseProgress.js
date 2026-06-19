import mongoose from 'mongoose';

const courseProgressSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    completed: { type: Boolean, default: false },
    lectureCompleted: {
        type: [String],
        default: []
    },
    lastVisited: { type: Date },
    isSeedData: { type: Boolean, default: false }
}, { timestamps: true });

export const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema);
