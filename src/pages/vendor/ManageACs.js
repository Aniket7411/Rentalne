import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/dummyData';
import { Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ManageACs = () => {
  const { user } = useAuth();
  const [acs, setAcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAC, setEditingAC] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadACs();
  }, []);

  const loadACs = async () => {
    setLoading(true);
    const response = await apiService.getVendorACs(user?.id);
    if (response.success) {
      setAcs(response.data);
    }
    setLoading(false);
  };

  const handleStatusChange = async (acId, newStatus) => {
    const response = await apiService.updateAC(acId, { status: newStatus });
    if (response.success) {
      loadACs();
    }
  };

  const handleEdit = (ac) => {
    setEditingAC(ac.id);
    setEditForm({
      brand: ac.brand,
      model: ac.model,
      capacity: ac.capacity,
      type: ac.type,
      location: ac.location,
      description: ac.description,
      status: ac.status,
      price: {
        monthly: ac.price.monthly,
        quarterly: ac.price.quarterly,
        yearly: ac.price.yearly,
      },
    });
  };

  const handleSaveEdit = async (acId) => {
    const response = await apiService.updateAC(acId, editForm);
    if (response.success) {
      setEditingAC(null);
      loadACs();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text-dark">Manage AC Listings</h1>
          <Link
            to="/vendor/add-ac"
            className="bg-primary-blue text-white px-6 py-2 rounded-lg hover:bg-primary-blue-light transition"
          >
            Add New AC
          </Link>
        </div>

        {acs.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <p className="text-text-light text-lg mb-4">No ACs listed yet.</p>
            <Link
              to="/vendor/add-ac"
              className="text-primary-blue hover:text-primary-blue-light"
            >
              Add your first AC listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acs.map((ac) => (
              <motion.div
                key={ac.id}
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

                  {editingAC === ac.id ? (
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
                          onClick={() => handleSaveEdit(ac.id)}
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
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(ac)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary-blue text-white rounded hover:bg-primary-blue-light transition text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <Link
                        to={`/ac/${ac.id}`}
                        className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <select
                        value={ac.status}
                        onChange={(e) => handleStatusChange(ac.id, e.target.value)}
                        className={`px-2 py-2 rounded text-xs font-semibold border-0 ${getStatusColor(ac.status)}`}
                      >
                        <option value="Available">Available</option>
                        <option value="Rented Out">Rented Out</option>
                        <option value="Under Maintenance">Under Maintenance</option>
                      </select>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageACs;

