import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ArrowRightOnRectangleIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch medication alerts for notification count
  useEffect(() => {
    if (user?.role === 'elderly') {
      fetchNotificationCount();
      // Check every minute
      const interval = setInterval(fetchNotificationCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotificationCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/medications/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setNotificationCount(data.due.length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch(user.role) {
      case 'elderly':
        return '/elderly-dashboard';
      case 'volunteer':
        return '/volunteer-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to={user ? getDashboardLink() : '/'} className="flex items-center space-x-2">
            <span className="text-3xl font-bold text-primary-600">Aponjon</span>
            <span className="text-sm text-gray-500 italic">- Elderly Care</span>
          </Link>

          {/* Empty middle section - NO Home, About, Services, Contact */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Nothing here */}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Notification Bell (only for elderly) */}
                {user.role === 'elderly' && (
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-gray-600 hover:text-primary-600 transition"
                    >
                      <BellIcon className="h-6 w-6" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                          {notificationCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                        <div className="p-3 border-b bg-gray-50 rounded-t-lg">
                          <h3 className="font-semibold text-gray-700">Medication Reminders</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notificationCount > 0 ? (
                            <div className="p-4 text-center">
                              <p className="text-red-500 font-medium mb-2">
                                {notificationCount} medication{notificationCount > 1 ? 's' : ''} due now!
                              </p>
                              <Link
                                to="/medications"
                                className="text-primary-600 hover:text-primary-700 text-sm"
                                onClick={() => setShowNotifications(false)}
                              >
                                View Medications →
                              </Link>
                            </div>
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              No pending medications
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Dashboard Link */}
                <Link
                  to={getDashboardLink()}
                  className="text-primary-600 hover:text-primary-700 font-medium transition duration-300"
                >
                  Dashboard
                </Link>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 font-medium"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium transition duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition duration-300 font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-primary-600 focus:outline-none"
          >
            {isOpen ? (
              <XMarkIcon className="h-8 w-8" />
            ) : (
              <Bars3Icon className="h-8 w-8" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                  {/* Mobile Notification */}
                  {user.role === 'elderly' && notificationCount > 0 && (
                    <Link
                      to="/medications"
                      className="flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      <BellIcon className="h-5 w-5" />
                      <span>{notificationCount} medication reminder{notificationCount > 1 ? 's' : ''}</span>
                    </Link>
                  )}
                  <Link
                    to={getDashboardLink()}
                    className="text-primary-600 hover:text-primary-700 font-medium py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center space-x-2 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-300"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-700 font-medium py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition duration-300 text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;