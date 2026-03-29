import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Loader2,
  X,
  CheckCircle,
  Heart,
  Sparkles,
  Wrench,
  RotateCcw,
  Headphones,
  Info,
  Minus,
  Plus,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPhoneNumber, getFormattedPhone, validatePhoneNumber } from '../utils/phoneFormatter';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import ProductCard from '../components/ProductCard';
import { browsePath, slugToCategoryParam } from '../utils/browseUrls';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const TENURE_MONTHS = [3, 6, 9, 11, 12, 24];

const BENEFIT_CARDS = [
  { icon: Sparkles, text: 'Products as good as new' },
  { icon: Wrench, text: '100% free Repair & Maintenance' },
  { icon: RotateCcw, text: 'Easy Returns, no questions asked' },
  { icon: Headphones, text: '48-hour service support assured' },
];

const RENTAL_FAQ = [
  {
    q: 'What are the steps involved in the process of renting?',
    a: 'Browse and choose your appliance, select tenure and payment option, complete KYC if required, schedule delivery, and enjoy hassle-free service. Our team handles installation and support for the rental period.',
  },
  {
    q: 'Is there a security deposit?',
    a: 'Security deposit depends on the product and rental plan. Any applicable deposit is communicated before you confirm the order and is handled as per company policy.',
  },
  {
    q: 'What documents are needed for KYC?',
    a: 'Typically a valid government ID and address proof may be requested to complete verification. Exact requirements are shared at checkout or by our team before delivery.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Delivery timelines vary by location and product availability. You will get a confirmed slot after booking; most metro deliveries are scheduled within a few working days.',
  },
  {
    q: 'How is product quality ensured?',
    a: 'Units are inspected and, where applicable, refurbished to work like new. Maintenance and service coverage is included as per your plan.',
  },
  {
    q: 'Can I pay monthly for the rental?',
    a: 'Monthly payment may be available for select products where monthly billing is enabled. Use the payment options on this page when available, or contact support for eligibility.',
  },
];

function priceForMonths(product, months) {
  const p = product?.price;
  if (!p) return 0;
  const key = String(months);
  const v = p[key] ?? p[months];
  if (v == null || Number(v) <= 0) return 0;
  return Number(v);
}

function firstAvailableTenure(product) {
  for (const m of TENURE_MONTHS) {
    if (priceForMonths(product, m) > 0) return m;
  }
  return TENURE_MONTHS[0];
}

function CollapsiblePanel({ title, open, onToggle, children }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:py-3.5"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-slate-900 sm:text-base">{title}</span>
        {open ? <Minus className="h-4 w-4 shrink-0 text-slate-600" /> : <Plus className="h-4 w-4 shrink-0 text-slate-600" />}
      </button>
      {open ? <div className="border-t border-slate-100 px-4 py-3 sm:py-4">{children}</div> : null}
    </div>
  );
}

const ProductDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addRentalToCart } = useCart();

  const getProductType = () => {
    if (location.pathname.includes('/washing-machine/')) return 'washing-machine';
    if (location.pathname.includes('/refrigerator/')) return 'refrigerator';
    return 'ac';
  };

  const productType = getProductType();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedMonths, setSelectedMonths] = useState(3);
  const [tenureIndex, setTenureIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [descOpen, setDescOpen] = useState(true);
  const [benefitsOpen, setBenefitsOpen] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(() => RENTAL_FAQ.map((_, i) => i === 0));
  const [cartPaymentOption, setCartPaymentOption] = useState('payAdvance');
  const [cartBusy, setCartBusy] = useState(false);
  const [cartHint, setCartHint] = useState('');

  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    paymentOption: 'payAll',
    bookingAmount: '',
    tenure: '3months',
  });
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [related, setRelated] = useState([]);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadProduct();
  }, [id, productType]);

  useEffect(() => {
    if (product) {
      const first = firstAvailableTenure(product);
      setSelectedMonths(first);
      const idx = TENURE_MONTHS.indexOf(first);
      setTenureIndex(idx >= 0 ? idx : 0);
      loadRelated(product);
    }
  }, [product]);

  const getBrowseRoute = () => browsePath(slugToCategoryParam(productType));

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await apiService.getProductById(id, productType);
      if (response.success) {
        setProduct(response.data);
      } else {
        showError(response.message || 'Failed to load product details');
        setTimeout(() => navigate(getBrowseRoute()), 2000);
      }
    } catch (err) {
      showError('An error occurred while loading product details');
      setTimeout(() => navigate(getBrowseRoute()), 2000);
    } finally {
      setLoading(false);
    }
  };

  const loadRelated = async (p) => {
    try {
      const currentId = p._id || p.id;
      const category =
        p.category ||
        (productType === 'refrigerator'
          ? 'Refrigerator'
          : productType === 'washing-machine'
            ? 'Washing Machine'
            : 'AC');
      const res = await apiService.getRecommendedProducts({
        category,
        brand: p.brand || undefined,
        excludeId: currentId,
        limit: 24,
      });
      setRelated(res.success && Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setRelated([]);
    }
  };

  const syncTenureFromIndex = (idx) => {
    const i = Math.max(0, Math.min(idx, TENURE_MONTHS.length - 1));
    setTenureIndex(i);
    setSelectedMonths(TENURE_MONTHS[i]);
  };

  const displayInfo = useMemo(() => {
    if (!product) return { title: '', subtitle: '' };
    if (productType === 'washing-machine') {
      return {
        title: product.name || `${product.brand || ''} ${product.capacity || ''}`.trim(),
        subtitle: [product.capacity, product.type].filter(Boolean).join(' • '),
      };
    }
    if (productType === 'refrigerator') {
      const typ = product.type || 'Single Door';
      return {
        title: product.name || `${product.brand || ''} ${product.capacity || ''}`.trim(),
        subtitle: [product.capacity, typ].filter(Boolean).join(' • '),
      };
    }
    return {
      title: product.name || `${product.brand || ''} ${product.model || ''}`.trim(),
      subtitle: [product.capacity, product.type].filter(Boolean).join(' • '),
    };
  }, [product, productType]);

  const specsBlocks = useMemo(() => {
    if (!product?.features) return null;
    const f = product.features;
    if (Array.isArray(f)) {
      return { type: 'list', items: f };
    }
    return { type: 'obj', specs: f.specs, dimensions: f.dimensions, safety: f.safety };
  }, [product]);

  const selectedPrice = product ? priceForMonths(product, selectedMonths) : 0;
  const discountPct = product?.discount != null ? Number(product.discount) : 0;
  const saveAmount =
    discountPct > 0 && selectedPrice > 0 ? Math.round((selectedPrice * discountPct) / 100) : 0;

  const nextImage = () => {
    if (product?.images?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images?.length) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const handleInquiryChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setInquiryData({ ...inquiryData, phone: formatPhoneNumber(value) });
    } else {
      setInquiryData({ ...inquiryData, [name]: value });
    }
    setInquiryError('');
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setInquiryError('');
    if (!inquiryData.name || !inquiryData.phone || !inquiryData.email) {
      setInquiryError('Please fill all required fields');
      return;
    }
    if (!validatePhoneNumber(inquiryData.phone)) {
      setInquiryError('Please enter a valid 10-digit phone number');
      return;
    }
    setSubmittingInquiry(true);
    try {
      const formattedData = {
        ...inquiryData,
        phone: getFormattedPhone(inquiryData.phone),
        productDetails: product
          ? {
              id: product._id || product.id,
              name: product.name,
              brand: product.brand,
              capacity: product.capacity,
              type: product.type,
              location: product.location,
            }
          : undefined,
      };
      const response = await apiService.createProductInquiry(id, productType, formattedData);
      if (response.success) {
        success('Rental inquiry submitted successfully! We will contact you soon.');
        setInquirySuccess(true);
        setInquiryData({
          name: '',
          phone: '',
          email: '',
          message: '',
          paymentOption: 'payAll',
          bookingAmount: '',
          tenure: '3months',
        });
        setTimeout(() => {
          setShowInquiryForm(false);
          setInquirySuccess(false);
        }, 2000);
      } else {
        const errorMsg = response.message || 'Failed to submit inquiry. Please try again.';
        setInquiryError(errorMsg);
        showError(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'An error occurred. Please try again.';
      setInquiryError(errorMsg);
      showError(errorMsg);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.status === 'Rented Out') return;
    const pid = product._id || product.id;
    if (!pid) return;
    if (user && user.role !== 'user') {
      setCartHint('Please sign in as a customer to add to cart.');
      return;
    }
    setCartBusy(true);
    setCartHint('');
    const res = await addRentalToCart(pid, cartPaymentOption, product);
    setCartBusy(false);
    if (res.success) {
      setCartHint('Added to cart');
      window.setTimeout(() => setCartHint(''), 2500);
    } else {
      setCartHint(res.message || 'Could not add to cart');
      window.setTimeout(() => setCartHint(''), 4000);
    }
  };

  const monthlyEnabled = Boolean(product?.monthlyPaymentEnabled);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-blue mx-auto mb-3" />
          <p className="text-slate-600 text-sm sm:text-base">Loading product details…</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center px-4">
          <p className="text-slate-600 mb-4">Product not found</p>
          <Link to={getBrowseRoute()} className="text-primary-blue font-medium hover:underline">
            Go back to browse
          </Link>
        </div>
      </div>
    );
  }

  const hasImages = product.images && product.images.length > 0;
  const available = product.status === 'Available';

  return (
    <div className="min-h-screen bg-slate-100/80 py-5 sm:py-8 md:py-10">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          type="button"
          onClick={() => navigate(getBrowseRoute())}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </motion.button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 lg:items-start mb-10 md:mb-14">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-100 overflow-hidden shadow-sm">
              {hasImages ? (
                <div className="relative aspect-square sm:aspect-[4/3] max-h-[min(100vw,28rem)] sm:max-h-[32rem] mx-auto bg-slate-200/50">
                  <img
                    src={product.images[currentImageIndex]}
                    alt={displayInfo.title}
                    className="h-full w-full object-contain sm:object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80';
                    }}
                  />
                  {product.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevImage}
                        aria-label="Previous"
                        className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={nextImage}
                        aria-label="Next"
                        className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  {product.status ? (
                    <div
                      className={`absolute right-3 top-3 z-10 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm ${
                        available ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                      }`}
                    >
                      {product.status}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center text-slate-400 text-sm">No image</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {BENEFIT_CARDS.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-start gap-2 rounded-xl border border-sky-200/90 bg-sky-50/60 px-3 py-2.5 sm:px-3.5 sm:py-3"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 sm:h-[18px] sm:w-[18px]" strokeWidth={2} />
                  <span className="text-[11px] font-medium leading-snug text-slate-800 sm:text-xs">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 md:p-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-xl font-semibold leading-snug text-slate-900 sm:text-2xl md:text-[1.65rem]">
                {displayInfo.title}
              </h1>
              <button
                type="button"
                onClick={() => setSaved((s) => !s)}
                className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-rose-500 transition-colors"
                aria-label={saved ? 'Remove from saved' : 'Save'}
              >
                <Heart className={`h-6 w-6 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} strokeWidth={2} />
              </button>
            </div>

            {displayInfo.subtitle ? <p className="text-sm text-slate-500 mb-3">{displayInfo.subtitle}</p> : null}

            {product.location ? (
              <div className="flex items-center gap-1.5 text-sm font-medium text-sky-600 mb-5">
                <MapPin className="h-4 w-4 shrink-0" />
                {product.location}
              </div>
            ) : null}

            <div className="space-y-3 mb-6">
              {product.description ? (
                <CollapsiblePanel title="Description" open={descOpen} onToggle={() => setDescOpen((o) => !o)}>
                  <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{product.description}</p>
                </CollapsiblePanel>
              ) : null}

              {product.benefits ? (
                <CollapsiblePanel title="Benefits" open={benefitsOpen} onToggle={() => setBenefitsOpen((o) => !o)}>
                  <p className="text-sm text-slate-600 whitespace-pre-line">{product.benefits}</p>
                </CollapsiblePanel>
              ) : null}

              {specsBlocks ? (
                <CollapsiblePanel title="Features & Specifications" open={specsOpen} onToggle={() => setSpecsOpen((o) => !o)}>
                  {specsBlocks.type === 'list' ? (
                    <ul className="space-y-2">
                      {specsBlocks.items.map((item, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-slate-600">
                          <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="space-y-4 text-sm text-slate-600">
                      {specsBlocks.specs?.length ? (
                        <div>
                          <p className="mb-1.5 font-medium text-slate-800">Specs</p>
                          <ul className="list-disc space-y-1 pl-5">
                            {specsBlocks.specs.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {specsBlocks.dimensions ? (
                        <div>
                          <p className="mb-1 font-medium text-slate-800">Dimensions</p>
                          <p>{specsBlocks.dimensions}</p>
                        </div>
                      ) : null}
                      {specsBlocks.safety?.length ? (
                        <div>
                          <p className="mb-1.5 font-medium text-slate-800">Safety</p>
                          <ul className="list-disc space-y-1 pl-5">
                            {specsBlocks.safety.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  )}
                </CollapsiblePanel>
              ) : null}

              {product.condition ? (
                <p className="text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Condition:</span> {product.condition}
                </p>
              ) : null}
            </div>

            <div className="border-t border-slate-100 pt-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">Choose tenure</span>
                <Info className="h-3.5 w-3.5 text-sky-500" />
              </div>
              <input
                type="range"
                min={0}
                max={TENURE_MONTHS.length - 1}
                step={1}
                value={tenureIndex}
                onChange={(e) => syncTenureFromIndex(Number(e.target.value))}
                className="mb-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-500"
              />
              <div className="mb-4 flex justify-between gap-0.5 text-[10px] font-semibold text-slate-500 sm:text-xs">
                {TENURE_MONTHS.map((m) => (
                  <span key={m} className={m === selectedMonths ? 'text-sky-600' : ''}>
                    {m}
                  </span>
                ))}
              </div>

              <div className="mb-5">
                {selectedPrice > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-sky-600 tabular-nums sm:text-3xl">
                      ₹{selectedPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="ml-2 text-xs text-slate-500 sm:text-sm">
                      (Total for {selectedMonths} months)
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-semibold text-slate-600">Price on request</span>
                )}
              </div>

              {available && selectedPrice > 0 ? (
                <>
                  <button
                    type="button"
                    disabled={cartBusy}
                    onClick={handleAddToCart}
                    className="mb-3 w-full rounded-xl bg-sky-500 py-3 text-sm font-bold text-white shadow-md transition hover:bg-sky-600 disabled:opacity-60 sm:text-base"
                  >
                    {cartBusy ? 'Adding…' : 'Add to Cart'}
                  </button>
                  {discountPct > 0 && saveAmount > 0 ? (
                    <p className="mb-4 flex items-center gap-1.5 text-xs font-medium text-emerald-600 sm:text-sm">
                      <Star className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
                      {discountPct}% discount — Save ₹{saveAmount.toLocaleString('en-IN')}
                    </p>
                  ) : (
                    <div className="mb-4" />
                  )}

                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setCartPaymentOption('payAdvance')}
                      className={`rounded-xl py-2.5 text-xs font-bold sm:text-sm ${
                        cartPaymentOption === 'payAdvance'
                          ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-400 ring-offset-1'
                          : 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                      }`}
                    >
                      Pay Advance
                    </button>
                    <button
                      type="button"
                      disabled={!monthlyEnabled}
                      onClick={() => monthlyEnabled && setCartPaymentOption('payNow')}
                      className={`rounded-xl py-2.5 text-xs font-bold sm:text-sm ${
                        !monthlyEnabled
                          ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                          : cartPaymentOption === 'payNow'
                            ? 'bg-slate-200 text-slate-800 ring-2 ring-slate-400 ring-offset-1'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      Pay Monthly
                    </button>
                  </div>
                  {product.monthlyPrice != null && monthlyEnabled ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Monthly from ₹{Number(product.monthlyPrice).toLocaleString('en-IN')} (where applicable)
                    </p>
                  ) : null}
                </>
              ) : null}

              {!available ? (
                <p className="text-sm font-medium text-amber-700">Currently not available for rent.</p>
              ) : null}

              {cartHint ? <p className="mt-3 text-xs text-slate-600 sm:text-sm">{cartHint}</p> : null}

              <button
                type="button"
                onClick={() => setShowInquiryForm(true)}
                className="mt-4 w-full text-center text-sm font-semibold text-sky-600 hover:underline"
              >
                Need help? Send an inquiry
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 pb-8">
          <section className="lg:col-span-7">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl mb-1">Questions &amp; Answers</h2>
            <p className="text-sm text-slate-500 mb-4">Common questions from renters.</p>
            <div className="space-y-2">
              {RENTAL_FAQ.map((item, i) => {
                const open = faqOpen[i];
                return (
                  <div
                    key={item.q}
                    className={`rounded-xl border bg-white ${open ? 'border-sky-300 shadow-sm' : 'border-slate-200'}`}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      onClick={() =>
                        setFaqOpen((prev) => {
                          const next = [...prev];
                          next[i] = !next[i];
                          return next;
                        })
                      }
                    >
                      <span className="text-sm font-semibold text-slate-900">{item.q}</span>
                      {open ? <Minus className="h-4 w-4 shrink-0" /> : <Plus className="h-4 w-4 shrink-0" />}
                    </button>
                    {open ? (
                      <div className="border-t border-sky-100 bg-sky-50/50 px-4 py-3 text-sm leading-relaxed text-sky-900">
                        {item.a}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="lg:col-span-5">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl mb-1">Recommended Products</h2>
            <p className="text-sm text-slate-500 mb-4">Products you might like</p>
            {related.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {related.map((p) => (
                  <ProductCard key={p._id || p.id} product={p} listingDuration={String(selectedMonths)} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No similar listings right now.</p>
            )}
            <Link
              to={getBrowseRoute()}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>

        {showInquiryForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Rental inquiry</h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowInquiryForm(false);
                    setInquiryError('');
                    setInquirySuccess(false);
                  }}
                  className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {inquirySuccess ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <p className="font-semibold text-slate-900">Thank you!</p>
                  <p className="text-sm text-slate-600">We will contact you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  {inquiryError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {inquiryError}
                    </div>
                  ) : null}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Name *</label>
                    <input
                      name="name"
                      value={inquiryData.name}
                      onChange={handleInquiryChange}
                      required
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Phone *</label>
                    <input
                      name="phone"
                      value={inquiryData.phone}
                      onChange={handleInquiryChange}
                      required
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={inquiryData.email}
                      onChange={handleInquiryChange}
                      required
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Message</label>
                    <textarea
                      name="message"
                      value={inquiryData.message}
                      onChange={handleInquiryChange}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    className="w-full rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
                  >
                    {submittingInquiry ? 'Sending…' : 'Submit'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
