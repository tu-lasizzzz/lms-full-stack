import { faker } from '@faker-js/faker';
import { CourseProgress } from '../models/CourseProgress.js';

const progressThresholds = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1];

export const seedProgress = async (createdPurchases, createdCourses) => {
    console.log('Seeding Course Progress...');
    
    const createdProgressRecords = [];
    
    // We generate progress records matching the generated purchases
    // This perfectly simulates actual student progression
    for (const purchase of createdPurchases) {
        const course = createdCourses.find(c => c._id.toString() === purchase.courseId.toString());
        if (!course) continue;
        
        // Flatten all lectures to calculate completion correctly
        const allLectures = course.courseContent.reduce((acc, chapter) => {
            return acc.concat(chapter.chapterContent);
        }, []);
        
        if (allLectures.length === 0) continue;
        
        const progressPercentage = faker.helpers.arrayElement(progressThresholds);
        const lecturesToComplete = Math.round(allLectures.length * progressPercentage);
        
        // Students complete lectures sequentially
        const lectureCompletedIds = allLectures.slice(0, lecturesToComplete).map(l => l.lectureId);
        
        const isFullyCompleted = lecturesToComplete === allLectures.length;
        
        const progressData = {
            userId: purchase.userId,
            courseId: purchase.courseId,
            completed: isFullyCompleted,
            lectureCompleted: lectureCompletedIds,
            lastVisited: faker.date.recent({ days: 30 }),
            isSeedData: true
        };
        
        const progressRecord = await CourseProgress.findOneAndUpdate(
            { userId: purchase.userId, courseId: purchase.courseId },
            { $set: progressData },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        createdProgressRecords.push(progressRecord);
    }
    
    console.log(`✓ Progress records inserted/upserted: ${createdProgressRecords.length}`);
    return createdProgressRecords;
};
