import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import { Mail, AlertCircle, User, Loader2, ArrowLeft, LogIn, Phone, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminLogin = location.pathname === '/admin/login' || location.pathname === '/admin-login';
  const redirectAfterLogin = location.state?.from?.pathname;

  // Tab: 'email' | 'otp'
  const [loginTab, setLoginTab] = useState('email');

  // Email/password form
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: isAdminLogin ? 'admin' : 'user',
  });

  // OTP form
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithOtp, sendLoginOtp, isAuthenticated, isAdmin } = useAuth();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (otpTimer <= 0) return;
    const t = setInterval(() => setOtpTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [otpTimer]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, role: isAdminLogin ? 'admin' : 'user' }));
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

  // Email/password submit
  const handleEmailSubmit = async (e) => {
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

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setLoading(true);
    const result = await sendLoginOtp(digits);
    setLoading(false);
    if (result.success) {
      setOtpSent(true);
      setSessionId(result.sessionId || '');
      setOtpTimer(60);
    } else {
      setError(result.message || 'Could not send OTP. Please try again.');
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Enter the OTP you received');
      return;
    }
    setError('');
    setLoading(true);
    const digits = phone.replace(/\D/g, '');
    const result = await loginWithOtp(digits, otp, sessionId);
    setLoading(false);
    if (result.success) {
      navigateAfterLogin(result.user);
    } else {
      setError(
        result.message ||
          (result.attemptsRemaining != null
            ? `Invalid OTP. ${result.attemptsRemaining} attempt(s) left.`
            : 'OTP verification failed.')
      );
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setOtp('');
    setError('');
    setLoading(true);
    const digits = phone.replace(/\D/g, '');
    const result = await sendLoginOtp(digits);
    setLoading(false);
    if (result.success) {
      setSessionId(result.sessionId || '');
      setOtpTimer(60);
    } else {
      setError(result.message || 'Could not resend OTP.');
    }
  };

  const headerBg = isAdminLogin
    ? 'bg-sky-500'
    : 'bg-gradient-to-r from-primary-blue to-primary-blue-light';

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
          {/* Header */}
          <div className={`${headerBg} px-8 py-8 text-center`}>
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
            <p className="text-blue-100 text-sm">
              {isAdminLogin ? 'Access your admin dashboard' : 'Sign in to your account'}
            </p>
          </div>

          <div className="px-8 py-8">
            {/* Tab switcher — only for non-admin */}
            {!isAdminLogin && (
              <div className="flex rounded-xl border border-gray-200 mb-6 overflow-hidden">
                <button
                  type="button"
                  onClick={() => { setLoginTab('email'); setError(''); }}
                  className={`flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                    loginTab === 'email'
                      ? 'bg-primary-blue text-white'
                      : 'bg-white text-text-light hover:text-text-dark'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginTab('otp'); setError(''); }}
                  className={`flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                    loginTab === 'otp'
                      ? 'bg-primary-blue text-white'
                      : 'bg-white text-text-light hover:text-text-dark'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  Phone OTP
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-3 shadow-sm mb-4"
              >
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            {/* ── Email / Password form ── */}
            {(isAdminLogin || loginTab === 'email') && (
              <form className="space-y-5" onSubmit={handleEmailSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-text-dark mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light w-5 h-5" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setError(''); }}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all bg-gray-50 focus:bg-white"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-text-dark mb-2">
                    Password
                  </label>
                  <PasswordInput
                    value={formData.password}
                    onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(''); }}
                    placeholder="••••••••"
                    required
                    name="password"
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all bg-gray-50 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-sky-400 to-primary-blue text-white py-3.5 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Signing in...</> : <><LogIn className="w-5 h-5" />Login</>}
                </button>
              </form>
            )}

            {/* ── Phone OTP form ── */}
            {!isAdminLogin && loginTab === 'otp' && (
              <div className="space-y-5">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-text-dark mb-2">
                        Mobile Number
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 border-2 border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-text-light text-sm font-medium">
                          +91
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]{10}"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                          required
                          placeholder="10-digit mobile number"
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-r-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all bg-gray-50 focus:bg-white"
                        />
                      </div>
                      <p className="text-xs text-text-light mt-1">We'll send a 6-digit OTP via SMS</p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || phone.length < 10}
                      className="w-full bg-gradient-to-r from-sky-400 to-primary-blue text-white py-3.5 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Sending OTP...</> : <><Phone className="w-5 h-5" />Send OTP</>}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                      <Shield className="w-4 h-4 flex-shrink-0" />
                      OTP sent to +91-{phone}
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                        className="ml-auto text-green-600 underline text-xs"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text-dark mb-2">
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                        required
                        placeholder="6-digit OTP"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-text-dark text-center text-2xl tracking-[0.5em] placeholder:text-base placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length < 4}
                      className="w-full bg-gradient-to-r from-sky-400 to-primary-blue text-white py-3.5 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Verifying...</> : <><Shield className="w-5 h-5" />Verify & Login</>}
                    </button>

                    <div className="text-center text-sm text-text-light">
                      {otpTimer > 0 ? (
                        <span>Resend OTP in <span className="font-semibold text-primary-blue">{otpTimer}s</span></span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={loading}
                          className="text-primary-blue font-semibold hover:text-primary-blue-light disabled:opacity-50"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Footer links */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
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
                  {loginTab === 'email' && (
                    <div className="flex justify-center">
                      <Link to="/forgot-password" className="text-sm text-primary-blue hover:text-primary-blue-light font-medium">
                        Forgot password?
                      </Link>
                    </div>
                  )}
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
