import { clerkClient } from '@clerk/express';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import User from './models/User.js';
import Course from './models/Course.js';
import jwt from 'jsonwebtoken';

const testEnrolledCourses = async () => {
    try {
        await connectDB();
        
        // Find a user who is a student and has enrolledCourses
        const user = await User.findOne({ role: 'student', enrolledCourses: { $exists: true, $not: {$size: 0} } });
        if (!user) {
            console.log("No student found with enrolled courses.");
            return;
        }

        console.log("Found User:", user.email, "Enrolled Courses:", user.enrolledCourses.length);

        // We can't easily mock Clerk's getToken(), but we can just use Mongoose to mimic what userEnrolledCourses does.
        const populatedUser = await User.findById(user._id).populate('enrolledCourses');
        
        const firstCourse = populatedUser.enrolledCourses[0];
        console.log("First Enrolled Course:", firstCourse.courseTitle);
        
        const firstChapter = firstCourse.courseContent[0];
        const firstLecture = firstChapter.chapterContent[0];
        
        console.log("First Lecture Title:", firstLecture.lectureTitle);
        console.log("First Lecture URL:", firstLecture.lectureUrl);
        
    } catch (e) {
        console.error(e);
    }
    process.exit();
}

testEnrolledCourses();
