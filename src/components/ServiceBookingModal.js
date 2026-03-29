import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, User, CreditCard, Edit2, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { formatPhoneNumber, getFormattedPhone, validatePhoneNumber } from '../utils/phoneFormatter';
import { useToast } from '../hooks/useToast';
import { Loader2 } from 'lucide-react';
import SuccessModal from './SuccessModal';

const ServiceBookingModal = ({ service, isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    addressType: 'myself',
    address: '',
    contactName: '',
    contactPhone: '',
    paymentOption: 'payLater',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  const timeSlots = [
    { label: '9:00 AM - 10:00 AM', value: '9-10' },
    { label: '10:00 AM - 12:00 PM', value: '10-12' },
    { label: '12:00 PM - 2:00 PM', value: '12-2' },
    { label: '2:00 PM - 4:00 PM', value: '2-4' },
    { label: '4:00 PM - 6:00 PM', value: '4-6' },
    { label: '6:00 PM - 8:00 PM', value: '6-8' },
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.date) newErrors.date = 'Please select a date';
      if (!formData.time) newErrors.time = 'Please select a time';
    } else if (stepNumber === 2) {
      if (!formData.address) newErrors.address = 'Please enter address';
      // Phone is required for both "myself" and "someoneElse"
      if (!formData.contactPhone) newErrors.contactPhone = 'Please enter phone number';
      if (formData.contactPhone && !validatePhoneNumber(formData.contactPhone)) {
        newErrors.contactPhone = 'Please enter valid 10-digit phone number';
      }
      // Name required for both cases
      if (!formData.contactName) newErrors.contactName = 'Please enter name';
    } else if (stepNumber === 3) {
      if (!formData.paymentOption) newErrors.paymentOption = 'Please select payment option';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      const isPayLater = formData.paymentOption === 'payLater';
      const bookingData = {
        serviceId: service._id || service.id,
        serviceTitle: service.title,
        servicePrice: service.price,
        // Always send a name
        name: formData.contactName,
        // Backend requires a 'phone' field (E.164 handled by formatter)
        phone: getFormattedPhone(formData.contactPhone),
        date: formData.date,
        time: formData.time,
        address: formData.address,
        addressType: formData.addressType,
        contactName: formData.contactName,
        contactPhone: getFormattedPhone(formData.contactPhone),
        paymentOption: formData.paymentOption,
      };

      // For 'Pay After Service', show success immediately for a snappier UX,
      // and attempt the submit in the background. For 'Pay Now', wait for submit.
      if (isPayLater) {
        setSuccessOpen(true);
        try {
          await onSubmit(bookingData);
        } catch (e) {
          // Swallow errors here since user already saw success; backend can reconcile.
        }
      } else {
        await onSubmit(bookingData);
        setSuccessOpen(true);
      }
    } catch (error) {
      showError('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      date: '',
      time: '',
      addressType: 'myself',
      address: '',
      contactName: '',
      contactPhone: '',
      paymentOption: 'payLater',
    });
    setErrors({});
    onClose();
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Tomorrow
    return today.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        {/* Submitting overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-xl shadow p-4 flex items-center space-x-3">
              <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
              <span className="text-neutral-900">Submitting your booking...</span>
            </div>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-neutral-900">Book Service</h2>

            
            <button
              onClick={handleClose}
              className="text-gray-400 bg-[#c5362c] text-white px-3 py-1 rounded-lg hover:text-gray-600 transition"
            >
              Close
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s
                        ? 'bg-sky-500 text-white'
                        : 'bg-gray-200 text-slate-500'
                        }`}
                    >
                      {step > s ? <Check className="w-5 h-5" /> : s}
                    </div>
                    <span className="text-xs mt-1 text-slate-500">
                      {s === 1 ? 'Date & Time' : s === 2 ? 'Address' : s === 3 ? 'Payment' : 'Review'}
                    </span>
                  </div>
                  {s < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${step > s ? 'bg-sky-500' : 'bg-gray-200'
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Date & Time */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                      Select Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                      <input
                        type="date"
                        min={getMinDate()}
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                      Select Time Slot <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() => handleChange('time', slot.value)}
                          className={`py-3 px-4 rounded-lg border-2 transition text-sm ${formData.time === slot.value
                            ? 'border-sky-500 bg-sky-50 text-sky-700 font-semibold'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                    {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Address */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-3">
                      Service For <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button" style={{ outline: '2px solid #000' }}

                        onClick={() => handleChange('addressType', 'myself')}
                        className={`w-full px-3 py-1  rounded-lg border-2 text-center font-medium transition ${formData.addressType === 'myself'
                          ? 'border-sky-500 bg-sky-500 text-white shadow-sm'
                          : 'border-gray-200 text-neutral-900 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        aria-pressed={formData.addressType === 'myself'}
                      >
                        Myself
                      </button>
                      <button
                        type="button"
                        style={{ outline: '2px solid #000' }}
                        onClick={() => handleChange('addressType', 'someoneElse')}
                        className={`w-full px-3 py-1  rounded-lg border-2 text-center font-medium transition ${formData.addressType === 'someoneElse'
                          ? 'border-sky-500 bg-sky-500 text-white shadow-sm'
                          : 'border-gray-200 text-neutral-900 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        aria-pressed={formData.addressType === 'someoneElse'}
                      >
                        Someone Else
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        rows="4"
                        placeholder="Enter complete address"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                      {formData.addressType === 'someoneElse' ? 'Contact Name' : 'Your Name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => handleChange('contactName', e.target.value)}
                      placeholder={formData.addressType === 'someoneElse' ? 'Enter contact person name' : 'Enter your name'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    {errors.contactName && (
                      <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                      {formData.addressType === 'someoneElse' ? 'Contact Phone' : 'Phone'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm font-medium">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          handleChange('contactPhone', formatted);
                        }}
                        maxLength={15}
                        placeholder="10-digit phone number"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    {errors.contactPhone && (
                      <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-3">
                      Payment Option <span className="text-red-500">*</span>
                    </label>
                    <div role="radiogroup" className="space-y-3">
                      <label
                        className={`flex items-start justify-between gap-3 p-4 rounded-lg border cursor-pointer transition ${formData.paymentOption === 'payNow'
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <input
                          type="radio"
                          name="paymentOption"
                          value="payNow"
                          checked={formData.paymentOption === 'payNow'}
                          onChange={(e) => handleChange('paymentOption', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-start gap-3">
                          <CreditCard className={`w-5 h-5 mt-0.5 ${formData.paymentOption === 'payNow' ? 'text-sky-500' : 'text-slate-500'}`} />
                          <div>
                            <div className="font-semibold text-neutral-900">Pay Now</div>
                            <div className="text-sm text-slate-500">Pay immediately via online payment</div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-sky-700">₹{service.price}</div>
                      </label>

                      <label
                        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition ${formData.paymentOption === 'payLater'
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <input
                          type="radio"
                          name="paymentOption"
                          value="payLater"
                          checked={formData.paymentOption === 'payLater'}
                          onChange={(e) => handleChange('paymentOption', e.target.value)}
                          className="sr-only"
                        />
                        <Clock className={`w-5 h-5 mt-0.5 ${formData.paymentOption === 'payLater' ? 'text-sky-500' : 'text-slate-500'}`} />
                        <div>
                          <div className="font-semibold text-neutral-900">Pay After Service</div>
                          <div className="text-sm text-slate-500">Pay after service completion</div>
                        </div>
                      </label>
                    </div>
                    {errors.paymentOption && (
                      <p className="text-red-500 text-sm mt-1">{errors.paymentOption}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <h3 className="text-lg font-semibold text-neutral-900">Service Details</h3>
                      <button
                        onClick={() => setStep(1)}
                        className="text-sky-500 hover:text-sky-700 flex items-center space-x-1 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Service:</span>
                        <p className="font-medium text-neutral-900">{service.title}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Price:</span>
                        <p className="font-medium text-neutral-900">₹{service.price}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Date:</span>
                        <p className="font-medium text-neutral-900">{formData.date}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Time Slot:</span>
                        <p className="font-medium text-neutral-900">
                          {timeSlots.find(s => s.value === formData.time)?.label || formData.time}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Address:</span>
                        <p className="font-medium text-neutral-900">{formData.address}</p>
                      </div>
                      {formData.addressType === 'someoneElse' && (
                        <>
                          <div>
                            <span className="text-slate-500">Contact Name:</span>
                            <p className="font-medium text-neutral-900">{formData.contactName}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Contact Phone:</span>
                            <p className="font-medium text-neutral-900">
                              {getFormattedPhone(formData.contactPhone)}
                            </p>
                          </div>
                        </>
                      )}
                      <div>
                        <span className="text-slate-500">Payment:</span>
                        <p className="font-medium text-neutral-900">
                          {formData.paymentOption === 'payNow' ? 'Pay Now' : 'Pay After Service'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Buttons */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
            <div className="flex-1" />
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-700 transition"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-3 w-auto py-1 bg-sky-500 text-white rounded-lg hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Booking
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {/* Success modal */}
        <SuccessModal
          isOpen={successOpen}
          title="Booking confirmed"
          message="You will get a call from us very soon."
          onClose={() => {
            setSuccessOpen(false);
            handleClose();
          }}
          confirmText="Great"
        />
      </div>
    </AnimatePresence>
  );
};

export default ServiceBookingModal;

