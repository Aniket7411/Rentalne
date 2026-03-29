import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { 
  ShoppingBag, Wrench, Clock, CheckCircle, XCircle, 
  Edit2, Save, X, MapPin, Phone, Heart, Star, 
  AlertCircle, MessageSquare, Package, User as UserIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPhoneNumber, getFormattedPhone, validatePhoneNumber } from '../../utils/phoneFormatter';
import { defaultBrowsePath } from '../../utils/browseUrls';

/** Map API order shape to UI rows previously built for "rentals". */
const normalizeOrderRow = (o) => {
  const items = o.items || [];
  const rentalItems = items.filter((i) => i.type === 'rental');
  const first = rentalItems[0] || items[0];
  const pop = first?.productId;
  const product = typeof pop === 'object' && pop ? pop : null;
  const title =
    product?.name ||
    (product ? `${product.brand || ''} ${product.model || ''}`.trim() : null) ||
    `Order ${o.orderId || o._id || ''}`.trim() ||
    'Order';
  const created = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '';
  const durationVal = first?.duration;
  return {
    id: o.orderId || o._id,
    _id: o._id,
    orderId: o.orderId,
    status: o.status,
    paymentStatus: o.paymentStatus,
    finalTotal: o.finalTotal,
    vendorName: '',
    productDetails: { name: title },
    acDetails: product ? { brand: product.brand, model: product.model } : null,
    startDate: created,
    duration: durationVal != null ? `${durationVal} mo` : '',
  };
};

const UserDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    alternatePhone: user?.alternatePhone || '',
    address: user?.address || '',
  });

  // Dashboard data
  const [rentals, setRentals] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [issues, setIssues] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Request concern modal
  const [showConcernModal, setShowConcernModal] = useState(false);
  const [concernData, setConcernData] = useState({
    subject: '',
    message: '',
    type: 'general',
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    const uid = user?.id || user?._id;
    if (!uid) return;

    setLoading(true);
    try {
      const profileRes = await apiService.getUserProfile();
      if (profileRes.success) {
        const profile = profileRes.data;
        const addr = profile.address || {};
        setProfileData({
          name: profile.name || user?.name || '',
          email: profile.email || user?.email || '',
          phone: profile.phone || user?.phone || '',
          alternatePhone: profile.alternateNumber || profile.alternatePhone || '',
          address: profile.homeAddress || addr.homeAddress || '',
        });
      }

      const rentalsRes = await apiService.getUserOrders(uid, { limit: 50 });
      if (rentalsRes.success) {
        const raw = rentalsRes.data || [];
        setRentals(raw.map(normalizeOrderRow));
      }

      const servicesRes = await apiService.getUserServiceRequests();
      if (servicesRes.success) setServiceRequests(servicesRes.data || []);

      const wishlistRes = await apiService.getUserWishlist();
      if (wishlistRes.success) {
        const raw = wishlistRes.data || [];
        setWishlist(
          raw.map((w) => {
            const pid = w.productId?._id || w.productId;
            const p = w.product || {};
            const priceObj = p.price && typeof p.price === 'object' ? p.price : {};
            const amounts = Object.values(priceObj).filter((v) => typeof v === 'number');
            const minP = amounts.length ? Math.min(...amounts) : null;
            return {
              id: w._id,
              productId: pid,
              name: p.name || `${p.brand || ''} ${p.model || ''}`.trim() || 'Product',
              price: minP != null ? `From ₹${minP}` : '',
              image: (p.images && p.images[0]) || '/placeholder-product.png',
            };
          })
        );
      }

      const issuesRes = await apiService.getUserIssues();
      if (issuesRes.success) {
        const raw = issuesRes.data || [];
        setIssues(
          raw.map((t) => ({
            id: t._id || t.id,
            subject: t.subject,
            message: t.description || t.message,
            status: t.status,
            createdAt: t.createdAt ? new Date(t.createdAt).toLocaleString() : '',
          }))
        );
      }

      const reviewsRes = await apiService.getUserReviews();
      if (reviewsRes.success) setReviews(reviewsRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const digits = (p) => String(p || '').replace(/\D/g, '').slice(-10);
      const response = await apiService.updateUserProfile({
        name: profileData.name,
        phone: profileData.phone ? digits(profileData.phone) : undefined,
        homeAddress: profileData.address,
        alternateNumber: profileData.alternatePhone ? digits(profileData.alternatePhone) : undefined,
      });
      if (response.success) {
        setEditingProfile(false);
        setEditingAddress(false);
        // Update user in context if needed
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleConcernSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.submitUserConcern(concernData);
      if (response.success) {
        setShowConcernModal(false);
        setConcernData({ subject: '', message: '', type: 'general' });
        loadData(); // Reload to show new issue
      }
    } catch (error) {
      console.error('Error submitting concern:', error);
    }
  };

  const getStatusColor = (status) => {
    const s = String(status || '').toLowerCase();
    if (['active', 'completed', 'delivered', 'installed', 'resolved'].includes(s)) {
      return 'text-green-600 bg-green-100';
    }
    if (['pending', 'processing', 'confirmed', 'shipped', 'new', 'open', 'in progress'].includes(s)) {
      return 'text-yellow-600 bg-yellow-100';
    }
    if (['cancelled', 'rejected', 'failed'].includes(s)) {
      return 'text-red-600 bg-red-100';
    }
    return 'text-gray-600 bg-gray-100';
  };

  const activeRentals = rentals.filter((r) => {
    const s = String(r.status || '').toLowerCase();
    return s && !['cancelled', 'completed'].includes(s);
  }).length;
  const pendingServices = serviceRequests.filter(s => s.status === 'Pending').length;
  const totalIssues = issues.length;

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-dark mb-2">
              Welcome back, {profileData.name || user?.name || 'User'}!
            </h1>
            <p className="text-text-light">Manage your account and track your orders</p>
          </div>
          <button
            onClick={() => setShowConcernModal(true)}
            className="mt-4 md:mt-0 flex items-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Raise Concern</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          {['overview', 'profile', 'orders', 'wishlist', 'issues', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary-blue border-b-2 border-primary-blue'
                  : 'text-text-light hover:text-text-dark'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-light text-sm">Active Rentals</p>
                    <p className="text-3xl font-bold text-text-dark mt-2">{activeRentals}</p>
                  </div>
                  <ShoppingBag className="w-12 h-12 text-primary-blue" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-light text-sm">Pending Services</p>
                    <p className="text-3xl font-bold text-text-dark mt-2">{pendingServices}</p>
                  </div>
                  <Wrench className="w-12 h-12 text-primary-blue" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-light text-sm">Issues Raised</p>
                    <p className="text-3xl font-bold text-text-dark mt-2">{totalIssues}</p>
                  </div>
                  <AlertCircle className="w-12 h-12 text-primary-blue" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-light text-sm">Wishlist Items</p>
                    <p className="text-3xl font-bold text-text-dark mt-2">{wishlist.length}</p>
                  </div>
                  <Heart className="w-12 h-12 text-primary-blue" />
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-semibold text-text-dark mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Link
                  to={defaultBrowsePath()}
                  className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
                >
                  Browse Products
                </Link>
                <Link
                  to="/service-request"
                  className="px-6 py-2 bg-primary-blue-light text-white rounded-lg hover:bg-primary-blue transition"
                >
                  Request Service
                </Link>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-text-dark mb-4">Recent Orders</h2>
              {rentals.length > 0 ? (
                <div className="space-y-4">
                  {rentals.slice(0, 5).map((rental) => {
                    const orderKey = rental.orderId || rental.id;
                    return (
                    <Link
                      key={rental.id}
                      to={`/orders/${encodeURIComponent(orderKey)}`}
                      className="block border-b pb-4 last:border-0 hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-text-dark">
                            {rental.productDetails?.name || `${rental.acDetails?.brand} ${rental.acDetails?.model}`}
                          </p>
                          <p className="text-sm text-text-light">{rental.vendorName}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(rental.status)}`}>
                          {rental.status}
                        </span>
                      </div>
                      <p className="text-sm text-text-light">
                        {rental.orderId ? `Order ${rental.orderId}` : ''}
                        {rental.startDate ? ` • Placed: ${rental.startDate}` : ''}
                        {rental.duration ? ` • Duration: ${rental.duration}` : ''}
                        {rental.finalTotal != null ? ` • ₹${rental.finalTotal}` : ''}
                      </p>
                      <p className="text-xs text-primary-blue font-medium mt-2">View order →</p>
                    </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-text-light">No orders yet. <Link to={defaultBrowsePath()} className="text-primary-blue">Browse Products</Link></p>
              )}
            </div>
          </>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-text-dark">Profile Information</h2>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-primary-blue hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Name</label>
                {editingProfile ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                ) : (
                  <p className="text-text-dark">{profileData.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Email</label>
                <p className="text-text-dark">{profileData.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Phone Number</label>
                {editingProfile ? (
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light text-sm font-medium">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setProfileData({ ...profileData, phone: formatted });
                      }}
                      maxLength={15}
                      className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                  </div>
                ) : (
                  <p className="text-text-dark">{profileData.phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Alternate Mobile Number</label>
                {editingProfile ? (
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light text-sm font-medium">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={profileData.alternatePhone}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setProfileData({ ...profileData, alternatePhone: formatted });
                      }}
                      maxLength={15}
                      className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                  </div>
                ) : (
                  <p className="text-text-dark">{profileData.alternatePhone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-text-dark">Address</label>
                  {!editingAddress && editingProfile && (
                    <button
                      onClick={() => setEditingAddress(true)}
                      className="text-sm text-primary-blue hover:text-primary-blue-light"
                    >
                      Edit Address
                    </button>
                  )}
                </div>
                {editingAddress || editingProfile ? (
                  <textarea
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    placeholder="Enter your complete address"
                  />
                ) : (
                  <p className="text-text-dark">{profileData.address || 'No address provided'}</p>
                )}
              </div>

              {editingProfile && (
                <div className="flex space-x-4">
                  <button
                    onClick={handleProfileUpdate}
                    className="flex items-center space-x-2 px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingProfile(false);
                      setEditingAddress(false);
                      // Reset to original data
                      loadData();
                    }}
                    className="flex items-center space-x-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-text-dark mb-4">Order History</h2>
            {rentals.length > 0 ? (
              <div className="space-y-4">
                {rentals.map((rental) => {
                  const orderKey = rental.orderId || rental.id;
                  return (
                  <div key={rental.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2 gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-dark">
                          {rental.productDetails?.name || `${rental.acDetails?.brand} ${rental.acDetails?.model}`}
                        </p>
                        <p className="text-sm text-text-light">{rental.vendorName}</p>
                        <p className="text-sm text-text-light mt-1">
                          {rental.orderId ? `Order ${rental.orderId}` : ''}
                          {rental.startDate ? ` • Placed: ${rental.startDate}` : ''}
                          {rental.duration ? ` • Duration: ${rental.duration}` : ''}
                          {rental.finalTotal != null ? ` • ₹${rental.finalTotal}` : ''}
                        </p>
                        <Link
                          to={`/orders/${encodeURIComponent(orderKey)}`}
                          className="text-sm text-primary-blue hover:text-primary-blue-light font-medium mt-2 inline-block"
                        >
                          View order details
                        </Link>
                      </div>
                      <span className={`flex-shrink-0 px-2 py-1 rounded text-xs font-semibold ${getStatusColor(rental.status)}`}>
                        {rental.status}
                      </span>
                    </div>
                    {String(rental.status || '').toLowerCase() === 'completed' && (
                      <Link
                        to={`/review/${rental.id}`}
                        className="text-sm text-primary-blue hover:text-primary-blue-light"
                      >
                        Write a Review
                      </Link>
                    )}
                  </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-text-light">No orders yet. <Link to={defaultBrowsePath()} className="text-primary-blue">Browse Products</Link></p>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-text-dark mb-4">My Wishlist</h2>
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <img
                      src={item.image || '/placeholder-product.png'}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg mb-2"
                    />
                    <h3 className="font-semibold text-text-dark">{item.name}</h3>
                    <p className="text-sm text-text-light">{item.price}</p>
                    <div className="flex space-x-2 mt-2">
                      <Link
                        to={`/product/${item.productId}`}
                        className="flex-1 text-center px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition text-sm"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          const pid = item.productId || item.id;
                          if (pid) {
                            await apiService.removeFromWishlist(pid);
                            loadData();
                          }
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        <Heart className="w-4 h-4 text-red-500 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-light">Your wishlist is empty. <Link to={defaultBrowsePath()} className="text-primary-blue">Browse Products</Link></p>
            )}
          </div>
        )}

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-text-dark mb-4">Issues & Concerns</h2>
            {issues.length > 0 ? (
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div key={issue.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-text-dark">{issue.subject}</p>
                        <p className="text-sm text-text-light mt-1">{issue.message}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-light">Raised on: {issue.createdAt}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-light">No issues raised yet.</p>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-text-dark mb-4">My Reviews</h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-text-dark">{review.productName}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-text-light mt-2">{review.comment}</p>
                      </div>
                      <span className="text-xs text-text-light">{review.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-light">No reviews yet. <Link to="/orders" className="text-primary-blue">Review your orders</Link></p>
            )}
          </div>
        )}
      </div>

      {/* Request Concern Modal */}
      {showConcernModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-dark">Raise a Concern</h2>
              <button
                onClick={() => setShowConcernModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConcernSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Type</label>
                <select
                  value={concernData.type}
                  onChange={(e) => setConcernData({ ...concernData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="general">General</option>
                  <option value="order">Order Related</option>
                  <option value="service">Service Related</option>
                  <option value="payment">Payment Related</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Subject</label>
                <input
                  type="text"
                  value={concernData.subject}
                  onChange={(e) => setConcernData({ ...concernData, subject: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Message</label>
                <textarea
                  value={concernData.message}
                  onChange={(e) => setConcernData({ ...concernData, message: e.target.value })}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowConcernModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
