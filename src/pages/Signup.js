import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import { Mail, User, Phone, AlertCircle, CheckCircle, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPhoneNumber, normalizePhoneForApi } from '../utils/phoneFormatter';

/** Matches POST /auth/signup `interestedIn` examples (AC, Refrigerator) plus Washing Machine for this app. */
const INTEREST_OPTIONS = ['AC', 'Refrigerator', 'Washing Machine'];

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    homeAddress: '',
    interestedIn: [],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'interestedIn') {
      setFormData((prev) => {
        const next = new Set(prev.interestedIn || []);
        if (checked) next.add(value);
        else next.delete(value);
        return { ...prev, interestedIn: [...next] };
      });
    } else if (name === 'phone') {
      setFormData({ ...formData, phone: formatPhoneNumber(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
    setSuccess(false);
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (!normalizePhoneForApi(formData.phone)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const { confirmPassword, phone, interestedIn, ...rest } = formData;
    const payload = {
      ...rest,
      phone: normalizePhoneForApi(phone),
      ...(interestedIn?.length ? { interestedIn } : {}),
    };
    const result = await signup(payload);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 1500);
    } else {
      setError(result.message || 'Signup failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
        >
          <div className="bg-gradient-to-r from-primary-blue to-primary-blue-light px-8 py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4"
            >
              <User className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Create an Account</h2>
            <p className="text-blue-100 text-sm">Join us to rent appliances and book services</p>
          </div>

          <div className="px-8 py-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
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

              {success && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg flex items-start space-x-3 shadow-sm"
                >
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">Account created successfully! Redirecting...</span>
                </motion.div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your.email@example.com"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      autoComplete="tel"
                      inputMode="numeric"
                      placeholder="+91 9876543210"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <p className="text-xs text-text-light mt-1">
                    Stored as 10 digits on the server (same as{' '}
                    <code className="text-[11px] bg-gray-100 px-1 rounded">POST /auth/signup</code>).
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">
                    Address <span className="font-normal text-text-light">(optional)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3 text-text-light w-5 h-5" />
                    <textarea
                      name="homeAddress"
                      value={formData.homeAddress}
                      onChange={handleChange}
                      rows={2}
                      placeholder="e.g. 12 MG Road, Bengaluru"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all duration-300 bg-gray-50 focus:bg-white resize-none"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-sm font-semibold text-text-dark mb-2">
                    Interested in <span className="font-normal text-text-light">(optional)</span>
                  </span>
                  <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/80 p-3">
                    {INTEREST_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-text-dark">
                        <input
                          type="checkbox"
                          name="interestedIn"
                          value={opt}
                          checked={formData.interestedIn.includes(opt)}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-primary-blue focus:ring-primary-blue"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">Password</label>
                  <PasswordInput
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    required
                    name="password"
                    className="w-full"
                  />
                  <p className="text-xs text-text-light mt-1">Must be at least 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">Confirm Password</label>
                  <PasswordInput
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    required
                    name="confirmPassword"
                    className="w-full"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-primary-blue to-primary-blue-light text-white py-3.5 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </motion.button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm">
              <p className="text-text-light">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-blue font-semibold hover:text-primary-blue-light transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;

