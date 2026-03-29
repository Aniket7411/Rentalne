import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import {
  ShoppingBag,
  Users,
  Plus,
  List,
  TrendingUp,
  AlertCircle,
  Package,
  Settings,
  Tag,
  HelpCircle,
  MessageSquare,
  Wrench,
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalACs: 0,
        rentedACs: 0,
        availableACs: 0,
        newLeads: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        setError('');

        try {
            const [acsRes, serviceRes, rentalRes] = await Promise.all([
                apiService.getAdminACs(),
                apiService.getServiceLeads(),
                apiService.getRentalInquiries(),
            ]);

            if (acsRes.success) {
                const acs = acsRes.data || [];
                setStats({
                    totalACs: acs.length,
                    rentedACs: acs.filter(ac => ac.status === 'Rented Out').length,
                    availableACs: acs.filter(ac => ac.status === 'Available').length,
                    newLeads: 0,
                });
            } else {
                setError(acsRes.message || 'Failed to load ACs');
            }

            if (serviceRes.success && rentalRes.success) {
                const thisWeek = new Date();
                thisWeek.setDate(thisWeek.getDate() - 7);
                const serviceLeads = serviceRes.data || [];
                const rentalInquiries = rentalRes.data || [];

                const newServiceLeads = serviceLeads.filter(lead => {
                    const leadDate = new Date(lead.createdAt);
                    return leadDate >= thisWeek && lead.status === 'New';
                });

                const newRentalInquiries = rentalInquiries.filter(inquiry => {
                    const inquiryDate = new Date(inquiry.createdAt);
                    return inquiryDate >= thisWeek && inquiry.status === 'Pending';
                });

                setStats(prev => ({
                    ...prev,
                    newLeads: newServiceLeads.length + newRentalInquiries.length
                }));
            }
        } catch (err) {
            setError('An error occurred while loading data');
        } finally {
            setLoading(false);
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
                <h1 className="text-3xl font-bold text-text-dark mb-2">
                    Welcome, {user?.name || 'Admin'}!
                </h1>
                <p className="text-text-light mb-8">Manage your products, rentals and service leads</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link
                            to="/admin/add-ac"
                            className="flex items-center space-x-3 p-4 border-2 border-dashed border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition group"
                        >
                            <Plus className="w-6 h-6 text-primary-blue group-hover:text-white" />
                            <div>
                                <p className="font-semibold">Add New AC</p>
                                <p className="text-sm text-text-light group-hover:text-white">List a new AC for rental</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/add-washing-machine"
                            className="flex items-center space-x-3 p-4 border-2 border-dashed border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition group"
                        >
                            <Plus className="w-6 h-6 text-primary-blue group-hover:text-white" />
                            <div>
                                <p className="font-semibold">Add Washing Machine</p>
                                <p className="text-sm text-text-light group-hover:text-white">List a new washing machine</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/add-refrigerator"
                            className="flex items-center space-x-3 p-4 border-2 border-dashed border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition group"
                        >
                            <Plus className="w-6 h-6 text-primary-blue group-hover:text-white" />
                            <div>
                                <p className="font-semibold">Add Refrigerator</p>
                                <p className="text-sm text-text-light group-hover:text-white">List a new refrigerator</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/manage-products"
                            className="flex items-center space-x-3 p-4 border-2 border-dashed border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition group"
                        >
                            <List className="w-6 h-6 text-primary-blue group-hover:text-white" />
                            <div>
                                <p className="font-semibold">Manage Products</p>
                                <p className="text-sm text-text-light group-hover:text-white">View and edit all listings</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/leads"
                            className="flex items-center space-x-3 p-4 border-2 border-dashed border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition group"
                        >
                            <Users className="w-6 h-6 text-primary-blue group-hover:text-white" />
                            <div>
                                <p className="font-semibold">View All Leads</p>
                                <p className="text-sm text-text-light group-hover:text-white">Manage inquiries & requests</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/manage-services"
                            className="flex items-center space-x-3 p-4 border-2 border-dashed border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition group"
                        >
                            <List className="w-6 h-6 text-primary-blue group-hover:text-white" />
                            <div>
                                <p className="font-semibold">Manage Services</p>
                                <p className="text-sm text-text-light group-hover:text-white">AC, WM & Fridge services</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/orders"
                            className="flex items-center space-x-3 p-4 border-2 border-dashed border-slate-600 rounded-lg hover:bg-slate-800 hover:text-white transition group"
                        >
                            <Package className="w-6 h-6 text-slate-700 group-hover:text-white" />
                            <div>
                                <p className="font-semibold">All orders</p>
                                <p className="text-sm text-text-light group-hover:text-white">Status & payment (pay later → paid)</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/settings"
                            className="flex items-center space-x-3 p-4 border-2 border-dashed border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition group"
                        >
                            <Settings className="w-6 h-6 text-primary-blue group-hover:text-white" />
                            <div>
                                <p className="font-semibold">Checkout settings</p>
                                <p className="text-sm text-text-light group-hover:text-white">Discounts & advance ₹</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/coupons"
                            className="flex items-center space-x-3 p-4 border-2 border-dashed border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition group"
                        >
                            <Tag className="w-6 h-6 text-primary-blue group-hover:text-white" />
                            <div>
                                <p className="font-semibold">Coupons</p>
                                <p className="text-sm text-text-light group-hover:text-white">Create & delete codes</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/faqs"
                            className="flex items-center space-x-3 p-4 border-2 border-dashed border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition group"
                        >
                            <HelpCircle className="w-6 h-6 text-primary-blue group-hover:text-white" />
                            <div>
                                <p className="font-semibold">FAQs</p>
                                <p className="text-sm text-text-light group-hover:text-white">Public help content</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/tickets"
                            className="flex items-center space-x-3 p-4 border-2 border-dashed border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition group"
                        >
                            <MessageSquare className="w-6 h-6 text-primary-blue group-hover:text-white" />
                            <div>
                                <p className="font-semibold">Tickets</p>
                                <p className="text-sm text-text-light group-hover:text-white">Support inbox</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/service-requests"
                            className="flex items-center space-x-3 p-4 border-2 border-dashed border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition group"
                        >
                            <Wrench className="w-6 h-6 text-primary-blue group-hover:text-white" />
                            <div>
                                <p className="font-semibold">Service requests</p>
                                <p className="text-sm text-text-light group-hover:text-white">Repair / post-order</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

