import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/dummyData';
import { ShoppingBag, Users, Plus, List, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalACs: 0,
    rentedACs: 0,
    availableACs: 0,
    newLeads: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const [acsRes, leadsRes] = await Promise.all([
      apiService.getVendorACs(user?.id),
      apiService.getServiceLeads(user?.id),
    ]);

    if (acsRes.success) {
      const acs = acsRes.data;
      setStats({
        totalACs: acs.length,
        rentedACs: acs.filter(ac => ac.status === 'Rented Out').length,
        availableACs: acs.filter(ac => ac.status === 'Available').length,
        newLeads: 0,
      });
    }

    if (leadsRes.success) {
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);
      const newLeads = leadsRes.data.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate >= thisWeek && lead.status === 'New';
      });
      setStats(prev => ({ ...prev, newLeads: newLeads.length }));
    }

    setLoading(false);
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
        <h1 className="text-3xl font-bold text-text-dark mb-2">
          Welcome, {user?.name || 'Vendor'}!
        </h1>
        <p className="text-text-light mb-8">Manage your AC rentals and service leads</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-light text-sm">Total Listed ACs</p>
                <p className="text-3xl font-bold text-text-dark mt-2">{stats.totalACs}</p>
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
                <p className="text-text-light text-sm">Currently Rented</p>
                <p className="text-3xl font-bold text-text-dark mt-2">{stats.rentedACs}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500" />
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
                <p className="text-text-light text-sm">Available</p>
                <p className="text-3xl font-bold text-text-dark mt-2">{stats.availableACs}</p>
              </div>
              <ShoppingBag className="w-12 h-12 text-blue-500" />
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
                <p className="text-text-light text-sm">New Leads (This Week)</p>
                <p className="text-3xl font-bold text-text-dark mt-2">{stats.newLeads}</p>
              </div>
              <Users className="w-12 h-12 text-yellow-500" />
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-text-dark mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/vendor/add-ac"
              className="flex items-center space-x-3 p-4 border-2 border-dashed border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition group"
            >
              <Plus className="w-6 h-6 text-primary-blue group-hover:text-white" />
              <div>
                <p className="font-semibold">Add New AC</p>
                <p className="text-sm text-text-light group-hover:text-white">List a new AC for rental</p>
              </div>
            </Link>

            <Link
              to="/vendor/manage-acs"
              className="flex items-center space-x-3 p-4 border-2 border-dashed border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition group"
            >
              <List className="w-6 h-6 text-primary-blue group-hover:text-white" />
              <div>
                <p className="font-semibold">Manage ACs</p>
                <p className="text-sm text-text-light group-hover:text-white">View and edit your listings</p>
              </div>
            </Link>

            <Link
              to="/vendor/leads"
              className="flex items-center space-x-3 p-4 border-2 border-dashed border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition group"
            >
              <Users className="w-6 h-6 text-primary-blue group-hover:text-white" />
              <div>
                <p className="font-semibold">View All Leads</p>
                <p className="text-sm text-text-light group-hover:text-white">Manage service requests</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-text-dark mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-background-light rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-text-dark">New service lead received</p>
                <p className="text-sm text-text-light">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-background-light rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-text-dark">AC rental inquiry received</p>
                <p className="text-sm text-text-light">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-background-light rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-text-dark">AC status updated</p>
                <p className="text-sm text-text-light">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;

