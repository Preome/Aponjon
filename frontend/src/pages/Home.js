import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  PhoneIcon, 
  ClockIcon, 
  UserGroupIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const features = [
    {
      icon: HeartIcon,
      title: 'Health Monitoring',
      description: 'Track vital signs, medications, and health metrics in real-time',
      color: 'text-red-500'
    },
    {
      icon: PhoneIcon,
      title: 'Emergency Response',
      description: 'Instant alert system for emergencies with automatic contact notification',
      color: 'text-green-500'
    },
    {
      icon: ClockIcon,
      title: 'Medication Reminders',
      description: 'Never miss a dose with smart reminders and tracking',
      color: 'text-blue-500'
    },
    {
      icon: UsersIcon,
      title: 'Elder Community',
      description: 'Connect with other elders, join groups, and build meaningful friendships',
      color: 'text-purple-500'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI Health Assistant',
      description: 'Get instant health advice and companionship from our AI chatbot',
      color: 'text-yellow-500'
    },
    {
      icon: DocumentTextIcon,
      title: 'Health Reports',
      description: 'Generate and download comprehensive health reports to share with doctors',
      color: 'text-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 opacity-50"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Welcome to <span className="text-primary-600">Aponjon</span>
              </h1>
              <p className="text-2xl text-gray-700 mb-4">
                Caring for Seniors with Community Support
              </p>
              <p className="text-lg text-gray-600 mb-8">
                
              </p>
              <div className="flex space-x-4">
                <Link to="/register" className="btn-primary text-lg px-8 py-3">
                  Get Started
                </Link>
                
              </div>
            </div>
            <div className="lg:w-1/2">
              <img 
                src="/images/elderly-care-custom.jpeg" 
                alt=""
                className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Care Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to ensure the safety, health, and happiness of your elderly loved ones
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-100">
                <div className={`w-16 h-16 ${feature.color} bg-opacity-10 rounded-lg flex items-center justify-center mb-6`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Aponjon Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to start caring for your loved ones
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-12">
            <div className="text-center max-w-xs">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Account</h3>
              <p className="text-gray-600">Sign up and set up your profile with medical information</p>
            </div>
            <div className="text-center max-w-xs">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect with Community</h3>
              <p className="text-gray-600">Join groups, make friends, and chat with other elders</p>
            </div>
            <div className="text-center max-w-xs">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track & Monitor</h3>
              <p className="text-gray-600">Manage medications, track health, and get AI assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of families who trust Aponjon for their elderly care needs
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition duration-300 text-lg font-semibold">
              Sign Up Now
            </Link>
            <Link to="/contact" className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-primary-600 transition duration-300 text-lg font-semibold">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;