import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Loader2, Lock, Tag, ArrowLeft, Phone, ShieldCheck,
  ChevronRight, Zap, Clock, CreditCard, MapPin, User
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { generateOrderId, roundMoney } from '../utils/orderHelpers';
import { openRazorpayCheckout } from '../utils/razorpay';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import CheckoutFeedbackModal from '../components/CheckoutFeedbackModal';
import { defaultBrowsePath } from '../utils/browseUrls';

const DURATIONS = [3, 6, 9, 11, 12, 24];

function priceForDuration(priceObj, months) {
  if (!priceObj) return null;
  const key = String(months);
  const v = priceObj[key] ?? priceObj[months];
  return v != null && Number(v) > 0 ? Number(v) : null;
}

function firstAvailableDuration(priceObj) {
  for (const m of DURATIONS) {
    if (priceForDuration(priceObj, m) != null) return m;
  }
  return 3;
}

const PAYMENT_OPTIONS = [
  {
    v: 'payNow',
    label: 'Pay Now (Full Amount)',
    sublabel: 'Get instant discount on your order',
    icon: Zap,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-300',
  },
  {
    v: 'payAdvance',
    label: 'Pay Advance',
    sublabel: 'Pay a small advance to book, rest at delivery',
    icon: ShieldCheck,
    color: 'text-sky-600',
    bg: 'bg-sky-50 border-sky-300',
  },
  {
    v: 'payLater',
    label: 'Pay Later',
    sublabel: 'Pay after installation by our team',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-300',
  },
];

/* ─── Guest checkout sub-components ─── */

const OTP_RESEND_SECONDS = 60;

