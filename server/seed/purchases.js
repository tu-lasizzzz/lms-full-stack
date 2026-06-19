import { faker } from '@faker-js/faker';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { Notification } from '../models/Notification.js';

export const seedPurchases = async (createdUsers, createdCourses) => {
    console.log('Seeding Purchases...');
    
    const students = createdUsers.filter(u => u.role === 'student');
    const createdPurchases = [];
    const usedPairs = new Set();
    
    // We attempt to create 150 unique purchases
    for (let i = 0; i < 150; i++) {
        let student, course, pairKey;
        
        // Find a unique student-course pair
        let attempts = 0;
        do {
            student = faker.helpers.arrayElement(students);
            course = faker.helpers.arrayElement(createdCourses);
            pairKey = `${student._id}_${course._id}`;
            attempts++;
            if (attempts > 500) break; // Safegaurd against infinite loops
        } while (usedPairs.has(pairKey));
        
        if (attempts > 500) continue;
        usedPairs.add(pairKey);
        
        // Calculate discounted amount
        const amount = course.coursePrice - (course.coursePrice * course.discount / 100);
        
        const purchaseData = {
            courseId: course._id,
            userId: student._id,
            amount: amount,
            status: 'completed',
            isSeedData: true
        };
        
        // Idempotent upsert
        const purchase = await Purchase.findOneAndUpdate(
            { courseId: course._id, userId: student._id },
            { $set: purchaseData },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        createdPurchases.push(purchase);
        
        // Update bi-directional relationships
        await Course.findByIdAndUpdate(course._id, { $addToSet: { enrolledStudents: student._id } });
        await User.findByIdAndUpdate(student._id, { $addToSet: { enrolledCourses: course._id } });
        
        // Seed Enrollment Notification
        const educator = createdUsers.find(u => u._id.toString() === course.educator.toString());
        await Notification.findOneAndUpdate(
            { userId: student._id, courseId: course._id, type: 'enrollment' },
            {
                $set: {
                    userId: student._id,
                    title: "Enrollment Successful 🎓",
                    message: `Congratulations, ${student.name}! You have successfully enrolled in '${course.courseTitle}' by ${educator ? educator.name : 'Unknown'}. Start learning, track your progress, and complete the course to earn your certificate.`,
                    type: "enrollment",
                    isSeedData: true
                }
            },
            { upsert: true, setDefaultsOnInsert: true }
        );
    }
    
    console.log(`✓ Purchases inserted/upserted: ${createdPurchases.length}`);
    return createdPurchases;
};
