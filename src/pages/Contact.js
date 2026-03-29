import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Store } from 'lucide-react';
import { apiService } from '../services/api';
import LeadCaptureModal from '../components/LeadCaptureModal';
import { formatPhoneNumber, getFormattedPhone, validatePhoneNumber } from '../utils/phoneFormatter';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    type: 'general', // 'general' or 'vendor-listing'
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const modalTimerRef = useRef(null);

  useEffect(() => {
    // Show modal after 2 minutes (120000 ms) of being on the page
    modalTimerRef.current = setTimeout(() => {
      setShowModal(true);
    }, 120000); // 2 minutes

    return () => {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill all required fields');
      return;
    }

    // Validate phone if provided
    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      let response;

      // Format phone number before sending
      const formattedPhone = formData.phone ? getFormattedPhone(formData.phone) : '';

      if (formData.type === 'vendor-listing') {
        // Validator requires businessName (see BACKEND_API_REFERENCE — vendor-listing-request).
        response = await apiService.submitVendorListingRequest({
          name: formData.name,
          businessName: formData.name,
          email: formData.email,
          phone: formattedPhone,
          message: formData.message,
        });
      } else {
        // Submit general contact form
        response = await apiService.submitContactForm({
          name: formData.name,
          email: formData.email,
          phone: formattedPhone,
          message: formData.message,
        });
      }

      if (response.success) {
        setSubmitted(true);
        setError('');
        // Clear form after successful submission
        setTimeout(() => {
          setFormData({ name: '', email: '', phone: '', message: '', type: 'general' });
          setSubmitted(false);
        }, 3000);
      } else {
        setError(response.message || 'Failed to send message. Please try again.');
        setSubmitted(false);
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError('An error occurred. Please try again.');
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text-dark mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-text-light max-w-3xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <MapPin className="w-8 h-8 text-primary-blue mb-4" />
              <h3 className="text-lg font-semibold text-text-dark mb-2">Address</h3>
              <p className="text-text-light">
                123 Business Street<br />
                City, State 12345<br />
                India
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <Phone className="w-8 h-8 text-primary-blue mb-4" />
              <h3 className="text-lg font-semibold text-text-dark mb-2">Phone</h3>
              <p className="text-text-light">
                <a href="tel:+919876543210" className="hover:text-primary-blue">
                  +91 9876543210
                </a>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <Mail className="w-8 h-8 text-primary-blue mb-4" />
              <h3 className="text-lg font-semibold text-text-dark mb-2">Email</h3>
              <p className="text-text-light">
                <a href="mailto:info@coolrentals.com" className="hover:text-primary-blue">
                  info@coolrentals.com
                </a>
              </p>
            </motion.div>

            {/* Vendor Listing CTA */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-primary-blue text-white p-6 rounded-lg shadow-md"
            >
              <Store className="w-8 h-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Want to List Your AC?</h3>
              <p className="text-blue-100 text-sm mb-4">
                Are you a vendor looking to list your ACs on our platform?
              </p>
              <button
                onClick={() => setFormData({ ...formData, type: 'vendor-listing' })}
                className="w-full bg-white text-primary-blue px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Submit Listing Request
              </button>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-lg shadow-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-dark">
                  {formData.type === 'vendor-listing' ? 'Vendor Listing Request' : 'Send us a Message'}
                </h2>
                {formData.type === 'vendor-listing' && (
                  <button
                    onClick={() => setFormData({ ...formData, type: 'general' })}
                    className="text-sm text-primary-blue hover:text-primary-blue-light"
                  >
                    Switch to General Inquiry
                  </button>
                )}
              </div>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg flex items-start space-x-3 mb-6 shadow-sm"
                >
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">
                      {formData.type === 'vendor-listing'
                        ? 'Request submitted successfully!'
                        : 'Message sent successfully!'}
                    </p>
                    <p className="text-sm mt-1">
                      {formData.type === 'vendor-listing'
                        ? 'We will contact you soon regarding your vendor listing request.'
                        : 'We will get back to you soon.'}
                    </p>
                  </div>
                </motion.div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2 mb-6">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    {formData.type === 'vendor-listing' ? 'Business name' : 'Name'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder={
                      formData.type === 'vendor-listing' ? 'Registered business or trading name' : ''
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light text-sm font-medium">
                      +91
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setFormData({ ...formData, phone: formatted });
                      }}
                      maxLength={15}
                      placeholder="10-digit phone number"
                      className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                  </div>
                  {formData.phone && !validatePhoneNumber(formData.phone) && (
                    <p className="text-xs text-red-500 mt-1">Please enter 10 digits</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    {formData.type === 'vendor-listing' ? 'Tell us about your business' : 'Message'} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder={formData.type === 'vendor-listing'
                      ? 'Tell us about your AC rental business, number of ACs, location, etc.'
                      : 'Your message...'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-blue-light transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  <span>{loading ? 'Sending...' : formData.type === 'vendor-listing' ? 'Submit Request' : 'Send Message'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lead Capture Modal */}
      {showModal && (
        <LeadCaptureModal
          onClose={() => setShowModal(false)}
          source="contact"
        />
      )}
    </div>
  );
};

export default Contact;
