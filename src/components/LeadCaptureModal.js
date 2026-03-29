import React, { useState, useEffect } from 'react';
import { X, Phone, User } from 'lucide-react';
import { apiService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPhoneNumber, getFormattedPhone, validatePhoneNumber } from '../utils/phoneFormatter';

const LeadCaptureModal = ({ onClose, source = 'browse' }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    interest: 'rental', // 'rental' or 'service'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

    if (!formData.name || !formData.phone) {
      setError('Please fill all required fields');
      return;
    }

    // Validate phone number (must be 10 digits)
    if (!validatePhoneNumber(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    // Format phone number with +91 before sending
    const formattedPhone = getFormattedPhone(formData.phone);
    
    const leadData = {
      name: formData.name,
      phone: formattedPhone,
      interest: formData.interest,
      source: source, // 'browse' or 'contact'
    };

    const response = await apiService.createLead(leadData);

    if (response.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setError(response.message || 'Failed to submit. Please try again.');
    }

    setLoading(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg p-6 max-w-md w-full relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-light hover:text-text-dark transition"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold text-text-dark mb-2">Get a Callback</h2>
          <p className="text-text-light mb-6">
            Fill in your details and we'll get back to you shortly!
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              Thank you! We'll contact you soon.
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your Name"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Phone Number <span className="text-red-500">*</span>
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
                    required
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
                  I'm looking for <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="interest"
                      value="rental"
                      checked={formData.interest === 'rental'}
                      onChange={handleChange}
                      className="text-primary-blue focus:ring-primary-blue"
                    />
                    <span className="text-text-dark">Rental AC</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="interest"
                      value="service"
                      checked={formData.interest === 'service'}
                      onChange={handleChange}
                      className="text-primary-blue focus:ring-primary-blue"
                    />
                    <span className="text-text-dark">AC Service/Repair</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LeadCaptureModal;
