import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";
import humanizeDuration from "humanize-duration";
import { onMessage } from "firebase/messaging";
import { getFirebaseMessaging, requestForToken } from "../firebase";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const currency = import.meta.env.VITE_CURRENCY

    const navigate = useNavigate()
    const { getToken } = useAuth()
    const { user } = useUser()

    const [showLogin, setShowLogin] = useState(false)
    const [isEducator,setIsEducator] = useState(false)
    const [allCourses, setAllCourses] = useState([])
    const [userData, setUserData] = useState(null)
    const [enrolledCourses, setEnrolledCourses] = useState([])

    // Notifications State
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)

    // Fetch All Courses
    const fetchAllCourses = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/course/all');

            if (data.success) {
                setAllCourses(data.courses)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }

    }

    // Fetch UserData 
    const fetchUserData = async () => {

        try {

            if (user.publicMetadata.role === 'educator') {
                setIsEducator(true)
            }

            const token = await getToken();

            const { data } = await axios.get(backendUrl + '/api/user/data',
                { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setUserData(data.user)
            } else (
                toast.error(data.message)
            )

        } catch (error) {
            toast.error(error.message)
        }

    }

    // Fetch User Enrolled Courses
    const fetchUserEnrolledCourses = async () => {

        const token = await getToken();

        const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses',
            { headers: { Authorization: `Bearer ${token}` } })

        if (data.success) {
            setEnrolledCourses(data.enrolledCourses.reverse())
        } else (
            toast.error(data.message)
        )

    }

    // Fetch User Notifications
    const fetchNotifications = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get(backendUrl + '/api/notifications',
                { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount)
            }
        } catch (error) {
            console.error(error.message)
        }
    }

    // Function to Calculate Course Chapter Time
    const calculateChapterTime = (chapter) => {

        let time = 0

        chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)

        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })

    }

    // Function to Calculate Course Duration
    const calculateCourseDuration = (course) => {

        let time = 0

        course.courseContent.map(
            (chapter) => chapter.chapterContent.map(
                (lecture) => time += lecture.lectureDuration
            )
        )

        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })

    }

    const calculateRating = (course) => {

        if (course.courseRatings.length === 0) {
            return 0
        }

        let totalRating = 0
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating
        })
        return Math.floor(totalRating / course.courseRatings.length)
    }

    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach(chapter => {
            if (Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    }


    useEffect(() => {
        fetchAllCourses()
    }, [])

    // Send FCM Token to Server
    const updateUserFcmToken = async (fcmToken) => {
        try {
            const token = await getToken();
            const { data } = await axios.post(
                backendUrl + '/api/user/update-fcm-token',
                { fcmToken },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                console.log("FCM Token saved on server successfully.");
            } else {
                console.warn("Failed to save FCM Token on server:", data.message);
            }
        } catch (error) {
            console.error("Error saving FCM Token on server:", error.message);
        }
    };

    // Fetch User's Data if User is Logged In
    useEffect(() => {
        if (user) {
            fetchUserData()
            fetchUserEnrolledCourses()
            fetchNotifications()
        }
    }, [user])

    // Request & Sync FCM Token when userData is available
    useEffect(() => {
        if (userData) {
            const setupNotifications = async () => {
                const token = await requestForToken();
                if (token && token !== userData.fcmToken) {
                    await updateUserFcmToken(token);
                }
            };
            setupNotifications();
        }
    }, [userData]);

    // Handle Foreground Notifications
    useEffect(() => {
        const messaging = getFirebaseMessaging();
        if (!messaging) return; // FCM not available, skip gracefully

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log("Foreground message received:", payload);
            toast.info(
                <div>
                    <strong>{payload.notification.title}</strong>
                    <p>{payload.notification.body}</p>
                </div>,
                { autoClose: 5000 }
            );
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const value = {
        showLogin, setShowLogin,
        backendUrl, currency, navigate,
        userData, setUserData, getToken,
        allCourses, fetchAllCourses,
        enrolledCourses, fetchUserEnrolledCourses,
        calculateChapterTime, calculateCourseDuration,
        calculateRating, calculateNoOfLectures,
        isEducator,setIsEducator,
        notifications, setNotifications,
        unreadCount, setUnreadCount,
        fetchNotifications
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}
