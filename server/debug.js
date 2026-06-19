import 'dotenv/config';
import mongoose from 'mongoose';
import Course from './models/Course.js';

const runDebug = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log("✅ MongoDB Connected!");
        console.log("Database Name:", mongoose.connection.name);
        console.log("Course Collection Name:", Course.collection.name);
        
        // Count all documents
        const totalCount = await Course.countDocuments();
        console.log(`Total courses in collection without filters: ${totalCount}`);
        
        // Count with isPublished: true
        const publishedCount = await Course.countDocuments({ isPublished: true });
        console.log(`Total courses with isPublished=true: ${publishedCount}`);
        
        if (totalCount > 0) {
            const sampleCourse = await Course.findOne().select('courseTitle isPublished educator');
            console.log("Sample Course from DB:", JSON.stringify(sampleCourse, null, 2));
        }
        
    } catch (err) {
        console.error("❌ Debugging failed:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
};

runDebug();