function GuestOtpFlow({ onLoggedIn, cartSubtotal }) {
  const { sendLoginOtp, loginWithOtp, sendSignupOtp, signupWithOtp } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [otpMode, setOtpMode] = useState('login'); // 'login' | 'signup'
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  const startCountdown = () => {
    setCountdown(OTP_RESEND_SECONDS);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const sendOtp = async (isResend = false) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) { showError('Enter a valid 10-digit mobile number'); return; }
    setBusy(true);
    let res = await sendLoginOtp(cleaned);
    if (!res.success) {
      // User not found — try signup OTP
      const signupRes = await sendSignupOtp(cleaned, name.trim() || undefined);
      if (signupRes.success) {
        res = signupRes;
        setOtpMode('signup');
      } else {
        setBusy(false);
        showError(signupRes.message || 'Could not send OTP. Try again.');
        return;
      }
    } else {
      setOtpMode('login');
    }
    setSessionId(res.sessionId || '');
    setBusy(false);
    if (!isResend) setStep('otp');
    startCountdown();
    success(res.otp ? `OTP sent (dev: ${res.otp})` : 'OTP sent to your mobile');
  };

  const verifyOtp = async () => {
    if (otp.length < 4) { showError('Enter the OTP sent to your number'); return; }
    setBusy(true);
    let res;
    if (otpMode === 'signup') {
      const userData = name.trim() ? { name: name.trim() } : {};
      res = await signupWithOtp(phone.replace(/\D/g, ''), otp.trim(), sessionId, userData);
    } else {
      res = await loginWithOtp(phone.replace(/\D/g, ''), otp.trim(), sessionId);
    }
    setBusy(false);
    if (res.success) {
      success('Verified! Continue to checkout.');
      onLoggedIn(res.user);
    } else {
      showError(
        res.attemptsRemaining != null
          ? `${res.message} (${res.attemptsRemaining} attempt${res.attemptsRemaining !== 1 ? 's' : ''} left)`
          : res.message || 'Verification failed'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-3 pb-8 px-3 sm:px-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-lg mx-auto space-y-4">
        <button type="button" onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-500 hover:text-sky-600 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to cart
        </button>

        {/* Cart preview */}
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
          <p className="text-sm font-semibold text-slate-700 mb-1">Order value</p>
          <p className="text-2xl font-bold text-sky-600">₹{cartSubtotal.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-400 mt-0.5">Discounts & final price confirmed after checkout</p>
        </div>

        {step === 'phone' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <Phone className="w-6 h-6 text-sky-500" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Quick Checkout</h1>
                <p className="text-sm text-slate-500">Enter your mobile to receive an OTP — no password needed</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number *</label>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-sky-400 focus-within:border-sky-400">
                <span className="px-3 py-2.5 text-sm text-slate-500 bg-slate-50 border-r border-slate-200">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  className="flex-1 px-3 py-2.5 text-sm outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none"
              />
            </div>

            <button
              type="button"
              disabled={busy || phone.length < 10}
              onClick={() => sendOtp()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Get OTP <ChevronRight className="w-4 h-4" /></>}
            </button>

            <div className="border-t border-slate-100 pt-3 text-center">
              <p className="text-xs text-slate-400 mb-2">Already have an account?</p>
              <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="text-sm font-semibold text-sky-600 hover:underline">
                Login with email / password
              </Link>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Enter OTP</h1>
                <p className="text-sm text-slate-500">Sent to +91 {phone}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">OTP</label>
              <input
                type="tel"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 4–6 digit OTP"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-lg tracking-widest text-center font-bold focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                autoFocus
              />
            </div>

            <button
              type="button"
              disabled={busy || otp.length < 4}
              onClick={verifyOtp}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Continue <ChevronRight className="w-4 h-4" /></>}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => { setStep('phone'); setOtp(''); }} className="text-slate-400 hover:text-slate-600">
                Change number
              </button>
              {countdown > 0 ? (
                <span className="text-slate-400">Resend in {countdown}s</span>
              ) : (
                <button type="button" disabled={busy} onClick={() => sendOtp(true)} className="text-sky-600 font-medium hover:underline">
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main CheckoutPage ─── */

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState({
    instantPaymentDiscount: 10,
    advancePaymentDiscount: 5,
    advancePaymentAmount: 500,
  });

  // Per-item duration (for order payload)
  const [itemDurations, setItemDurations] = useState(() => {
    const init = {};
    (cart.rentals || []).forEach((r) => {
      const id = r._id || r.id;
      init[id] = firstAvailableDuration(r.price || r.product?.price);
    });
    return init;
  });

  const [paymentOption, setPaymentOption] = useState('payNow');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [notes, setNotes] = useState('');

  // Address fields (for guest users or users with incomplete profiles)
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [userName, setUserName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(null);
  const modalNavigateRef = useRef(null);

  const isCustomer = user && user.role === 'user';

  useEffect(() => {
    if (!isCustomer) return;
    (async () => {
      const [p, s] = await Promise.all([apiService.getUserProfile(), apiService.getSettings()]);
      if (p.success && p.data) {
        setProfile(p.data);
        setAddress(p.data.homeAddress || p.data.address?.homeAddress || '');
        setPincode(p.data.pincode || p.data.address?.pincode || '');
        setUserName(p.data.name || '');
      }
      if (s.success && s.data) setSettings((prev) => ({ ...prev, ...s.data }));
    })();
  }, [isCustomer]);

  useEffect(() => {
    if (isCustomer) return;
    apiService.getSettings().then((s) => {
      if (s.success && s.data) setSettings((prev) => ({ ...prev, ...s.data }));
    });
  }, [isCustomer]);

  // Sync item durations when cart loads
  useEffect(() => {
    const init = {};
    (cart.rentals || []).forEach((r) => {
      const id = r._id || r.id;
      if (!itemDurations[id]) {
        init[id] = firstAvailableDuration(r.price || r.product?.price);
      }
    });
    if (Object.keys(init).length > 0) {
      setItemDurations((prev) => ({ ...prev, ...init }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.rentals]);

  const closeCheckoutModal = () => {
    setCheckoutModal(null);
    const path = modalNavigateRef.current;
    modalNavigateRef.current = null;
    if (path) navigate(path);
  };

  const openCheckoutModal = (opts) => {
    modalNavigateRef.current = opts.nextPath || null;
    setCheckoutModal({ variant: opts.variant, title: opts.title, message: opts.message });
  };

  const rentals = useMemo(() => cart.rentals || [], [cart.rentals]);
  const services = useMemo(() => cart.services || [], [cart.services]);

  const subtotal = useMemo(() => {
    let sum = 0;
    rentals.forEach((r) => {
      const id = r._id || r.id;
      const dur = itemDurations[id] || firstAvailableDuration(r.price || r.product?.price);
      const priceObj = r.price || r.product?.price || {};
      const p = priceForDuration(priceObj, dur);
      const q = r.quantity || 1;
      if (p != null) sum += p * q;
    });
    services.forEach((s) => { sum += Number(s.servicePrice) || 0; });
    return roundMoney(sum);
  }, [rentals, services, itemDurations]);

  const couponDiscount = couponData?.discountAmount ? roundMoney(Number(couponData.discountAmount)) : 0;
  const afterCoupon = roundMoney(Math.max(0, subtotal - couponDiscount));

  const paymentDiscount = useMemo(() => {
    if (paymentOption !== 'payNow') return 0;
    const pct = Number(settings.instantPaymentDiscount) || 0;
    return roundMoney(afterCoupon * (pct / 100));
  }, [afterCoupon, paymentOption, settings.instantPaymentDiscount]);

  const advanceDiscount = useMemo(() => {
    if (paymentOption !== 'payAdvance') return 0;
    const pct = Number(settings.advancePaymentDiscount) || 0;
    return roundMoney(afterCoupon * (pct / 100));
  }, [afterCoupon, paymentOption, settings.advancePaymentDiscount]);

  const totalDiscount = paymentOption === 'payNow' ? paymentDiscount : paymentOption === 'payAdvance' ? advanceDiscount : 0;
  const finalTotal = roundMoney(Math.max(0, afterCoupon - totalDiscount));

  const advanceAmount =
    paymentOption === 'payAdvance'
      ? roundMoney(Math.min(Number(settings.advancePaymentAmount) || 500, finalTotal))
      : null;

  const remainingAmount =
    paymentOption === 'payAdvance' && advanceAmount != null
      ? roundMoney(Math.max(0, finalTotal - advanceAmount))
      : null;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const uid = user?.id || user?._id;
    const items = rentals.map((r) => {
      const id = r._id || r.id;
      return {
        type: 'rental',
        category: r.product?.category || 'AC',
        duration: Number(itemDurations[id] || firstAvailableDuration(r.price || r.product?.price)),
      };
    });
    const res = await apiService.validateCoupon({ code: couponCode.trim(), orderTotal: subtotal, userId: uid, items });
    if (res.success) {
      setCouponData(res.data);
      success('Coupon applied!');
    } else {
      setCouponData(null);
      showError(res.error ? `${res.message || 'Invalid coupon'} (${res.error})` : res.message || 'Invalid coupon');
    }
  };

  const buildOrderPayload = (orderId) => {
    const uid = user?.id || user?._id;
    const resolvedName = userName || profile?.name || user?.name || '';
    const resolvedEmail = profile?.email || user?.email || '';
    const resolvedPhone = profile?.phone || user?.phone || '';
    const resolvedAddress = address || profile?.homeAddress || '';
    const resolvedPincode = pincode || profile?.pincode || '';

    const items = [];
    rentals.forEach((r) => {
      const pid = r.productId?._id || r.productId;
      const id = r._id || r.id;
      const dur = itemDurations[id] || firstAvailableDuration(r.price || r.product?.price);
      const priceObj = r.price || r.product?.price || {};
      const p = priceForDuration(priceObj, dur);
      items.push({
        type: 'rental',
        productId: pid,
        quantity: r.quantity || 1,
        duration: Number(dur),
        price: Number(p) || 0,
        isMonthlyPayment: false,
      });
    });
    services.forEach((s) => {
      items.push({
        type: 'service',
        serviceId: s.serviceId,
        price: Number(s.servicePrice) || 0,
        bookingDetails: s.bookingDetails,
      });
    });

    return {
      orderId,
      paymentOption,
      paymentStatus: 'pending',
      total: subtotal,
      productDiscount: 0,
      discount: roundMoney(couponDiscount + totalDiscount),
      couponCode: couponData?.code || (couponCode.trim() ? couponCode.trim().toUpperCase() : ''),
      couponDiscount,
      paymentDiscount: totalDiscount,
      finalTotal,
      priorityServiceScheduling: paymentOption === 'payAdvance',
      advanceAmount: paymentOption === 'payAdvance' ? advanceAmount : null,
      remainingAmount: paymentOption === 'payAdvance' ? remainingAmount : null,
      customerInfo: { userId: uid, name: resolvedName, email: resolvedEmail, phone: resolvedPhone, homeAddress: resolvedAddress, pincode: resolvedPincode },
      deliveryAddresses: [{ line1: resolvedAddress, city: '', pincode: resolvedPincode, phone: resolvedPhone }],
      items,
      notes: notes || '',
      orderDate: new Date().toISOString(),
    };
  };

  const runRazorpay = (orderKey, amountRupees, finishSubmitting) => {
    const amt = roundMoney(amountRupees);
    const openGateway = (d, verifyMode) => {
      const rzpOrderId = d.razorpayOrderId || d.razorpay_order_id;
      if (!d.key || !rzpOrderId) { finishSubmitting(); showError('Invalid payment session'); return Promise.resolve(); }
      return openRazorpayCheckout({
        key: d.key,
        orderId: rzpOrderId,
        prefill: { email: profile?.email || user?.email, contact: profile?.phone || user?.phone },
        onSuccess: async (response) => {
          const gatewayBody = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };
          let v;
          if (verifyMode === 'order') {
            v = await apiService.verifyOrderGatewayPayment(orderKey, gatewayBody);
          } else {
            v = await apiService.verifyRazorpayPayment({ ...gatewayBody, paymentId: d.paymentId });
          }
          finishSubmitting();
          if (v.success) {
            await apiService.clearCart().catch(() => {});
            await refreshCart();
            openCheckoutModal({ variant: 'success', title: 'Payment Successful!', message: 'Your order is confirmed. View details in your dashboard.', nextPath: `/orders/${encodeURIComponent(orderKey)}` });
          } else {
            openCheckoutModal({ variant: 'error', title: 'Payment Verification Failed', message: v.error ? `${v.message || 'Verification failed'} (${v.error})` : v.message || 'Verification failed' });
          }
        },
        onDismiss: () => { finishSubmitting(); showError('Payment cancelled'); },
      }).catch(() => { finishSubmitting(); showError('Razorpay failed to load'); });
    };

    apiService.createRazorpayPaymentOrder(orderKey, amt).then((payRes) => {
      if (payRes.success && payRes.data) return openGateway(payRes.data, 'payments');
      if (payRes.error === 'ORDER_ALREADY_PAID') { finishSubmitting(); showError(payRes.message || 'Order already paid'); return; }
      return apiService.createOrderRetryRazorpay(orderKey, Math.round(Number(amt) * 100)).then((retryRes) => {
        if (!retryRes.success || !retryRes.data) {
          showError(retryRes.message || payRes.message || 'Could not start payment');
          finishSubmitting();
          return;
        }
        return openGateway(retryRes.data, 'order');
      });
    }).catch(() => { finishSubmitting(); showError('Payment init failed'); });
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!rentals.length && !services.length) { showError('Cart is empty'); return; }
    if (!address.trim()) { showError('Please enter your delivery address'); return; }

    setSubmitting(true);
    const finish = () => setSubmitting(false);
    const orderId = generateOrderId();
    const payload = buildOrderPayload(orderId);

    const created = await apiService.createOrder(payload);
    if (!created.success) {
      openCheckoutModal({ variant: 'error', title: 'Could not place order', message: created.error ? `${created.message || 'Order failed'} (${created.error})` : created.message || 'Order failed' });
      finish();
      return;
    }

    const data = created.data || {};
    const orderKey = data.orderId || data.order?.orderId || orderId;

    if (paymentOption === 'payLater') {
      await apiService.clearCart().catch(() => {});
      await refreshCart();
      openCheckoutModal({ variant: 'success', title: 'Order Placed!', message: 'Your order is saved. Pay later at delivery or from your dashboard.', nextPath: `/orders/${encodeURIComponent(orderKey)}` });
      finish();
      return;
    }

    const charge = paymentOption === 'payAdvance' ? advanceAmount : finalTotal;
    runRazorpay(orderKey, charge, finish);
  };

  // Empty cart redirect
  if (!rentals.length && !services.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-slate-500 mb-4">Your cart is empty.</p>
        <Link to={defaultBrowsePath()} className="text-sky-500 font-semibold hover:underline">Browse products</Link>
      </div>
    );
  }

  // Guest / not authenticated → OTP checkout flow
  if (!isCustomer) {
    // Rough subtotal for preview
    let previewTotal = 0;
    rentals.forEach((r) => {
      const id = r._id || r.id;
      const dur = itemDurations[id] || firstAvailableDuration(r.price || r.product?.price);
      const p = priceForDuration(r.price || r.product?.price, dur);
      if (p) previewTotal += p * (r.quantity || 1);
    });
    services.forEach((s) => { previewTotal += Number(s.servicePrice) || 0; });
    return (
      <GuestOtpFlow
        cartSubtotal={previewTotal}
        onLoggedIn={() => { /* After login, cart + user re-render triggers authenticated view */ }}
      />
    );
  }

  // ── Authenticated checkout ──
  return (
    <div className="min-h-screen bg-slate-50 pt-3 pb-8 px-3 sm:px-4">
      <CheckoutFeedbackModal
        isOpen={!!checkoutModal}
        variant={checkoutModal?.variant || 'success'}
        title={checkoutModal?.title || ''}
        message={checkoutModal?.message}
        onClose={closeCheckoutModal}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-4xl mx-auto">
        <button type="button" onClick={() => navigate('/cart')} className="flex items-center gap-2 text-slate-500 hover:text-sky-600 mb-3 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to cart
        </button>

        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-sky-500" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left: form */}
          <form onSubmit={placeOrder} className="lg:col-span-2 space-y-5">

            {/* Delivery address */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sky-500" />
                <h2 className="font-semibold text-slate-900">Delivery Details</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <User className="w-3.5 h-3.5 inline mr-1" />
                  Full Name
                </label>
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Delivery Address *
                </label>
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House/flat no., street, locality, city…"
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Pincode</label>
                <input
                  type="tel"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit pincode"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none"
                />
              </div>
            </div>

            {/* Duration selection per item */}
            {rentals.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <h2 className="font-semibold text-slate-900">Rental Duration</h2>
                {rentals.map((r) => {
                  const id = r._id || r.id;
                  const priceObj = r.price || r.product?.price || {};
                  const selDur = itemDurations[id] || firstAvailableDuration(priceObj);
                  const name = r.product?.name || [r.product?.brand, r.product?.model].filter(Boolean).join(' ') || 'Appliance';
                  return (
                    <div key={id} className="border border-slate-100 rounded-xl p-3">
                      <p className="text-sm font-medium text-slate-700 mb-2 truncate">{name}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {DURATIONS.map((m) => {
                          const p = priceForDuration(priceObj, m);
                          const isSelected = selDur === m;
                          return (
                            <button
                              key={m}
                              type="button"
                              disabled={p == null}
                              onClick={() => p != null && setItemDurations((prev) => ({ ...prev, [id]: m }))}
                              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                                p == null
                                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                  : isSelected
                                    ? 'bg-sky-500 text-white shadow-sm'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-sky-300'
                              }`}
                            >
                              {m}m {p != null && <span className={`font-normal ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>₹{p.toLocaleString('en-IN')}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Payment options */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-5 h-5 text-sky-500" />
                <h2 className="font-semibold text-slate-900">Payment Option</h2>
              </div>
              {PAYMENT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = paymentOption === opt.v;
                const discountPct = opt.v === 'payNow'
                  ? Number(settings.instantPaymentDiscount) || 0
                  : opt.v === 'payAdvance'
                    ? Number(settings.advancePaymentDiscount) || 0
                    : 0;
                const saveAmt = opt.v === 'payNow'
                  ? paymentDiscount
                  : opt.v === 'payAdvance'
                    ? advanceDiscount
                    : 0;
                return (
                  <label
                    key={opt.v}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected ? opt.bg : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input type="radio" name="pay" value={opt.v} checked={isSelected} onChange={() => setPaymentOption(opt.v)} className="mt-1 accent-sky-500" />
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? opt.color : 'text-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`font-semibold text-sm ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{opt.label}</span>
                        {discountPct > 0 && (
                          <span className="text-[10px] font-bold bg-emerald-500 text-white rounded-full px-1.5 py-0.5">{discountPct}% off</span>
                        )}
                      </div>
                      {!isSelected && (
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{opt.sublabel}</p>
                      )}

                      {isSelected && (
                        <div className="mt-1.5 space-y-1.5">
                          {opt.v === 'payNow' && (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">You pay</span>
                                <span className="text-sm font-bold text-slate-900">₹{finalTotal.toLocaleString('en-IN')}</span>
                              </div>
                              {saveAmt > 0 && (
                                <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                  <Zap className="w-3 h-3" /> Save ₹{saveAmt.toLocaleString('en-IN')} instantly
                                </p>
                              )}
                            </>
                          )}
                          {opt.v === 'payAdvance' && advanceAmount != null && (
                            <>
                              <div className="flex gap-2">
                                <div className="flex-1 bg-sky-500/10 rounded-lg px-2 py-1.5 text-center">
                                  <p className="text-[10px] text-slate-500">Pay now</p>
                                  <p className="text-xs font-bold text-sky-600">₹{advanceAmount.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="flex-1 bg-slate-100 rounded-lg px-2 py-1.5 text-center">
                                  <p className="text-[10px] text-slate-500">At delivery</p>
                                  <p className="text-xs font-bold text-slate-700">₹{remainingAmount?.toLocaleString('en-IN')}</p>
                                </div>
                              </div>
                              {saveAmt > 0 && (
                                <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" /> Save ₹{saveAmt.toLocaleString('en-IN')} on advance
                                </p>
                              )}
                            </>
                          )}
                          {opt.v === 'payLater' && (
                            <p className="text-xs text-amber-700 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pay after installation — no Razorpay needed
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-sky-500" />
                <h2 className="font-semibold text-slate-900">Coupon Code</h2>
              </div>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponData(null); }}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm uppercase tracking-wide focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none"
                  placeholder="Enter code"
                />
                <button type="button" onClick={applyCoupon} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium text-sm text-slate-700 transition-colors">
                  Apply
                </button>
              </div>
              {couponData && (
                <p className="text-sm text-emerald-600 font-medium">
                  ✓ Coupon applied — saving ₹{couponDiscount.toLocaleString('en-IN')} ({couponData.code})
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">Special Instructions (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any special requirements for delivery or installation…"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none resize-none"
              />
            </div>

            {/* Mobile submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="lg:hidden w-full flex items-center justify-center gap-2 py-3.5 bg-sky-500 text-white rounded-xl font-semibold text-base hover:bg-sky-600 disabled:opacity-50 transition-colors"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                paymentOption === 'payLater' ? 'Place Order (Pay Later)' :
                paymentOption === 'payAdvance' ? `Pay Advance ₹${advanceAmount?.toLocaleString('en-IN') || ''}` :
                `Pay ₹${finalTotal.toLocaleString('en-IN')}`
              )}
            </button>
          </form>

          {/* Right: summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:sticky lg:top-6">
              <h2 className="font-bold text-slate-900 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-2 mb-4">
                {rentals.map((r) => {
                  const id = r._id || r.id;
                  const dur = itemDurations[id] || firstAvailableDuration(r.price || r.product?.price);
                  const priceObj = r.price || r.product?.price || {};
                  const p = priceForDuration(priceObj, dur);
                  const name = r.product?.name || [r.product?.brand].filter(Boolean).join(' ') || 'Appliance';
                  return (
                    <div key={id} className="flex justify-between text-sm">
                      <span className="text-slate-600 truncate max-w-[60%]">{name} ({dur}m)</span>
                      <span className="text-slate-800 font-medium">
                        {p != null ? `₹${(p * (r.quantity || 1)).toLocaleString('en-IN')}` : '—'}
                      </span>
                    </div>
                  );
                })}
                {services.map((s) => {
                  const id = s._id || s.id;
                  return (
                    <div key={id} className="flex justify-between text-sm">
                      <span className="text-slate-600 truncate max-w-[60%]">{s.serviceTitle}</span>
                      <span className="text-slate-800 font-medium">₹{Number(s.servicePrice || 0).toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon ({couponData?.code})</span>
                    <span>−₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {paymentOption === 'payNow' && paymentDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Instant pay ({settings.instantPaymentDiscount}% off)</span>
                    <span>−₹{paymentDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {paymentOption === 'payAdvance' && advanceDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Advance discount ({settings.advancePaymentDiscount}% off)</span>
                    <span>−₹{advanceDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 text-base pt-1 border-t border-slate-100">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
                {paymentOption === 'payAdvance' && advanceAmount != null && (
                  <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Due now (advance)</span>
                      <span className="font-semibold text-sky-600">₹{advanceAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Due at delivery</span>
                      <span>₹{remainingAmount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={placeOrder}
                className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 disabled:opacity-50 transition-colors"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  paymentOption === 'payLater' ? 'Place Order (Pay Later)' :
                  paymentOption === 'payAdvance' ? `Pay Advance ₹${advanceAmount?.toLocaleString('en-IN') || ''}` :
                  `Pay ₹${finalTotal.toLocaleString('en-IN')}`
                )}
              </button>

              <p className="text-xs text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Secured checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
