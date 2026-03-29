import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Edit, Eye, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';

const ManageACs = () => {
  const [acs, setAcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingAC, setEditingAC] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingAC, setDeletingAC] = useState(null);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadACs();
  }, []);

  const loadACs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getAdminACs();
      if (response.success) {
        setAcs(response.data || []);
      } else {
        setError(response.message || 'Failed to load ACs');
      }
    } catch (err) {
      setError('An error occurred while loading ACs');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (acId, newStatus) => {
    // Find the AC to preserve its images
    const ac = acs.find(a => (a._id || a.id) === acId);
    if (!ac) return;

    setUpdatingStatus(acId);
    try {
      // Only update status, don't send images (backend should preserve them)
      const response = await apiService.updateAC(acId, {
        status: newStatus,
        // Don't send images array - backend should preserve existing images
      });
      if (response.success) {
        success('Status updated successfully');
        loadACs();
      } else {
        showError(response.message || 'Failed to update status');
      }
    } catch (err) {
      showError('An error occurred while updating status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleEdit = (ac) => {
    const acId = ac._id || ac.id;
    setEditingAC(acId);
    setEditForm({
      brand: ac.brand,
      model: ac.model,
      capacity: ac.capacity,
      type: ac.type,
      location: ac.location,
      description: ac.description,
      status: ac.status,
      price: {
        monthly: ac.price?.monthly,
        quarterly: ac.price?.quarterly,
        yearly: ac.price?.yearly,
      },
    });
  };

  const handleSaveEdit = async (acId) => {
    // Find the AC to preserve its images
    const ac = acs.find(a => (a._id || a.id) === acId);
    if (!ac) return;

    setUpdatingStatus(acId);
    try {
      // Preserve existing images when editing - send them as URLs (strings) to preserve them
      const response = await apiService.updateAC(acId, {
        ...editForm,
        images: ac.images || [], // Send existing image URLs to preserve them
      });
      if (response.success) {
        success('AC updated successfully');
        setEditingAC(null);
        loadACs();
      } else {
        showError(response.message || 'Failed to update AC');
      }
    } catch (err) {
      showError('An error occurred while updating AC');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (acId) => {
    if (!window.confirm('Are you sure you want to delete this AC listing? This action cannot be undone.')) {
      return;
    }

    setDeletingAC(acId);
    try {
      const response = await apiService.deleteAC(acId);
      if (response.success) {
        success('AC deleted successfully');
        loadACs();
      } else {
        showError(response.message || 'Failed to delete AC');
      }
    } catch (err) {
      showError('An error occurred while deleting AC');
    } finally {
      setDeletingAC(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Rented Out':
        return 'bg-red-100 text-red-800';
      case 'Under Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text-dark">Manage AC Listings</h1>
          <Link
            to="/admin/add-ac"
            className="bg-primary-blue text-white px-6 py-2 rounded-lg hover:bg-primary-blue-light transition"
          >
            Add New AC
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2 mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {acs.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <p className="text-text-light text-lg mb-4">No ACs listed yet.</p>
            <Link
              to="/admin/add-ac"
              className="text-primary-blue hover:text-primary-blue-light"
            >
              Add your first AC listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acs.map((ac) => {
              const acId = ac._id || ac.id;
              return (
                <motion.div
                  key={acId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  {ac.images && ac.images.length > 0 && (
                    <img
                      src={ac.images[0]}
                      alt={`${ac.brand} ${ac.model}`}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=AC+Image';
                      }}
                    />
                  )}

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-text-dark">
                          {ac.brand} {ac.model}
                        </h3>
                        <p className="text-sm text-text-light">{ac.capacity} • {ac.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(ac.status)}`}>
                        {ac.status}
                      </span>
                    </div>

                    <p className="text-sm text-text-light mb-2">{ac.location}</p>
                    <p className="text-lg font-bold text-primary-blue mb-4">
                      ₹{ac.price?.monthly?.toLocaleString()}/month
                    </p>

                    {editingAC === acId ? (
                      <div className="space-y-3 border-t pt-4">
                        <div>
                          <label className="block text-xs text-text-dark mb-1">Status</label>
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="Available">Available</option>
                            <option value="Rented Out">Rented Out</option>
                            <option value="Under Maintenance">Under Maintenance</option>
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveEdit(acId)}
                            className="flex-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingAC(null)}
                            className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(ac)}
                            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary-blue text-white rounded hover:bg-primary-blue-light transition text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <Link
                            to={`/ac/${acId}`}
                            className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(acId)}
                            disabled={deletingAC === acId}
                            className="flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingAC === acId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <select
                          value={ac.status}
                          onChange={(e) => handleStatusChange(acId, e.target.value)}
                          disabled={updatingStatus === acId}
                          className={`w-full px-2 py-2 rounded text-xs font-semibold border-0 ${getStatusColor(ac.status)} disabled:opacity-50`}
                        >
                          <option value="Available">Available</option>
                          <option value="Rented Out">Rented Out</option>
                          <option value="Under Maintenance">Under Maintenance</option>
                        </select>
                        {updatingStatus === acId && (
                          <div className="flex items-center justify-center space-x-1 text-xs text-text-light">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Updating...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageACs;

