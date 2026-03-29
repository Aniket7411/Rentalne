import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/dummyData';
import { Phone, Mail, MapPin, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Leads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    const response = await apiService.getServiceLeads(user?.id);
    if (response.success) {
      setLeads(response.data);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (leadId, newStatus) => {
    const response = await apiService.updateLeadStatus(leadId, newStatus);
    if (response.success) {
      loadLeads();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Job Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeads = filter === 'all' 
    ? leads 
    : leads.filter(lead => lead.status === filter);

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
        <h1 className="text-3xl font-bold text-text-dark mb-6">Service Leads</h1>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all' 
                  ? 'bg-primary-blue text-white' 
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
              }`}
            >
              All ({leads.length})
            </button>
            <button
              onClick={() => setFilter('New')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'New' 
                  ? 'bg-primary-blue text-white' 
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
              }`}
            >
              New ({leads.filter(l => l.status === 'New').length})
            </button>
            <button
              onClick={() => setFilter('Contacted')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'Contacted' 
                  ? 'bg-primary-blue text-white' 
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
              }`}
            >
              Contacted ({leads.filter(l => l.status === 'Contacted').length})
            </button>
            <button
              onClick={() => setFilter('Job Completed')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'Job Completed' 
                  ? 'bg-primary-blue text-white' 
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
              }`}
            >
              Completed ({leads.filter(l => l.status === 'Job Completed').length})
            </button>
          </div>
        </div>

        {/* Leads List */}
        {filteredLeads.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <p className="text-text-light text-lg">No leads found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-text-dark mb-1">
                          {lead.userName}
                        </h3>
                        <p className="text-text-light">
                          {lead.brand} {lead.model} • {lead.acType}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>

                    <p className="text-text-dark mb-4">{lead.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-text-light">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{lead.address}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-text-light">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${lead.contactNumber}`} className="text-sm hover:text-primary-blue">
                          {lead.contactNumber}
                        </a>
                      </div>
                      <div className="flex items-center space-x-2 text-text-light">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Requested: {lead.createdAt}</span>
                      </div>
                    </div>

                    {lead.images && lead.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {lead.images.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`Issue ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/200x150?text=Image';
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 md:w-48">
                    <label className="text-sm font-medium text-text-dark">Update Status</label>
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Job Completed">Job Completed</option>
                    </select>
                    <a
                      href={`tel:${lead.contactNumber}`}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Now</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;

