import React, { useContext, useState } from 'react';
import { assets } from '../../assets/assets';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {

  const location = useLocation();

  const isCoursesListPage = location.pathname.includes('/course-list');

  const { backendUrl, isEducator, setIsEducator, navigate, getToken, notifications, unreadCount, fetchNotifications } = useContext(AppContext)
  const [showNotifications, setShowNotifications] = useState(false);

  const markAllAsRead = async () => {
    try {
      const token = await getToken();
      await axios.patch(backendUrl + '/api/notifications/read-all', {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  }

  const { openSignIn } = useClerk()
  const { user } = useUser()

  const becomeEducator = async () => {

    try {

      if (isEducator) {
        navigate('/educator')
        return;
      }

      const token = await getToken()
      const { data } = await axios.get(backendUrl + '/api/educator/update-role', { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        toast.success(data.message)
        setIsEducator(true)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${isCoursesListPage ? 'bg-white' : 'bg-cyan-100/70'}`}>
      <img onClick={() => navigate('/')} src={assets.logo} alt="Logo" className="w-28 lg:w-32 cursor-pointer" />
      <div className="md:flex hidden items-center gap-5 text-gray-500">
        <div className="flex items-center gap-5">
          {
            user && <>
              <button onClick={becomeEducator}>{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
              | <Link to='/my-enrollments' >My Enrollments</Link>
            </>
          }
        </div>
        {user && (
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative flex items-center p-2 rounded-full hover:bg-gray-100 transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">Mark all as read</button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications && notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n._id} className={`px-4 py-3 border-b border-gray-100 ${!n.isRead ? 'bg-blue-50/50' : 'bg-white'}`}>
                        <div className="flex justify-between items-start">
                          <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</p>
                          {!n.isRead && <span className="h-2 w-2 bg-blue-600 rounded-full mt-1"></span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-3">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">No notifications yet</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {user
          ? <UserButton />
          : <button onClick={() => openSignIn()} className="bg-blue-600 text-white px-5 py-2 rounded-full">
            Create Account
          </button>}
      </div>
      {/* For Phone Screens */}
      <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>
        <div className="flex items-center gap-1 sm:gap-2 max-sm:text-xs">
          <button onClick={becomeEducator}>{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
          | {
            user && <Link to='/my-enrollments' >My Enrollments</Link>
          }
        </div>
        {user
          ? <UserButton />
          : <button onClick={() => openSignIn()}>
            <img src={assets.user_icon} alt="" />
          </button>}
      </div>
    </div>
  );
};

export default Navbar;