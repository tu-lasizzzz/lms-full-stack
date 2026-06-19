import 'dotenv/config'; // Crucial for loading MONGODB_URI and CLERK_SECRET_KEY
import mongoose from 'mongoose';
import connectDB from '../configs/mongodb.js';
import { seedUsers } from './users.js';
import { seedCourses } from './courses.js';
import { seedPurchases } from './purchases.js';
import { seedProgress } from './progress.js';

const runSeed = async () => {
    console.log('================================================');
    console.log('Starting Production-Grade LMS Seeding Process');
    console.log('Mode: Idempotent Upsert (Safe for existing data)');
    console.log('================================================');
    
    try {
        await connectDB();
        
        const createdUsers = await seedUsers();
        const createdCourses = await seedCourses(createdUsers);
        const createdPurchases = await seedPurchases(createdUsers, createdCourses);
        await seedProgress(createdPurchases, createdCourses);
        
        console.log('================================================');
        console.log('✓ Database seeded successfully!');
        console.log('================================================');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB Disconnected. Exiting...');
        process.exit(0);
    }
};

runSeed();
