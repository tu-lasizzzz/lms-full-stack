import { clerkClient } from '@clerk/express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { Notification } from '../models/Notification.js';

const indianNames = [
    "Aarav Sharma", "Vivaan Patel", "Aditya Verma", "Arjun Singh", "Krishna Gupta",
    "Rohan Mishra", "Ananya Das", "Priya Nair", "Sneha Reddy", "Kavya Iyer",
    "Rahul Kumar", "Neha Agarwal", "Siddharth Jain", "Aditi Mehta", "Vikram Rao",
    "Pooja Choudhary", "Harsh Vardhan", "Meera Kulkarni", "Akash Yadav", "Nisha Kapoor",
    "Aryan Joshi", "Shreya Banerjee", "Karan Malhotra", "Divya Menon", "Manish Tiwari",
    "Ishita Ghosh", "Abhishek Pandey", "Ritika Sinha", "Nikhil Bansal", "Tanvi Deshmukh",
    "Saurabh Saxena", "Palak Arora", "Yash Thakur", "Anjali Roy", "Mohit Bhardwaj",
    "Riya Chakraborty", "Pranav Kulshrestha", "Simran Kaur", "Deepak Tripathi", "Swati Patil",
    "Tanishq Srivastava", "Komal Sharma", "Varun Khanna", "Payal Dubey", "Aman Raj",
    "Shruti Mahapatra", "Naveen Pillai", "Sanjana Behera", "Rakesh Mohanty", "Soumya Nayak"
];

const getAvatarUrl = (index) => `https://i.pravatar.cc/150?img=${(index % 70) + 1}`;
const generateEmail = (name) => name.toLowerCase().replace(' ', '.') + '@lmsdemo.com';

const BASE_EMAIL = process.env.DEV_EMAIL || "tulasisahu@gmail.com";
const generateAlias = (roleId) => {
    const parts = BASE_EMAIL.split('@');
    return `${parts[0]}+${roleId}@${parts[1]}`;
};

export const seedUsers = async () => {
    console.log('Seeding Users...');
    
    const usersToCreate = [];
    
    // 1 Admin
    usersToCreate.push({
        name: 'Admin User',
        email: generateAlias('admin'),
        role: 'admin',
        bio: 'Platform Administrator',
        avatarIndex: 71,
        isClerk: true
    });
    
    // 5 Instructors
    for (let i = 1; i <= 5; i++) {
        usersToCreate.push({
            name: `Instructor ${i}`,
            email: generateAlias(`instructor${i}`),
            role: 'educator',
            bio: `Expert Instructor ${i} with years of experience in software development.`,
            avatarIndex: 71 + i,
            isClerk: true
        });
    }
    
    // 45 Students (10 Clerk, 35 Mock)
    indianNames.slice(0, 45).forEach((name, idx) => {
        const isClerk = idx < 10;
        let email;
        
        if (isClerk) {
            email = generateAlias(`student${idx + 1}`);
        } else {
            email = generateEmail(name);
        }
        
        usersToCreate.push({
            name,
            email,
            role: 'student',
            bio: `Hi, I am ${name}, an eager learner exploring new technologies.`,
            avatarIndex: idx + 1,
            isClerk
        });
    });

    const hashedPassword = await bcrypt.hash('LmsDemo@2026!', 10);
    const createdUsers = [];

    for (const userData of usersToCreate) {
        let userId;
        
        if (userData.isClerk) {
            try {
                const existingUsers = await clerkClient.users.getUserList({ emailAddress: [userData.email] });
                
                if (existingUsers.totalCount > 0) {
                    userId = existingUsers.data[0].id;
                    console.log(`Clerk user already exists: ${userData.email}`);
                } else {
                    const names = userData.name.split(' ');
                    const firstName = names[0];
                    const lastName = names.slice(1).join(' ') || undefined;
                    
                    const newClerkUser = await clerkClient.users.createUser({
                        emailAddress: [userData.email],
                        username: userData.email.split('@')[0].replace(/\+/g, '_').replace(/\./g, '_'),
                        password: 'LmsDemo@2026!',
                        firstName,
                        lastName,
                        publicMetadata: { role: userData.role }
                    });
                    userId = newClerkUser.id;
                    console.log(`Created Clerk user: ${userData.email}`);
                }
            } catch (error) {
                console.error(`Failed to create/fetch Clerk user ${userData.email}:`, error.errors || error.message);
                continue;
            }
        } else {
            // Mock MongoDB user ID
            userId = `seed_mock_${userData.email.replace('@lmsdemo.com', '').replace('.', '_')}`;
        }

        const mongoUserData = {
            name: userData.name,
            email: userData.email,
            imageUrl: getAvatarUrl(userData.avatarIndex),
            role: userData.role,
            bio: userData.bio,
            password: hashedPassword,
            isSeedData: true
        };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: mongoUserData },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        // Seed Welcome Notification
        await Notification.findOneAndUpdate(
            { userId, type: 'welcome' },
            {
                $set: {
                    userId,
                    title: "Welcome to LMS TAT 🎉",
                    message: `Welcome to LMS TAT, ${userData.name}! We're excited to have you join our learning community. Explore courses, track your progress, and build new skills at your own pace. Happy Learning!`,
                    type: "welcome",
                    isSeedData: true
                }
            },
            { upsert: true, setDefaultsOnInsert: true }
        );

        createdUsers.push(updatedUser);
    }

    console.log(`✓ Users inserted/upserted: ${createdUsers.length}`);
    return createdUsers;
};
