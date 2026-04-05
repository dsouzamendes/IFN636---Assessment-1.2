import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      // Support both nested { user: {...}, token } and flat { id, name, email, token }
      const token = response.data.token;
      const user = response.data.user || {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      };
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      login({ ...user, token });
      navigate('/entries');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-teal-100 mt-2">Sign in to your personal diary</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold py-3 rounded-lg hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 transition-all transform hover:scale-105"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            {/* Link to Register */}
            <p className="text-center text-gray-600 mt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-teal-600 font-semibold hover:text-teal-700">
                Create one here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
