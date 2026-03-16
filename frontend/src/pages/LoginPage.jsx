import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/api';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If already logged in, redirect based on location
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (token && user.role) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await login(email, password);

      console.log('🔐 Login Response:', response);

      if (response.success) {
        // Store token and user info
        console.log('💾 Storing token:', response.token);
        console.log('💾 Storing user:', response.user);
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Verify storage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        console.log('✅ Token stored:', !!storedToken);
        console.log('✅ User stored:', storedUser);

        // Redirect based on role
        if (response.user.role === 'admin' || response.user.role === 'superadmin') {
          console.log('🚀 Redirecting to admin dashboard');
          navigate('/admin');
        } else {
          console.log('🚀 Redirecting to home');
          navigate('/');
        }
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      console.error('❌ Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-prosto-one font-normal text-gray-950 mb-2">
              Login
            </h1>
            <p className="text-gray-600 font-montserrat text-sm">
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-800 font-montserrat text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white font-montserrat font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-montserrat text-blue-900 mb-2 font-medium">
              Demo Admin Credentials:
            </p>
            <p className="text-xs font-montserrat text-blue-800">
              Email: hammad@gmail.com<br/>
              Password: 12345678
            </p>
          </div>

          {/* Signup Link */}
          <div className="text-center mt-6">
            <p className="text-sm font-montserrat text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Sign up here
              </button>
            </p>
          </div>

          {/* Back to Store */}
          <div className="text-center mt-4">
            <a href="/" className="text-sm font-montserrat text-blue-600 hover:text-blue-700">
              ← Back to Store
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
