import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import { Mail, AlertCircle, User, Loader2, ArrowLeft, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminLogin = location.pathname === '/admin/login' || location.pathname === '/admin-login';
  const redirectAfterLogin = location.state?.from?.pathname;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: isAdminLogin ? 'admin' : 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      role: isAdminLogin ? 'admin' : 'user',
    }));
    setError('');
  }, [isAdminLogin]);

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdminLogin && isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else if (!isAdminLogin && !isAdmin) {
        const safe =
          redirectAfterLogin &&
          typeof redirectAfterLogin === 'string' &&
          redirectAfterLogin !== '/login' &&
          !redirectAfterLogin.startsWith('/admin');
        navigate(safe ? redirectAfterLogin : '/user/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, isAdminLogin, navigate, redirectAfterLogin]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const navigateAfterLogin = (loggedInUser) => {
    if (isAdminLogin || loggedInUser?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    if (loggedInUser?.role === 'vendor') {
      navigate('/vendor/dashboard', { replace: true });
      return;
    }
    const safe =
      redirectAfterLogin &&
      typeof redirectAfterLogin === 'string' &&
      redirectAfterLogin !== '/login' &&
      !redirectAfterLogin.startsWith('/admin');
    navigate(safe ? redirectAfterLogin : '/user/dashboard', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(formData.email, formData.password, formData.role);
    setLoading(false);
    if (result.success) {
      navigateAfterLogin(result.user);
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-text-light hover:text-primary-blue mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
        >
          <div
            className={
              isAdminLogin
                ? 'bg-sky-500 px-8 py-10 text-center'
                : 'bg-gradient-to-r from-primary-blue to-primary-blue-light px-8 py-8 text-center'
            }
          >
            {!isAdminLogin && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4"
              >
                <User className="w-8 h-8 text-white" />
              </motion.div>
            )}
            <h2 className="text-3xl font-bold text-white mb-2">
              {isAdminLogin ? 'Admin Login' : 'Login'}
            </h2>
            <p className={isAdminLogin ? 'text-white/90 text-sm font-medium' : 'text-blue-100 text-sm'}>
              {isAdminLogin
                ? 'Access your admin dashboard'
                : 'Enter your email and password to continue'}
            </p>
          </div>

          <div className="px-8 py-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-3 shadow-sm"
                >
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-text-dark mb-2">
                  {isAdminLogin ? 'Email Address' : 'Email'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={
                      isAdminLogin
                        ? 'w-full pl-12 pr-4 py-3 border-2 border-sky-500 rounded-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-600 transition-all duration-300 bg-white'
                        : 'w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all duration-300 bg-gray-50 focus:bg-white'
                    }
                    placeholder={isAdminLogin ? 'admin@example.com' : 'you@example.com'}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-text-dark mb-2">
                  Password
                </label>
                <PasswordInput
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isAdminLogin ? 'Enter your password' : '••••••••'}
                  required
                  name="password"
                  className={
                    isAdminLogin
                      ? 'w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 bg-gray-100 text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300'
                      : 'w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all duration-300 bg-gray-50 focus:bg-white'
                  }
                />
                {!isAdminLogin && (
                  <p className="text-xs text-text-light mt-2">
                    Use the email and password you signed up with.
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={
                  isAdminLogin
                    ? 'w-full bg-sky-500 hover:bg-sky-600 text-white py-3.5 px-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                    : 'w-full bg-gradient-to-r from-sky-400 to-primary-blue text-white py-3.5 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : isAdminLogin ? (
                  'Sign In to Dashboard'
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Login
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
              {!isAdminLogin && (
                <>
                  <p className="text-sm text-center text-text-light">
                    Don&apos;t have an account?{' '}
                    <Link to="/signup" className="text-primary-blue font-semibold hover:text-primary-blue-light">
                      Sign up
                    </Link>
                  </p>
                  <p className="text-sm text-center text-text-light">
                    Are you an admin?{' '}
                    <Link to="/admin/login" className="text-primary-blue font-semibold hover:text-primary-blue-light">
                      Admin Login
                    </Link>
                  </p>
                  <div className="flex justify-center">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary-blue hover:text-primary-blue-light font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </>
              )}
              {isAdminLogin && (
                <p className="text-xs text-center text-text-light">
                  Secure admin access only. Unauthorized access is prohibited.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
