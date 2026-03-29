import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Plus, Edit2, Trash2, Eye, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';
import uploadFileToCloudinary from '../../utils/cloudinary';

const ManageServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    badge: '',
    image: null,
    imageUrl: '',
    process: '',
    benefits: '',
    keyFeatures: '',
    recommendedFrequency: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toasts, removeToast, success: showSuccess, error: showError } = useToast();

  // Suggestions for quick add
  const featureSuggestions = ['Certified professionals', 'Advanced tools', 'All AC types', 'Transparent guidance'];
  const benefitSuggestions = ['Accurate diagnostics', 'Restores performance', 'Prevents breakdowns', 'Saves energy'];
  const [benefitInput, setBenefitInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');

  const loadServices = useCallback(async () => {
    setLoading(true);
    const response = await apiService.getServices();
    if (response.success) {
      setServices(response.data || []);
    } else {
      showError('Failed to load services');
    }
    setLoading(false);
  }, [showError]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);

    try {
      const imageUrl = await uploadFileToCloudinary(file);
      setFormData({ ...formData, imageUrl, image: file });
      showSuccess('Image uploaded successfully');
    } catch (error) {
      showError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      originalPrice: '',
      badge: '',
      image: null,
      imageUrl: '',
      process: '',
      benefits: '',
      keyFeatures: '',
      recommendedFrequency: '',
    });
    setImagePreview('');
    setShowAddModal(true);
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setFormData({
      title: service.title || '',
      description: service.description || '',
      price: service.price || '',
      originalPrice: service.originalPrice || '',
      badge: service.badge || '',
      image: null,
      imageUrl: service.image || '',
      // If arrays are stored, join to newline for the textarea UX
      process: Array.isArray(service.process) ? service.process.join('\n') : (service.process || ''),
      benefits: Array.isArray(service.benefits) ? service.benefits : (service.benefits ? [service.benefits] : []),
      keyFeatures: Array.isArray(service.keyFeatures) ? service.keyFeatures : (service.keyFeatures ? [service.keyFeatures] : []),
      recommendedFrequency: service.recommendedFrequency || '',
    });
    setImagePreview(service.image || '');
    setShowEditModal(true);
  };

  const handleView = (service) => {
    setSelectedService(service);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    const response = await apiService.deleteService(id);
    if (response.success) {
      showSuccess('Service deleted successfully');
      loadServices();
    } else {
      showError(response.message || 'Failed to delete service');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.price) {
      showError('Please fill all required fields');
      return;
    }

    const toArray = (val) => {
      if (Array.isArray(val)) return val.filter(Boolean).map((s) => String(s).trim()).filter((s) => s.length > 0);
      return (val || '')
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    };

    const serviceData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
      badge: formData.badge || null,
      image: formData.imageUrl,
      // Save as arrays for rich rendering on user side
      process: toArray(formData.process),
      benefits: toArray(formData.benefits),
      keyFeatures: toArray(formData.keyFeatures),
      recommendedFrequency: formData.recommendedFrequency || '',
    };

    let response;
    if (showEditModal && selectedService) {
      response = await apiService.updateService(selectedService._id || selectedService.id, serviceData);
    } else {
      response = await apiService.addService(serviceData);
    }

    if (response.success) {
      showSuccess(showEditModal ? 'Service updated successfully' : 'Service added successfully');
      setShowAddModal(false);
      setShowEditModal(false);
      loadServices();
    } else {
      showError(response.message || 'Failed to save service');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-text-dark">Manage Services</h1>
          <button
            onClick={handleAdd}
            className="flex items-center space-x-2 bg-primary-blue text-white px-6 py-3 rounded-lg hover:bg-primary-blue-light transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Service</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <motion.div
              key={service._id || service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={service.image || '/api/placeholder/400/300'}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                {service.badge && (
                  <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full mb-2">
                    {service.badge}
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-purple-600">₹{service.price}</span>
                    {service.originalPrice && (
                      <span className="text-gray-400 line-through ml-2">₹{service.originalPrice}</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(service)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEdit(service)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(service._id || service.id)}
                    className="flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No services added yet</p>
            <button
              onClick={handleAdd}
              className="mt-4 text-primary-blue hover:text-primary-blue-light"
            >
              Add your first service
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {showEditModal ? 'Edit Service' : 'Add Service'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Badge</label>
                  <select
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">None</option>
                    <option value="Visit Within 1 Hour">Visit Within 1 Hour</option>
                    <option value="Most Booked">Most Booked</option>
                    <option value="Power Saver">Power Saver</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {uploadingImage && (
                  <div className="mt-2 flex items-center space-x-2 text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-cover rounded-lg"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Process</label>
                <textarea
                  value={formData.process}
                  onChange={(e) => setFormData({ ...formData, process: e.target.value })}
                  rows="4"
                  placeholder="Describe the service process..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Benefits Tag Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Benefits (as list)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.benefits || []).map((b, idx) => (
                    <span key={idx} className="inline-flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                      <span>{b}</span>
                      <button
                        type="button"
                        className="text-purple-700 hover:text-purple-900"
                        onClick={() => {
                          const arr = [...formData.benefits]; arr.splice(idx, 1);
                          setFormData({ ...formData, benefits: arr });
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      placeholder="Type benefit"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      onClick={() => {
                        const val = benefitInput.trim();
                        if (!val) return;
                        setFormData({ ...formData, benefits: [...(formData.benefits || []), val] });
                        setBenefitInput('');
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {benefitSuggestions.map((s) => (
                      <button
                        type="button"
                        key={s}
                        className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                        onClick={() => setFormData({ ...formData, benefits: Array.from(new Set([...(formData.benefits || []), s])) })}
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Features Tag Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Features (as list)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.keyFeatures || []).map((b, idx) => (
                    <span key={idx} className="inline-flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                      <span>{b}</span>
                      <button
                        type="button"
                        className="text-purple-700 hover:text-purple-900"
                        onClick={() => {
                          const arr = [...formData.keyFeatures]; arr.splice(idx, 1);
                          setFormData({ ...formData, keyFeatures: arr });
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      placeholder="Type key feature"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      onClick={() => {
                        const val = featureInput.trim();
                        if (!val) return;
                        setFormData({ ...formData, keyFeatures: [...(formData.keyFeatures || []), val] });
                        setFeatureInput('');
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {featureSuggestions.map((s) => (
                      <button
                        type="button"
                        key={s}
                        className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                        onClick={() => setFormData({ ...formData, keyFeatures: Array.from(new Set([...(formData.keyFeatures || []), s])) })}
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommended Frequency
                </label>
                <input
                  type="text"
                  value={formData.recommendedFrequency}
                  onChange={(e) => setFormData({ ...formData, recommendedFrequency: e.target.value })}
                  placeholder="e.g., Immediate inspection if cooling efficiency drops..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  {showEditModal ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">Service Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="h-64 overflow-hidden rounded-lg">
                <img
                  src={selectedService.image || '/api/placeholder/800/400'}
                  alt={selectedService.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {selectedService.badge && (
                <span className="inline-block bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full">
                  {selectedService.badge}
                </span>
              )}

              <h3 className="text-3xl font-bold text-gray-900">{selectedService.title}</h3>

              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-purple-600">₹{selectedService.price}</span>
                {selectedService.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">₹{selectedService.originalPrice}</span>
                )}
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{selectedService.description}</p>
              </div>

              {selectedService.process && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Process</h4>
                  {Array.isArray(selectedService.process) ? (
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {selectedService.process.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 whitespace-pre-line">{selectedService.process}</p>
                  )}
                </div>
              )}

              {selectedService.benefits && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Benefits</h4>
                  {Array.isArray(selectedService.benefits) ? (
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {selectedService.benefits.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 whitespace-pre-line">{selectedService.benefits}</p>
                  )}
                </div>
              )}

              {selectedService.keyFeatures && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Key Features</h4>
                  {Array.isArray(selectedService.keyFeatures) ? (
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {selectedService.keyFeatures.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 whitespace-pre-line">{selectedService.keyFeatures}</p>
                  )}
                </div>
              )}

              {selectedService.recommendedFrequency && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Recommended Frequency</h4>
                  <p className="text-gray-600">{selectedService.recommendedFrequency}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManageServices;

