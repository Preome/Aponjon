import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LightBulbIcon,
  HeartIcon,
  BeakerIcon,
  FireIcon,
  MoonIcon,
  SunIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const HealthTips = () => {
  const { user } = useAuth();
  const [dailyTip, setDailyTip] = useState('');
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [tips, setTips] = useState([]);

  // Pre-defined health tips for elderly
  const allTips = {
    general: [
      {
        id: 1,
        title: "Stay Hydrated",
        content: "Drink 6-8 glasses of water daily to maintain good health and prevent dehydration.",
        icon: "💧",
        color: "blue"
      },
      {
        id: 2,
        title: "Regular Check-ups",
        content: "Visit your doctor for regular health check-ups every 6 months.",
        icon: "🏥",
        color: "green"
      },
      {
        id: 3,
        title: "Medication Schedule",
        content: "Take medications at the same time each day. Use a pill organizer to help remember.",
        icon: "💊",
        color: "purple"
      }
    ],
    exercise: [
      {
        id: 4,
        title: "Daily Walk",
        content: "A 15-20 minute walk daily improves heart health and maintains mobility.",
        icon: "🚶",
        color: "green"
      },
      {
        id: 5,
        title: "Stretching",
        content: "Gentle stretching in the morning helps maintain flexibility and reduces stiffness.",
        icon: "🧘",
        color: "yellow"
      },
      {
        id: 6,
        title: "Chair Exercises",
        content: "Try seated leg lifts and arm circles if standing is difficult.",
        icon: "🪑",
        color: "orange"
      }
    ],
    nutrition: [
      {
        id: 7,
        title: "Balanced Diet",
        content: "Include fruits, vegetables, lean protein, and whole grains in your meals.",
        icon: "🥗",
        color: "green"
      },
      {
        id: 8,
        title: "Calcium Rich Foods",
        content: "Consume dairy products, leafy greens, or fortified foods for bone health.",
        icon: "🥛",
        color: "blue"
      },
      {
        id: 9,
        title: "Limit Salt",
        content: "Reduce salt intake to help manage blood pressure.",
        icon: "🧂",
        color: "red"
      }
    ],
    mental: [
      {
        id: 10,
        title: "Stay Connected",
        content: "Call a friend or family member daily to maintain social connections.",
        icon: "📞",
        color: "purple"
      },
      {
        id: 11,
        title: "Brain Exercises",
        content: "Try puzzles, crosswords, or reading to keep your mind active.",
        icon: "🧩",
        color: "yellow"
      },
      {
        id: 12,
        title: "Relaxation",
        content: "Practice deep breathing or meditation to reduce stress.",
        icon: "🧘",
        color: "blue"
      }
    ],
    safety: [
      {
        id: 13,
        title: "Fall Prevention",
        content: "Remove trip hazards like rugs and keep pathways clear.",
        icon: "⚠️",
        color: "orange"
      },
      {
        id: 14,
        title: "Emergency Contacts",
        content: "Keep emergency numbers visible near your phone.",
        icon: "📱",
        color: "red"
      },
      {
        id: 15,
        title: "Home Safety",
        content: "Install night lights in hallways and bathroom for nighttime safety.",
        icon: "💡",
        color: "yellow"
      }
    ]
  };

  useEffect(() => {
    // Load a random daily tip
    const flatTips = Object.values(allTips).flat();
    const randomTip = flatTips[Math.floor(Math.random() * flatTips.length)];
    setDailyTip(randomTip);
    
    // Load all tips initially
    if (category === 'all') {
      setTips(Object.values(allTips).flat());
    } else {
      setTips(allTips[category] || []);
    }
    
    setLoading(false);
  }, [category]);

  const categories = [
    { id: 'all', name: 'All Tips', icon: '📋' },
    { id: 'general', name: 'General Health', icon: '❤️' },
    { id: 'exercise', name: 'Exercise', icon: '🚶' },
    { id: 'nutrition', name: 'Nutrition', icon: '🥗' },
    { id: 'mental', name: 'Mental Wellness', icon: '🧠' },
    { id: 'safety', name: 'Safety', icon: '🛡️' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">💚 Health Tips</h1>
          <Link
            to="/elderly-dashboard"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Daily Tip Card */}
        {dailyTip && (
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-start">
              <div className="text-4xl mr-4">{dailyTip.icon}</div>
              <div>
                <h2 className="text-xl font-bold mb-2">✨ Tip of the Day</h2>
                <p className="text-lg">{dailyTip.content}</p>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-lg transition ${
                  category === cat.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-${tip.color}-500`}
            >
              <div className="flex items-start">
                <div className="text-4xl mr-4">{tip.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-gray-600">{tip.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>These tips are for informational purposes only. Always consult with your healthcare provider.</p>
        </div>
      </div>
    </div>
  );
};

export default HealthTips;