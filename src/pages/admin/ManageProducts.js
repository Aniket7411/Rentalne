import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Edit, Eye, AlertCircle, Trash2, Loader2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';

const ManageProducts = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const productType = searchParams.get('type') || 'ac';

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const { toasts, removeToast, success, error: showError } = useToast();

    useEffect(() => {
        loadProducts();
    }, [productType]);

    const loadProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiService.getProducts({ productType });
            if (response.success) {
                setProducts(response.data || []);
            } else {
                setError(response.message || 'Failed to load products');
            }
        } catch (err) {
            setError('An error occurred while loading products');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (productId, newStatus) => {
        const product = products.find(p => (p._id || p.id) === productId);
        if (!product) return;

        setUpdatingStatus(productId);
        try {
            const response = await apiService.updateProduct(productId, {
                status: newStatus,
            });
            if (response.success) {
                success('Status updated successfully');
                loadProducts();
            } else {
                showError(response.message || 'Failed to update status');
            }
        } catch (err) {
            showError('An error occurred while updating status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        setDeletingProduct(productId);
        try {
            const response = await apiService.deleteProduct(productId);
            if (response.success) {
                success('Product deleted successfully');
                loadProducts();
            } else {
                showError(response.message || 'Failed to delete product');
            }
        } catch (err) {
            showError('An error occurred while deleting product');
        } finally {
            setDeletingProduct(null);
        }
    };

    const getProductRoute = (product) => {
        const id = product._id || product.id;
        const type = product.productType || productType;
        if (type === 'washing-machine') return `/washing-machine/${id}`;
        if (type === 'refrigerator') return `/refrigerator/${id}`;
        return `/ac/${id}`;
    };

    const getAddRoute = () => {
        if (productType === 'washing-machine') return '/admin/add-washing-machine';
        if (productType === 'refrigerator') return '/admin/add-refrigerator';
        return '/admin/add-ac';
    };

    const getProductTypeName = () => {
        if (productType === 'washing-machine') return 'Washing Machines';
        if (productType === 'refrigerator') return 'Refrigerators';
        return 'Air Conditioners';
    };

    const getProductDisplayInfo = (product) => {
        if (productType === 'washing-machine') {
            return {
                title: product.name || `${product.brand || ''} ${product.capacity || ''}`.trim(),
                subtitle: `${product.capacity || ''} • ${product.type || ''}`.trim(),
            };
        } else if (productType === 'refrigerator') {
            return {
                title: product.name || `${product.brand || ''} ${product.capacity || ''}`.trim(),
                subtitle: product.capacity || '',
            };
        } else {
            return {
                title: product.name || `${product.brand || ''} ${product.model || ''}`.trim(),
                subtitle: `${product.capacity || ''} • ${product.type || ''}`.trim(),
            };
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-dark mb-2">Manage {getProductTypeName()}</h1>
                        <p className="text-text-light">View and manage your product listings</p>
                    </div>
                    <Link
                        to={getAddRoute()}
                        className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New</span>
                    </Link>
                </div>

                {/* Product Type Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
                    {['ac', 'washing-machine', 'refrigerator'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setSearchParams({ type })}
                            className={`px-4 py-2 font-medium transition-colors ${productType === type
                                    ? 'text-primary-blue border-b-2 border-primary-blue'
                                    : 'text-text-light hover:text-text-dark'
                                }`}
                        >
                            {type === 'ac' ? 'ACs' : type === 'washing-machine' ? 'Washing Machines' : 'Refrigerators'}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                {products.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product) => {
                                        const displayInfo = getProductDisplayInfo(product);
                                        const productId = product._id || product.id;
                                        const lowestPrice = product.price ? Math.min(...Object.values(product.price).filter(p => p && p > 0)) : 0;

                                        return (
                                            <motion.tr
                                                key={productId}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {product.images && product.images.length > 0 && (
                                                            <img
                                                                src={product.images[0]}
                                                                alt={displayInfo.title}
                                                                className="w-12 h-12 object-cover rounded-lg mr-3"
                                                                onError={(e) => {
                                                                    e.target.src = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=100&q=80';
                                                                }}
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-medium text-text-dark">{displayInfo.title}</div>
                                                            {displayInfo.subtitle && (
                                                                <div className="text-sm text-text-light">{displayInfo.subtitle}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                                                    {product.location}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-dark">
                                                    {lowestPrice > 0 ? `₹${lowestPrice.toLocaleString()}` : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={product.status || 'Available'}
                                                        onChange={(e) => handleStatusChange(productId, e.target.value)}
                                                        disabled={updatingStatus === productId}
                                                        className={`px-3 py-1 rounded-lg text-xs font-semibold border ${product.status === 'Available' ? 'bg-green-100 text-green-800 border-green-200' :
                                                                product.status === 'Rented Out' ? 'bg-red-100 text-red-800 border-red-200' :
                                                                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                            } ${updatingStatus === productId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                    >
                                                        <option value="Available">Available</option>
                                                        <option value="Rented Out">Rented Out</option>
                                                        <option value="Under Maintenance">Under Maintenance</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            to={getProductRoute(product)}
                                                            target="_blank"
                                                            className="text-primary-blue hover:text-primary-blue-light transition"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(productId)}
                                                            disabled={deletingProduct === productId}
                                                            className="text-red-600 hover:text-red-700 transition disabled:opacity-50"
                                                            title="Delete"
                                                        >
                                                            {deletingProduct === productId ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-lg shadow-md text-center">
                        <p className="text-text-light text-lg mb-4">No products found.</p>
                        <Link
                            to={getAddRoute()}
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Your First Product</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageProducts;

