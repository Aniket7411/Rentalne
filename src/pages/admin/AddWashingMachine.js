import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { uploadMultipleFilesToCloudinary } from '../../utils/cloudinary';
import { Upload, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';

const AddWashingMachine = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        capacity: '',
        type: '', // Automatic or Semi automatic
        brand: '',
        description: '',
        location: '',
        price: {
            '3months': '',
            '6months': '',
            '9months': '',
            '11months': '',
        },
        actualPrice: '',
        discountPercent: '',
        benefits: '',
        condition: 'Brand New',
        dimensions: '',
        features: [],
        status: 'Available',
        images: [],
    });
    const [newFeature, setNewFeature] = useState('');
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const { toasts, removeToast, success: showSuccess, error: showError } = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('price.')) {
            const priceKey = name.split('.')[1];
            setFormData({
                ...formData,
                price: {
                    ...formData.price,
                    [priceKey]: value,
                },
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
        setError('');
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData({
                ...formData,
                features: [...formData.features, newFeature.trim()],
            });
            setNewFeature('');
        }
    };

    const removeFeature = (index) => {
        setFormData({
            ...formData,
            features: formData.features.filter((_, i) => i !== index),
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formData.images.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
        setFormData({
            ...formData,
            images: [...formData.images, ...files],
        });
    };

    const removeImage = (index) => {
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        const newImages = formData.images.filter((_, i) => i !== index);
        setImagePreviews(newPreviews);
        setFormData({
            ...formData,
            images: newImages,
        });
    };

    const removeUploadedImage = (index) => {
        const newUploadedUrls = uploadedImageUrls.filter((_, i) => i !== index);
        setUploadedImageUrls(newUploadedUrls);
    };

    const handleUploadImages = async () => {
        if (formData.images.length === 0) {
            setError('Please select images to upload');
            return;
        }

        setUploadingImages(true);
        setError('');

        try {
            const urls = await uploadMultipleFilesToCloudinary(formData.images);

            if (urls.length === 0) {
                setError('Failed to upload images. Please try again.');
                return;
            }

            if (urls.length < formData.images.length) {
                showError(`Only ${urls.length} out of ${formData.images.length} images uploaded successfully.`);
            } else {
                setFormData({
                    ...formData,
                    images: [],
                });
                setImagePreviews([]);
                showSuccess('Images uploaded successfully!');
            }

            setUploadedImageUrls([...uploadedImageUrls, ...urls]);
        } catch (err) {
            setError('Failed to upload images. Please try again.');
        } finally {
            setUploadingImages(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!formData.name || !formData.capacity || !formData.type || !formData.location) {
            setError('Please fill all required fields');
            return;
        }

        const hasPrice = Object.values(formData.price).some(p => p && p > 0);
        if (!hasPrice) {
            setError('Please fill at least one tenure price');
            return;
        }

        if (uploadedImageUrls.length === 0 && formData.images.length > 0) {
            setError('Please upload images first before submitting');
            return;
        }

        setLoading(true);

        try {
            const productData = {
                name: formData.name,
                capacity: formData.capacity,
                type: formData.type,
                brand: formData.brand || null,
                description: formData.description || null,
                location: formData.location,
                status: formData.status,
                productType: 'washing-machine',
                price: {
                    '3months': formData.price['3months'] ? parseFloat(formData.price['3months']) : null,
                    '6months': formData.price['6months'] ? parseFloat(formData.price['6months']) : null,
                    '9months': formData.price['9months'] ? parseFloat(formData.price['9months']) : null,
                    '11months': formData.price['11months'] ? parseFloat(formData.price['11months']) : null,
                },
                actualPrice: formData.actualPrice ? parseFloat(formData.actualPrice) : null,
                discountPercent: formData.discountPercent ? parseFloat(formData.discountPercent) : null,
                benefits: formData.benefits || null,
                condition: formData.condition,
                dimensions: formData.dimensions || null,
                features: formData.features,
                images: uploadedImageUrls,
            };

            const response = await apiService.addProduct(productData);

            if (response.success) {
                showSuccess('Washing Machine added successfully!');
                setTimeout(() => {
                    navigate('/admin/manage-products?type=washing-machine');
                }, 1500);
            } else {
                showError(response.message || 'Failed to add Washing Machine');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const capacities = ['6 Kg', '7 Kg', '8 Kg', '9 Kg', '10 Kg', '12 Kg'];
    const types = ['Automatic', 'Semi automatic'];
    const brands = ['Whirlpool', 'Haier', 'Godrej', 'Samsung', 'Panasonic', 'LG', 'IFB', 'Other'];
    const statuses = ['Available', 'Rented Out', 'Under Maintenance'];

    return (
        <div className="min-h-screen bg-background-light py-8">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-text-dark mb-2">Add New Washing Machine</h1>
                <p className="text-text-light mb-8">Fill in the details to list your Washing Machine for rental</p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-md p-6"
                >
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2 mb-6">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-dark mb-2">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Samsung 7 Kg Fully Automatic"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-dark mb-2">
                                    Capacity <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                                >
                                    <option value="">Select Capacity</option>
                                    {capacities.map((cap) => (
                                        <option key={cap} value={cap}>
                                            {cap}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-dark mb-2">
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                                >
                                    <option value="">Select Type</option>
                                    {types.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-dark mb-2">
                                    Brand (Optional)
                                </label>
                                <select
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                                >
                                    <option value="">Select Brand</option>
                                    {brands.map((brand) => (
                                        <option key={brand} value={brand}>
                                            {brand}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-dark mb-2">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Mumbai, Maharashtra"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-dark mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Describe the washing machine features, condition, etc."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-dark mb-2">
                                Rental Prices by Tenure (₹) <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs text-text-light mb-1">3 Months</label>
                                    <input
                                        type="number"
                                        name="price.3months"
                                        value={formData.price['3months']}
                                        onChange={handleChange}
                                        min="0"
                                        placeholder="e.g., 3000"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-text-light mb-1">6 Months</label>
                                    <input
                                        type="number"
                                        name="price.6months"
                                        value={formData.price['6months']}
                                        onChange={handleChange}
                                        min="0"
                                        placeholder="e.g., 5500"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-text-light mb-1">9 Months</label>
                                    <input
                                        type="number"
                                        name="price.9months"
                                        value={formData.price['9months']}
                                        onChange={handleChange}
                                        min="0"
                                        placeholder="e.g., 8000"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-text-light mb-1">11 Months</label>
                                    <input
                                        type="number"
                                        name="price.11months"
                                        value={formData.price['11months']}
                                        onChange={handleChange}
                                        min="0"
                                        placeholder="e.g., 10000"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-dark mb-2">
                                    Actual Price (₹) (Optional)
                                </label>
                                <input
                                    type="number"
                                    name="actualPrice"
                                    value={formData.actualPrice}
                                    onChange={handleChange}
                                    min="0"
                                    placeholder="Original price"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-dark mb-2">
                                    Discount Percentage (%) (Optional)
                                </label>
                                <input
                                    type="number"
                                    name="discountPercent"
                                    value={formData.discountPercent}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    placeholder="e.g., 10"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-dark mb-2">
                                Benefits
                            </label>
                            <textarea
                                name="benefits"
                                value={formData.benefits}
                                onChange={handleChange}
                                rows="3"
                                placeholder="List the benefits of this washing machine"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-dark mb-2">
                                    Condition <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                                >
                                    <option value="Brand New">Brand New</option>
                                    <option value="Refurbished">Refurbished</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-dark mb-2">
                                    Sizes & Dimensions (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="dimensions"
                                    value={formData.dimensions}
                                    onChange={handleChange}
                                    placeholder="e.g., 60x60x85 cm"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-dark mb-2">
                                Features & Specs
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addFeature();
                                        }
                                    }}
                                    placeholder="Add a feature (e.g., Smart Scrub Station)"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                                />
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
                                >
                                    Add
                                </button>
                            </div>
                            {formData.features.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.features.map((feature, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                        >
                                            {feature}
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index)}
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-dark mb-2">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                            >
                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-dark mb-2">
                                Upload Images (Max 5)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="image-upload"
                                    disabled={formData.images.length >= 5 || uploadingImages}
                                />
                                <label
                                    htmlFor="image-upload"
                                    className={`cursor-pointer flex flex-col items-center justify-center ${formData.images.length >= 5 || uploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Upload className="w-12 h-12 text-text-light mb-2" />
                                    <p className="text-text-light">Click to select images</p>
                                    <p className="text-sm text-text-light mt-1">
                                        {formData.images.length}/5 images selected
                                    </p>
                                </label>
                            </div>

                            {formData.images.length > 0 && (
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={handleUploadImages}
                                        disabled={uploadingImages || uploadedImageUrls.length >= 5}
                                        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        {uploadingImages ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Uploading Images...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                <span>Upload {formData.images.length} Image{formData.images.length > 1 ? 's' : ''} to Cloudinary</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {(imagePreviews.length > 0 || uploadedImageUrls.length > 0) && (
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={`preview-${index}`} className="relative">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                                                Not Uploaded
                                            </div>
                                        </div>
                                    ))}
                                    {uploadedImageUrls.map((url, index) => (
                                        <div key={`uploaded-${index}`} className="relative">
                                            <img
                                                src={url}
                                                alt={`Uploaded ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeUploadedImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                                Uploaded
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {uploadedImageUrls.length > 0 && (
                                <p className="text-sm text-green-600 mt-2">
                                    ✓ {uploadedImageUrls.length} image{uploadedImageUrls.length > 1 ? 's' : ''} uploaded successfully
                                </p>
                            )}
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/dashboard')}
                                className="flex-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || (formData.images.length > 0 && uploadedImageUrls.length === 0)}
                                className="flex-1 px-3 py-1 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Adding...' : 'Add Washing Machine'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AddWashingMachine;

