import { faker } from '@faker-js/faker';
import Course from '../models/Course.js';

const courseTitles = [
    "Java Programming Mastery", "Data Structures & Algorithms in Java", "Full Stack Web Development Bootcamp",
    "Python for Beginners to Advanced", "React.js Frontend Development", "Node.js & Express Backend Development",
    "MongoDB and NoSQL Databases", "SQL and Database Management Systems", "Competitive Programming Essentials",
    "Machine Learning with Python", "Introduction to Artificial Intelligence", "Flutter Mobile App Development",
    "Git and GitHub for Developers", "System Design Fundamentals", "Cybersecurity and Ethical Hacking Basics",
    "Cloud Computing with AWS", "DevOps and CI/CD Pipeline Engineering", "C++ Programming and Object-Oriented Design",
    "API Development and Microservices Architecture", "Building AI-Powered Applications"
];

const categories = ["Programming", "DSA", "Web Development", "Frontend", "Backend", "Database", "AI/ML", "Cloud", "Security", "DevOps", "System Design", "Mobile Development"];
const levels = ["Beginner", "Intermediate", "Advanced", "Beginner to Advanced"];
const reviewTexts = ["Excellent course.", "Very beginner friendly.", "Loved the projects.", "Great explanations.", "Highly recommended.", "Worth every rupee."];

const mp4Urls = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
];

const getLectureTitles = (courseTitle) => {
    const title = courseTitle.toLowerCase();
    if (title.includes("java") && !title.includes("javascript")) {
        return ["Introduction to Java", "OOP in Java", "Collections Framework", "Multithreading", "Mini Project", "Exception Handling", "File I/O", "JDBC Database Connectivity", "Spring Boot Basics", "Final Java Project"];
    } else if (title.includes("python")) {
        return ["Variables and Data Types", "Functions", "OOP", "APIs", "Automation Project", "Data Structures", "File Handling", "Flask Basics", "Django Basics", "Final Python Project"];
    } else if (title.includes("react")) {
        return ["Components", "Props", "State", "Hooks", "Context API", "Routing", "Redux", "API Integration", "Performance Optimization", "Final React Project"];
    } else {
        return ["Introduction", "Environment Setup", "Core Concepts", "Hands-on Project", "Assignments", "Deployment", "Advanced Topics", "Capstone Project", "Bonus Lecture", "Next Steps"];
    }
};

export const seedCourses = async (createdUsers) => {
    console.log('Seeding Courses...');
    
    const educators = createdUsers.filter(u => u.role === 'educator');
    const students = createdUsers.filter(u => u.role === 'student');
    const createdCourses = [];
    let totalRatingsAssigned = 0;

    for (let i = 0; i < courseTitles.length; i++) {
        const educator = educators[faker.number.int({ min: 0, max: educators.length - 1 })];
        
        // Generate Chapters & Lectures
        const chapters = [];
        const numLectures = faker.number.int({ min: 8, max: 10 });
        const chapterLectures = [];
        
        const tailoredTitles = getLectureTitles(courseTitles[i]);
        
        for (let j = 0; j < numLectures; j++) {
            chapterLectures.push({
                lectureId: faker.string.uuid(),
                lectureTitle: tailoredTitles[j % tailoredTitles.length],
                lectureDuration: faker.number.int({ min: 10, max: 60 }), // minutes
                lectureUrl: faker.helpers.arrayElement(mp4Urls),
                isPreviewFree: j === 0, // First lecture is free
                lectureOrder: j + 1
            });
        }
        
        chapters.push({
            chapterId: faker.string.uuid(),
            chapterOrder: 1,
            chapterTitle: "Main Content",
            chapterContent: chapterLectures
        });

        // Generate Ratings (Target 200 total across 20 courses = ~10 per course)
        const courseRatings = [];
        const numRatings = faker.number.int({ min: 5, max: 15 });
        
        // Pick random students for ratings
        const ratingStudents = faker.helpers.arrayElements(students, numRatings);
        for (const student of ratingStudents) {
            if (totalRatingsAssigned >= 200) break;
            courseRatings.push({
                userId: student._id,
                rating: faker.number.int({ min: 4, max: 5 }),
                review: faker.helpers.arrayElement(reviewTexts)
            });
            totalRatingsAssigned++;
        }

        const courseData = {
            courseTitle: courseTitles[i],
            courseDescription: faker.lorem.paragraphs(2),
            courseThumbnail: `https://picsum.photos/seed/${i+1}/800/450`,
            coursePrice: faker.number.int({ min: 999, max: 2999 }),
            discount: faker.number.int({ min: 0, max: 30 }),
            isPublished: true,
            category: faker.helpers.arrayElement(categories),
            level: faker.helpers.arrayElement(levels),
            courseContent: chapters,
            educator: educator._id,
            courseRatings: courseRatings,
            enrolledStudents: [], // Will be populated in purchases seeder
            isSeedData: true
        };

        // Idempotent upsert by courseTitle
        const updatedCourse = await Course.findOneAndUpdate(
            { courseTitle: courseData.courseTitle },
            { $set: courseData },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        createdCourses.push(updatedCourse);
    }

    console.log(`✓ Courses inserted/upserted: ${createdCourses.length}`);
    console.log(`✓ Course Ratings assigned: ${totalRatingsAssigned}`);
    return createdCourses;
};
