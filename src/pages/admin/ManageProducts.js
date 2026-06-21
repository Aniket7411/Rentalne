import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Edit, Eye, AlertCircle, Trash2, Loader2, Plus, X, Save, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';
import { uploadMultipleFilesToCloudinary } from '../../utils/cloudinary';

const PRICE_TENURES = [
  { key: '3', label: '3 Months' },
  { key: '6', label: '6 Months' },
  { key: '9', label: '9 Months' },
  { key: '11', label: '11 Months' },
  { key: '12', label: '12 Months' },
  { key: '24', label: '24 Months' },
];

const STATUSES = ['Available', 'Rented Out', 'Under Maintenance'];

const blankEditForm = () => ({
  name: '', brand: '', model: '', capacity: '', type: '',
  location: '', description: '', status: 'Available',
  condition: 'New', discount: '',
  price: { '3': '', '6': '', '9': '', '11': '', '12': '', '24': '' },
  features: [], benefits: '',
  existingImages: [],
  newImageFiles: [],
  newImagePreviews: [],
});

const ManageProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const productType = searchParams.get('type') || 'ac';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit modal
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(blankEditForm());
  const [editSaving, setEditSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [newFeatureInput, setNewFeatureInput] = useState('');

  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch {
      setError('An error occurred while loading products');
    } finally {
      setLoading(false);
    }
  };

  // ── Quick status change (inline dropdown) ──
  const handleStatusChange = async (productId, newStatus) => {
    setUpdatingStatus(productId);
    try {
      const response = await apiService.updateProduct(productId, { status: newStatus });
      if (response.success) {
        success('Status updated');
        loadProducts();
      } else {
        showError(response.message || 'Failed to update status');
      }
    } catch {
      showError('An error occurred while updating status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // ── Delete ──
  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeletingProduct(productId);
    try {
      const response = await apiService.deleteProduct(productId);
      if (response.success) {
        success('Product deleted');
        loadProducts();
      } else {
        showError(response.message || 'Failed to delete product');
      }
    } catch {
      showError('An error occurred while deleting product');
    } finally {
      setDeletingProduct(null);
    }
  };

  // ── Open Edit modal ──
  const openEdit = (product) => {
    const rawPrice = product.price && typeof product.price === 'object' ? product.price : {};
    const price = {};
    PRICE_TENURES.forEach(({ key }) => {
      price[key] = rawPrice[key] != null ? String(rawPrice[key]) : '';
    });

    const features = (() => {
      const f = product.features;
      if (!f) return [];
      if (Array.isArray(f)) return f;
      if (typeof f === 'object' && Array.isArray(f.specs)) return f.specs;
      return [];
    })();

    setEditForm({
      name: product.name || '',
      brand: product.brand || '',
      model: product.model || '',
      capacity: product.capacity || '',
      type: product.type || '',
      location: product.location || '',
      description: product.description || '',
      status: product.status || 'Available',
      condition: product.condition || 'New',
      discount: product.discount != null ? String(product.discount) : '',
      price,
      features,
      benefits: product.benefits || '',
      existingImages: Array.isArray(product.images) ? product.images : [],
      newImageFiles: [],
      newImagePreviews: [],
    });
    setEditingProduct(product);
    setNewFeatureInput('');
  };

  const closeEdit = () => {
    setEditingProduct(null);
    setEditForm(blankEditForm());
    setNewFeatureInput('');
  };

  // ── Upload new images ──
  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setEditForm((prev) => ({
      ...prev,
      newImageFiles: [...prev.newImageFiles, ...files],
      newImagePreviews: [...prev.newImagePreviews, ...previews],
    }));
  };

  const removeExistingImage = (idx) => {
    setEditForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== idx),
    }));
  };

  const removeNewImage = (idx) => {
    setEditForm((prev) => ({
      ...prev,
      newImageFiles: prev.newImageFiles.filter((_, i) => i !== idx),
      newImagePreviews: prev.newImagePreviews.filter((_, i) => i !== idx),
    }));
  };

  const addFeature = () => {
    const v = newFeatureInput.trim();
    if (!v) return;
    setEditForm((prev) => ({ ...prev, features: [...prev.features, v] }));
    setNewFeatureInput('');
  };

  const removeFeature = (idx) => {
    setEditForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
  };

  // ── Save edit ──
  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditSaving(true);

    try {
      let allImages = [...editForm.existingImages];

      // Upload any new image files
      if (editForm.newImageFiles.length > 0) {
        setUploadingImages(true);
        const urls = await uploadMultipleFilesToCloudinary(editForm.newImageFiles);
        setUploadingImages(false);
        allImages = [...allImages, ...urls];
      }

      const price = {};
      PRICE_TENURES.forEach(({ key }) => {
        const v = editForm.price[key];
        if (v !== '' && v != null) {
          const n = parseFloat(v);
          if (!isNaN(n) && n >= 0) price[key] = n;
        }
      });

      const payload = {
        name: editForm.name,
        brand: editForm.brand,
        model: editForm.model,
        capacity: editForm.capacity,
        type: editForm.type,
        location: editForm.location,
        description: editForm.description,
        status: editForm.status,
        condition: editForm.condition,
        price,
        features: editForm.features,
        benefits: editForm.benefits,
        images: allImages,
      };
      if (editForm.discount !== '') {
        const d = parseFloat(editForm.discount);
        if (!isNaN(d)) payload.discount = d;
      }

      const id = editingProduct._id || editingProduct.id;
      const response = await apiService.updateProduct(id, payload);
      if (response.success) {
        success('Product updated successfully');
        closeEdit();
        loadProducts();
      } else {
        showError(response.message || 'Failed to update product');
      }
    } catch {
      showError('An error occurred while saving');
    } finally {
      setEditSaving(false);
      setUploadingImages(false);
    }
  };

  // ── Helpers ──
  const getProductRoute = (product) => {
    const id = product._id || product.id;
    const type = product.category
      ? product.category === 'Washing Machine' ? 'washing-machine'
        : product.category === 'Refrigerator' ? 'refrigerator' : 'ac'
      : productType;
    if (type === 'washing-machine') return `/washing-machine/${id}`;
    if (type === 'refrigerator') return `/refrigerator/${id}`;
    return `/ac/${id}`;
  };

  const getAddRoute = () => '/admin/add-product';

  const getProductTypeName = () => {
    if (productType === 'washing-machine') return 'Washing Machines';
    if (productType === 'refrigerator') return 'Refrigerators';
    return 'Air Conditioners';
  };

  const getProductDisplayInfo = (product) => {
    return {
      title: product.name || `${product.brand || ''} ${product.model || ''}`.trim(),
      subtitle: `${product.capacity || ''} ${product.type ? '• ' + product.type : ''}`.trim(),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-dark mb-1">Manage {getProductTypeName()}</h1>
            <p className="text-text-light">View, edit and manage your product listings</p>
          </div>
          <Link
            to={getAddRoute()}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </Link>
        </div>

        {/* Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          {[
            { value: 'ac', label: 'ACs' },
            { value: 'washing-machine', label: 'Washing Machines' },
            { value: 'refrigerator', label: 'Refrigerators' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSearchParams({ type: value })}
              className={`px-4 py-2 font-medium transition-colors ${
                productType === value
                  ? 'text-primary-blue border-b-2 border-primary-blue'
                  : 'text-text-light hover:text-text-dark'
              }`}
            >
              {label}
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
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Price (from)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => {
                    const { title, subtitle } = getProductDisplayInfo(product);
                    const productId = product._id || product.id;
                    const prices = product.price
                      ? Object.values(product.price).filter((p) => typeof p === 'number' && p > 0)
                      : [];
                    const lowestPrice = prices.length ? Math.min(...prices) : 0;

                    return (
                      <motion.tr
                        key={productId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {product.images?.[0] && (
                              <img
                                src={product.images[0]}
                                alt={title}
                                className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                            <div className="min-w-0">
                              <div className="font-medium text-text-dark truncate max-w-[160px]">{title}</div>
                              {subtitle && <div className="text-text-light text-xs">{subtitle}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-text-light hidden md:table-cell">{product.location || '—'}</td>
                        <td className="px-4 py-4 font-medium text-text-dark hidden sm:table-cell">
                          {lowestPrice > 0 ? `₹${lowestPrice.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={product.status || 'Available'}
                            onChange={(e) => handleStatusChange(productId, e.target.value)}
                            disabled={updatingStatus === productId}
                            className={`px-2 py-1 rounded-lg text-xs font-semibold border ${
                              product.status === 'Available'
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : product.status === 'Rented Out'
                                ? 'bg-red-100 text-red-800 border-red-200'
                                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            } disabled:opacity-50`}
                          >
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(product)}
                              className="p-1.5 text-primary-blue hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <Link
                              to={getProductRoute(product)}
                              target="_blank"
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(productId)}
                              disabled={deletingProduct === productId}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingProduct === productId
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Trash2 className="w-4 h-4" />}
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

      {/* ── Edit Modal ── */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-text-dark">
                Edit Product
              </h2>
              <button onClick={closeEdit} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="px-6 py-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              {/* Brand / Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Brand</label>
                  <input
                    type="text"
                    value={editForm.brand}
                    onChange={(e) => setEditForm((p) => ({ ...p, brand: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Model</label>
                  <input
                    type="text"
                    value={editForm.model}
                    onChange={(e) => setEditForm((p) => ({ ...p, model: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
              </div>

              {/* Capacity / Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Capacity</label>
                  <input
                    type="text"
                    value={editForm.capacity}
                    onChange={(e) => setEditForm((p) => ({ ...p, capacity: e.target.value }))}
                    placeholder="e.g. 1.5 Ton"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Type</label>
                  <input
                    type="text"
                    value={editForm.type}
                    onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))}
                    placeholder="e.g. Split, Window"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
              </div>

              {/* Location / Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Location <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Condition / Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Condition</label>
                  <select
                    value={editForm.condition}
                    onChange={(e) => setEditForm((p) => ({ ...p, condition: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  >
                    <option value="New">New</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editForm.discount}
                    onChange={(e) => setEditForm((p) => ({ ...p, discount: e.target.value }))}
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Rental Prices by Tenure (₹)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRICE_TENURES.map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs text-text-light mb-1">{label}</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.price[key]}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, price: { ...p.price, [key]: e.target.value } }))
                        }
                        placeholder="₹"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Benefits</label>
                <textarea
                  value={editForm.benefits}
                  onChange={(e) => setEditForm((p) => ({ ...p, benefits: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Features</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                    placeholder="Add a feature"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                  <button type="button" onClick={addFeature} className="px-3 py-2 bg-primary-blue text-white rounded-lg text-sm">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editForm.features.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {f}
                      <button type="button" onClick={() => removeFeature(i)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Images</label>
                {/* Existing images */}
                {editForm.existingImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                    {editForm.existingImages.map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} alt="" className="w-full h-20 object-cover rounded-lg border-2 border-green-400" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(i)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* New image previews */}
                {editForm.newImagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                    {editForm.newImagePreviews.map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} alt="" className="w-full h-20 object-cover rounded-lg border-2 border-yellow-400" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-yellow-500 text-white text-xs px-1 rounded">New</div>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-blue transition w-fit">
                  <Upload className="w-4 h-4 text-text-light" />
                  <span className="text-sm text-text-light">Add more images</span>
                  <input type="file" accept="image/*" multiple onChange={handleNewImages} className="hidden" />
                </label>
                {uploadingImages && (
                  <p className="text-sm text-primary-blue mt-1 flex items-center gap-1">
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading images...
                  </p>
                )}
              </div>

              {/* Save / Cancel */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 px-4 py-2.5 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {editSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
