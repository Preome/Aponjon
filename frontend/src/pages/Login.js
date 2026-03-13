import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'elderly'
  });
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setError('');
    
    try {
      console.log('Logging in with:', formData.email);
      const result = await login(formData.email, formData.password, formData.role);
      
      if (result.success) {
        console.log('Login successful, redirecting...');
        switch(formData.role) {
          case 'elderly':
            navigate('/elderly-dashboard');
            break;
          case 'volunteer':
            navigate('/volunteer-dashboard');
            break;
          case 'admin':
            navigate('/admin-dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        setError(result.error || 'Login failed');
        setLocalLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLocalLoading(false);
    }
  };

  const roles = [
    { value: 'elderly', label: 'Elderly Person', icon: '👴' },
    { value: 'volunteer', label: 'Volunteer', icon: '🤝' },
    { value: 'admin', label: 'Administrator', icon: '👨‍💼' }
  ];

  const isLoading = localLoading || authLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-primary-600 py-6 px-8">
          <h2 className="text-3xl font-bold text-white text-center">Welcome Back</h2>
          <p className="text-primary-100 text-center mt-2">Sign in to your Aponjon account</p>
        </div>
        
        <div className="py-8 px-8">
          {(error || authError) && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
              {error || authError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData({...formData, role: role.value})}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.role === role.value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{role.icon}</div>
                    <div className={`text-xs font-medium ${
                      formData.role === role.value ? 'text-primary-600' : 'text-gray-600'
                    }`}>
                      {role.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">Select role and use any email/password:</p>
            <div className="space-y-1">
              <p className="text-xs text-blue-600">👴 Elderly → /elderly-dashboard</p>
              <p className="text-xs text-blue-600">🤝 Volunteer → /volunteer-dashboard</p>
              <p className="text-xs text-blue-600">👨‍💼 Admin → /admin-dashboard</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">Try: elder@gmail.com / 123456</p>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;