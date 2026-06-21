import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { uploadMultipleFilesToCloudinary } from '../../utils/cloudinary';
import { Loader2, X, Plus, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const CATEGORIES = ['AC', 'Washing Machine', 'Refrigerator'];

const PRICE_TENURES = [
  { key: '3', label: '3 Months' },
  { key: '6', label: '6 Months' },
  { key: '9', label: '9 Months' },
  { key: '11', label: '11 Months' },
  { key: '12', label: '12 Months' },
  { key: '24', label: '24 Months' },
];

const blankForm = () => ({
  name: '', brand: '', model: '', type: '', capacity: '', location: '',
  status: 'Available', condition: 'New', description: '',
  price: { '3': '', '6': '', '9': '', '11': '', '12': '', '24': '' },
  discount: '0',
  specs: [],
  energyRating: '',
  operationType: '', loadType: '', weight: '',
  monthlyPaymentEnabled: false, monthlyPrice: '', securityDeposit: '',
  installationAmount: '',
  includedItems: [], excludedItems: [],
  copperPipe: '0', drainPipe: '0', electricWire: '0',
});

const AddProduct = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('AC');
  const [form, setForm] = useState(blankForm());
  const [specInput, setSpecInput] = useState('');
  const [includedInput, setIncludedInput] = useState('');
  const [excludedInput, setExcludedInput] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success'|'error', text }

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const setPrice = (key, value) => setForm(f => ({ ...f, price: { ...f.price, [key]: value } }));

  const handleCategory = (cat) => {
    setCategory(cat);
    setForm(blankForm());
    setImageFiles([]);
    setImagePreviews([]);
    setMsg(null);
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const addTag = (field, input, setInput) => {
    const v = input.trim();
    if (!v) return;
    setForm(f => ({ ...f, [field]: [...f[field], v] }));
    setInput('');
  };

  const removeTag = (field, i) => setForm(f => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      // Upload images
      let imageUrls = [];
      if (imageFiles.length > 0) {
        imageUrls = await uploadMultipleFilesToCloudinary(imageFiles);
      }

      // Build payload
      const price = {};
      PRICE_TENURES.forEach(({ key }) => {
        const v = parseFloat(form.price[key]);
        if (!isNaN(v)) price[key] = v;
      });

      const payload = {
        category,
        name: form.name,
        brand: form.brand,
        model: form.model,
        type: form.type,
        capacity: form.capacity,
        location: form.location,
        status: form.status,
        condition: form.condition,
        description: form.description,
        price,
        discount: parseFloat(form.discount) || 0,
        images: imageUrls,
        features: { specs: form.specs },
      };

      // Category-specific
      if (category === 'AC') {
        payload.installationCharges = {
          amount: parseFloat(form.installationAmount) || 0,
          includedItems: form.includedItems,
          excludedItems: form.excludedItems,
          extraMaterialRates: {
            copperPipe: parseFloat(form.copperPipe) || 0,
            drainPipe: parseFloat(form.drainPipe) || 0,
            electricWire: parseFloat(form.electricWire) || 0,
          },
        };
      }
      if (category === 'Washing Machine') {
        if (form.operationType) payload.operationType = form.operationType;
        if (form.loadType) payload.loadType = form.loadType;
        if (form.weight) payload.weight = form.weight;
      }
      if (category === 'Refrigerator') {
        if (form.energyRating) payload.energyRating = form.energyRating;
      }
      if (form.monthlyPaymentEnabled) {
        payload.monthlyPaymentEnabled = true;
        payload.monthlyPrice = parseFloat(form.monthlyPrice) || 0;
        payload.securityDeposit = parseFloat(form.securityDeposit) || 0;
      }

      const r = await apiService.createProduct(payload);
      if (!r.success) throw new Error(r.message || 'Failed to create product');
      setMsg({ type: 'success', text: `${category} added successfully!` });
      setForm(blankForm());
      setImageFiles([]);
      setImagePreviews([]);
      setTimeout(() => navigate('/admin/manage-products'), 1500);
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Add Product</h1>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-xl p-1.5 border border-gray-200 w-fit">
          {CATEGORIES.map(cat => (
            <button
              key={cat} type="button"
              onClick={() => handleCategory(cat)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                category === cat
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {msg && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-6 text-sm font-medium ${
            msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Name *</label>
                <input required className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Daikin 1.5 Ton Split AC" />
              </div>
              <div>
                <label className={labelCls}>Brand *</label>
                <input required className={inputCls} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. Daikin" />
              </div>
              <div>
                <label className={labelCls}>Model</label>
                <input className={inputCls} value={form.model} onChange={e => set('model', e.target.value)} placeholder="e.g. FTKG50TV16U" />
              </div>
              <div>
                <label className={labelCls}>Type *</label>
                <input required className={inputCls} value={form.type} onChange={e => set('type', e.target.value)}
                  placeholder={category === 'AC' ? 'Split / Window' : category === 'Washing Machine' ? 'Front Load / Top Load' : 'Single Door / Double Door'} />
              </div>
              <div>
                <label className={labelCls}>Capacity *</label>
                <input required className={inputCls} value={form.capacity} onChange={e => set('capacity', e.target.value)}
                  placeholder={category === 'AC' ? '1.5 Ton' : category === 'Washing Machine' ? '7 kg' : '250 L'} />
              </div>
              <div>
                <label className={labelCls}>Location *</label>
                <input required className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Mumbai" />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="Available">Available</option>
                  <option value="Rented Out">Rented Out</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Condition</label>
                <select className={inputCls} value={form.condition} onChange={e => set('condition', e.target.value)}>
                  <option value="New">New</option>
                  <option value="Refurbished">Refurbished</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Product description..." />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Rental Prices (₹) *</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {PRICE_TENURES.map(({ key, label }) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <input required type="number" min="0" className={inputCls} placeholder="₹"
                    value={form.price[key]} onChange={e => setPrice(key, e.target.value)} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className={labelCls}>Discount (%)</label>
                <input type="number" min="0" max="100" className={inputCls} value={form.discount} onChange={e => set('discount', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Monthly Payment Option */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <input type="checkbox" id="monthlyEnabled" checked={form.monthlyPaymentEnabled}
                onChange={e => set('monthlyPaymentEnabled', e.target.checked)} className="w-4 h-4 accent-sky-500" />
              <label htmlFor="monthlyEnabled" className="font-semibold text-slate-800">Enable Monthly Payment Option</label>
            </div>
            {form.monthlyPaymentEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Monthly Price (₹) *</label>
                  <input type="number" min="1" required className={inputCls} value={form.monthlyPrice} onChange={e => set('monthlyPrice', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Security Deposit (₹) *</label>
                  <input type="number" min="1" required className={inputCls} value={form.securityDeposit} onChange={e => set('securityDeposit', e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Category-specific fields */}
          {category === 'AC' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Installation Charges</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Base Installation Amount (₹)</label>
                  <input type="number" min="0" className={inputCls} value={form.installationAmount} onChange={e => set('installationAmount', e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className={labelCls}>Copper Pipe (₹/ft)</label>
                  <input type="number" min="0" className={inputCls} value={form.copperPipe} onChange={e => set('copperPipe', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Drain Pipe (₹/ft)</label>
                  <input type="number" min="0" className={inputCls} value={form.drainPipe} onChange={e => set('drainPipe', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Electric Wire (₹/ft)</label>
                  <input type="number" min="0" className={inputCls} value={form.electricWire} onChange={e => set('electricWire', e.target.value)} />
                </div>
              </div>
              {/* Included items */}
              <div className="mt-4">
                <label className={labelCls}>Included Items</label>
                <div className="flex gap-2">
                  <input className={inputCls} value={includedInput} onChange={e => setIncludedInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('includedItems', includedInput, setIncludedInput); }}}
                    placeholder="e.g. Basic piping up to 10ft" />
                  <button type="button" onClick={() => addTag('includedItems', includedInput, setIncludedInput)}
                    className="px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 text-sm">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.includedItems.map((t, i) => (
                    <span key={i} className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {t} <button type="button" onClick={() => removeTag('includedItems', i)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
              {/* Excluded items */}
              <div className="mt-4">
                <label className={labelCls}>Excluded Items</label>
                <div className="flex gap-2">
                  <input className={inputCls} value={excludedInput} onChange={e => setExcludedInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('excludedItems', excludedInput, setExcludedInput); }}}
                    placeholder="e.g. Extra piping beyond 10ft" />
                  <button type="button" onClick={() => addTag('excludedItems', excludedInput, setExcludedInput)}
                    className="px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 text-sm">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.excludedItems.map((t, i) => (
                    <span key={i} className="flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {t} <button type="button" onClick={() => removeTag('excludedItems', i)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {category === 'Washing Machine' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Washing Machine Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Operation Type</label>
                  <input className={inputCls} value={form.operationType} onChange={e => set('operationType', e.target.value)} placeholder="e.g. Fully Automatic" />
                </div>
                <div>
                  <label className={labelCls}>Load Type</label>
                  <input className={inputCls} value={form.loadType} onChange={e => set('loadType', e.target.value)} placeholder="Front Load / Top Load" />
                </div>
                <div>
                  <label className={labelCls}>Weight</label>
                  <select className={inputCls} value={form.weight} onChange={e => set('weight', e.target.value)}>
                    <option value="">Select weight</option>
                    {['5kg','6kg','7kg','8kg','9kg'].map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {category === 'Refrigerator' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Refrigerator Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Energy Rating</label>
                  <input className={inputCls} value={form.energyRating} onChange={e => set('energyRating', e.target.value)} placeholder="e.g. 3 Star / 5 Star" />
                </div>
              </div>
            </div>
          )}

          {/* Features / Specs */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Features / Specs</h2>
            <div className="flex gap-2">
              <input className={inputCls} value={specInput} onChange={e => setSpecInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('specs', specInput, setSpecInput); }}}
                placeholder="e.g. Inverter Technology" />
              <button type="button" onClick={() => addTag('specs', specInput, setSpecInput)}
                className="px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 text-sm flex-shrink-0">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {form.specs.map((t, i) => (
                <span key={i} className="flex items-center gap-1 bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-full">
                  {t} <button type="button" onClick={() => removeTag('specs', i)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Product Images</h2>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to upload images</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
            </label>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pb-8">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl shadow transition-all disabled:opacity-60">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Saving…' : `Add ${category}`}
            </button>
            <button type="button" onClick={() => navigate('/admin/manage-products')}
              className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
