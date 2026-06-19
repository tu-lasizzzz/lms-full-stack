import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    imageUrl: { type: String, required: true },
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    ],
    fcmToken: { type: String, default: null },
    password: { type: String }, // For mock seeded users
    role: { type: String, enum: ['student', 'educator', 'admin'], default: 'student' },
    bio: { type: String },
    isSeedData: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User