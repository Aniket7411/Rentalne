import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Phone, MapPin, Calendar, AlertCircle, ShoppingBag, Wrench, Store, Loader2, CheckCircle, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';

const Leads = () => {
  const [activeTab, setActiveTab] = useState('service'); // 'service', 'rental', 'vendor'
  const [serviceLeads, setServiceLeads] = useState([]);
  const [rentalInquiries, setRentalInquiries] = useState([]);
  const [vendorRequests, setVendorRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const { toasts, removeToast, success, error: showError } = useToast();

  // Load all data when component mounts
  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [serviceRes, rentalRes, vendorRes] = await Promise.all([
        apiService.getServiceLeads(),
        apiService.getRentalInquiries(),
        apiService.getVendorRequests().catch(() => ({ success: false, data: [] })), // Optional endpoint
      ]);

      if (serviceRes.success) {
        setServiceLeads(serviceRes.data || []);
      } else {
        showError(serviceRes.message || 'Failed to load service leads');
      }

      if (rentalRes.success) {
        setRentalInquiries(rentalRes.data || []);
      } else {
        showError(rentalRes.message || 'Failed to load rental inquiries');
      }

      if (vendorRes.success) {
        setVendorRequests(vendorRes.data || []);
      }
      // Vendor requests endpoint is optional, so we don't show error if it fails
    } catch (err) {
      showError('An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceStatusUpdate = async (leadId, newStatus) => {
    setUpdatingStatus(leadId);
    try {
      const response = await apiService.updateLeadStatus(leadId, newStatus);
      if (response.success) {
        success('Status updated successfully');
        loadAllData();
      } else {
        showError(response.message || 'Failed to update status');
      }
    } catch (err) {
      showError('An error occurred while updating status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleInquiryStatusUpdate = async (inquiryId, newStatus) => {
    setUpdatingStatus(inquiryId);
    try {
      const response = await apiService.updateInquiryStatus(inquiryId, newStatus);
      if (response.success) {
        success('Status updated successfully');
        loadAllData();
      } else {
        showError(response.message || 'Failed to update status');
      }
    } catch (err) {
      showError('An error occurred while updating status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getServiceStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'In-Progress':
        return 'bg-purple-100 text-purple-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInquiryStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-blue-100 text-blue-800';
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getFilteredServiceLeads = () => {
    if (filter === 'all') return serviceLeads;
    return serviceLeads.filter(lead => lead.status === filter);
  };

  const getFilteredRentalInquiries = () => {
    if (filter === 'all') return rentalInquiries;
    return rentalInquiries.filter(inquiry => inquiry.status === filter);
  };

  const downloadAsCsv = (rows, sheetName) => {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);
    const escape = (value) =>
      `"${String(value ?? '')
        .replace(/"/g, '""')
        .replace(/\n/g, ' ')
        .trim()}"`;

    const csvLines = [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
    ];

    const blob = new Blob([csvLines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sheetName}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    let data = [];
    let sheetName = '';

    if (activeTab === 'service') {
      const leads = getFilteredServiceLeads();
      sheetName = 'Service_Leads';
      data = leads.map((lead, idx) => ({
        SNo: idx + 1,
        Name: lead.name || 'Anonymous',
        Phone: lead.phone || lead.contactNumber || '',
        Service: (lead.serviceId && (lead.serviceId.title || lead.serviceId.name)) || lead.serviceTitle || '',
        PreferredDate: lead.preferredDate || '',
        PreferredTime: lead.preferredTime || '',
        Address: lead.address || '',
        Status: lead.status || '',
        CreatedAt: formatDate(lead.createdAt),
      }));
    } else if (activeTab === 'rental') {
      const inquiries = getFilteredRentalInquiries();
      sheetName = 'Rental_Inquiries';
      data = inquiries.map((inq, idx) => ({
        SNo: idx + 1,
        Name: inq.name || '',
        Phone: inq.phone || '',
        ProductType: inq.productType || 'ac',
        Brand: (inq.productDetails || inq.acDetails)?.brand || '',
        Model: (inq.productDetails || inq.acDetails)?.model || '',
        Capacity: (inq.productDetails || inq.acDetails)?.capacity || '',
        Message: inq.message || '',
        Status: inq.status || '',
        CreatedAt: formatDate(inq.createdAt),
      }));
    } else if (activeTab === 'vendor') {
      const vendors = vendorRequests;
      sheetName = 'Vendor_Requests';
      data = vendors.map((req, idx) => ({
        SNo: idx + 1,
        Name: req.name || '',
        Phone: req.phone || '',
        Email: req.email || '',
        Message: req.message || '',
        CreatedAt: formatDate(req.createdAt),
      }));
    }

    if (!data.length) {
      showError('No records to export for the selected tab.');
      return;
    }

    // Export as CSV which opens cleanly in Excel
    downloadAsCsv(data, sheetName);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-blue mx-auto mb-4" />
          <p className="text-text-light">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold text-text-dark">All Leads & Requests</h1>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center w-auto bg-green-500 text-[#fff] justify-center px-3 py-1 text-sm font-medium rounded-lg border border-gray-300  hover:bg-gray-50 hover:text-[#000]"
          >
            Download Excel
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2 mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setActiveTab('service'); setFilter('all'); }}
              className={`w-auto px-4 py-2 rounded-lg transition flex items-center space-x-2 ${activeTab === 'service'
                ? 'bg-primary-blue text-white'
                : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Service Requests ({serviceLeads.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('rental'); setFilter('all'); }}
              className={`w-auto px-4 py-2 rounded-lg transition flex items-center space-x-2 ${activeTab === 'rental'
                ? 'bg-primary-blue text-white'
                : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Rental Inquiries ({rentalInquiries.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('vendor'); setFilter('all'); }}
              className={`w-auto px-4 py-2 rounded-lg transition flex items-center space-x-2 ${activeTab === 'vendor'
                ? 'bg-primary-blue text-white'
                : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                }`}
            >
              <Store className="w-4 h-4" />
              <span>Vendor Requests ({vendorRequests.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        {activeTab === 'service' && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`w-auto px-3 py-1 rounded-lg transition ${filter === 'all'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                All ({serviceLeads.length})
              </button>
              <button
                onClick={() => setFilter('New')}
                className={`w-auto px-3 py-1 rounded-lg transition ${filter === 'New'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                New ({serviceLeads.filter(l => l.status === 'New').length})
              </button>
              <button
                onClick={() => setFilter('Contacted')}
                className={`w-auto px-3 py-1 rounded-lg transition ${filter === 'Contacted'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                Contacted ({serviceLeads.filter(l => l.status === 'Contacted').length})
              </button>
              <button
                onClick={() => setFilter('In-Progress')}
                className={`w-auto px-3 py-1 rounded-lg transition ${filter === 'In-Progress'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                In-Progress ({serviceLeads.filter(l => l.status === 'In-Progress').length})
              </button>
              <button
                onClick={() => setFilter('Resolved')}
                className={`w-auto px-3 py-1 rounded-lg transition ${filter === 'Resolved'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                Resolved ({serviceLeads.filter(l => l.status === 'Resolved').length})
              </button>
              <button
                onClick={() => setFilter('Rejected')}
                className={`w-auto px-3 py-1 rounded-lg transition ${filter === 'Rejected'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                Rejected ({serviceLeads.filter(l => l.status === 'Rejected').length})
              </button>
            </div>
          </div>
        )}

        {activeTab === 'rental' && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`w-auto px-3 py-1 rounded-lg transition ${filter === 'all'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                All ({rentalInquiries.length})
              </button>
              <button
                onClick={() => setFilter('Pending')}
                className={`w-auto px-3 py-1 rounded-lg transition ${filter === 'Pending'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                Pending ({rentalInquiries.filter(i => i.status === 'Pending').length})
              </button>
              <button
                onClick={() => setFilter('Contacted')}
                className={`w-auto px-3 py-1 rounded-lg transition ${filter === 'Contacted'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                Contacted ({rentalInquiries.filter(i => i.status === 'Contacted').length})
              </button>
              <button
                onClick={() => setFilter('Completed')}
                className={`w-auto px-3 py-1 rounded-lg transition ${filter === 'Completed'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                  }`}
              >
                Completed ({rentalInquiries.filter(i => i.status === 'Completed').length})
              </button>
            </div>
          </div>
        )}

        {/* Service Leads List */}
        {activeTab === 'service' && (
          <>
            {getFilteredServiceLeads().length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow-md text-center">
                <Wrench className="w-16 h-16 text-text-light mx-auto mb-4" />
                <p className="text-text-light text-lg">No service requests found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredServiceLeads().map((lead) => {
                  const leadId = lead._id || lead.id;
                  const serviceTitle = (lead.serviceId && (lead.serviceId.title || lead.serviceId.name)) || lead.serviceTitle || 'Service';
                  const phone = lead.phone || lead.contactNumber || '';
                  const scheduledDate = lead.preferredDate || '';
                  const scheduledTime = lead.preferredTime || '';
                  return (
                    <motion.div
                      key={leadId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg shadow-md p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-text-dark mb-1">
                                {lead.name || 'Anonymous'}
                              </h3>
                              <p className="text-text-light">
                                {serviceTitle}
                              </p>
                              <p className="text-xs text-text-light mt-1">
                                Created: {formatDate(lead.createdAt)}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getServiceStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                          </div>

                          {lead.description && <p className="text-text-dark mb-4">{lead.description}</p>}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-text-light">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">{lead.address}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-text-light">
                              <Phone className="w-4 h-4" />
                              <a href={`tel:${phone}`} className="text-sm hover:text-primary-blue">
                                {phone || 'N/A'}
                              </a>
                            </div>
                            <div className="flex items-center space-x-2 text-text-light">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">
                                {scheduledDate || scheduledTime ? `${scheduledDate} ${scheduledTime}`.trim() : 'Not scheduled'}
                              </span>
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
                            onChange={(e) => handleServiceStatusUpdate(leadId, e.target.value)}
                            disabled={updatingStatus === leadId}
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue disabled:opacity-50"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="In-Progress">In-Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          {updatingStatus === leadId && (
                            <div className="flex items-center justify-center space-x-2 text-sm text-text-light">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Updating...</span>
                            </div>
                          )}
                          <a
                            href={`tel:${phone}`}
                            className="flex items-center justify-center space-x-2 px-3 py-1 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Call Now</span>
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Rental Inquiries List */}
        {activeTab === 'rental' && (
          <>
            {getFilteredRentalInquiries().length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow-md text-center">
                <ShoppingBag className="w-16 h-16 text-text-light mx-auto mb-4" />
                <p className="text-text-light text-lg">No rental inquiries found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredRentalInquiries().map((inquiry) => {
                  const inquiryId = inquiry._id || inquiry.id;
                  const productDetails = inquiry.productDetails || inquiry.acDetails || {};
                  const productType = inquiry.productType || 'ac';
                  const productId = inquiry.productId || inquiry.acId;

                  const getProductRoute = () => {
                    if (!productId) return null;
                    if (productType === 'washing-machine') return `/washing-machine/${productId}`;
                    if (productType === 'refrigerator') return `/refrigerator/${productId}`;
                    return `/ac/${productId}`;
                  };

                  const getProductDisplayName = () => {
                    if (productType === 'washing-machine') {
                      return `${productDetails.brand || ''} ${productDetails.capacity || ''} ${productDetails.type || ''}`.trim();
                    } else if (productType === 'refrigerator') {
                      return `${productDetails.brand || ''} ${productDetails.capacity || ''}`.trim();
                    } else {
                      return `${productDetails.brand || ''} ${productDetails.model || ''}`.trim();
                    }
                  };

                  const productTypeName = productType === 'washing-machine' ? 'Washing Machine' :
                    productType === 'refrigerator' ? 'Refrigerator' : 'AC';

                  return (
                    <motion.div
                      key={inquiryId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg shadow-md p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-text-dark mb-1">
                                {inquiry.name}
                              </h3>
                              <p className="text-text-light mb-2">
                                Interested in: <span className="font-semibold">{getProductDisplayName() || 'Product'}</span>
                                {productTypeName && <span className="text-xs ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">{productTypeName}</span>}
                              </p>
                              {productId && getProductRoute() && (
                                <Link
                                  to={getProductRoute()}
                                  className="text-primary-blue hover:text-primary-blue-light text-sm"
                                >
                                  View {productTypeName} Details →
                                </Link>
                              )}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getInquiryStatusColor(inquiry.status)}`}>
                              {inquiry.status}
                            </span>
                          </div>

                          {inquiry.message && (
                            <p className="text-text-dark mb-4">{inquiry.message}</p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-text-light">
                              <Phone className="w-4 h-4" />
                              <a href={`tel:${inquiry.phone}`} className="text-sm hover:text-primary-blue">
                                {inquiry.phone}
                              </a>
                            </div>
                            <div className="flex items-center space-x-2 text-text-light">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">{formatDate(inquiry.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 md:w-48">
                          <label className="text-sm font-medium text-text-dark">Update Status</label>
                          <select
                            value={inquiry.status}
                            onChange={(e) => handleInquiryStatusUpdate(inquiryId, e.target.value)}
                            disabled={updatingStatus === inquiryId}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue disabled:opacity-50"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          {updatingStatus === inquiryId && (
                            <div className="flex items-center justify-center space-x-2 text-sm text-text-light">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Updating...</span>
                            </div>
                          )}
                          <a
                            href={`tel:${inquiry.phone}`}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Call Now</span>
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Vendor Requests List */}
        {activeTab === 'vendor' && (
          <>
            {vendorRequests.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow-md text-center">
                <Store className="w-16 h-16 text-text-light mx-auto mb-4" />
                <p className="text-text-light text-lg">No vendor requests found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vendorRequests.map((request) => {
                  const requestId = request._id || request.id;
                  return (
                    <motion.div
                      key={requestId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg shadow-md p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-text-dark mb-1">
                                {request.name}
                              </h3>
                              <p className="text-text-light">{request.email}</p>
                            </div>
                            <span className="px-3 py-1 rounded-md  text-sm font-semibold bg-blue-100 text-blue-800">
                              Vendor Request
                            </span>
                          </div>

                          <p className="text-text-dark mb-4">{request.message}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2 text-text-light">
                              <Phone className="w-4 h-4" />
                              <a href={`tel:${request.phone}`} className="text-sm hover:text-primary-blue">
                                {request.phone}
                              </a>
                            </div>
                            <div className="flex items-center space-x-2 text-text-light">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">{formatDate(request.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 md:w-48">
                          {/* <a
                            href={`mailto:${request.email}`}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
                          >
                            <Mail className="w-4 h-4" />
                            <span>Email Vendor</span>
                          </a> */}
                          <a
                            href={`tel:${request.phone}`}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Call Vendor</span>
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Leads;
