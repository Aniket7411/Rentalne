import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Lock, Tag, ArrowLeft, LogIn } from 'lucide-react';
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
  const [duration, setDuration] = useState(12);
  const [paymentOption, setPaymentOption] = useState('payNow');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(null);
  const modalNavigateRef = useRef(null);

  const closeCheckoutModal = () => {
    setCheckoutModal(null);
    const path = modalNavigateRef.current;
    modalNavigateRef.current = null;
    if (path) navigate(path);
  };

  const openCheckoutModal = (opts) => {
    modalNavigateRef.current = opts.nextPath || null;
    setCheckoutModal({
      variant: opts.variant,
      title: opts.title,
      message: opts.message,
    });
  };

  useEffect(() => {
    if (!user || user.role !== 'user') return;
    (async () => {
      const [p, s] = await Promise.all([
        apiService.getUserProfile(),
        apiService.getSettings(),
      ]);
      if (p.success) setProfile(p.data);
      if (s.success && s.data) setSettings((prev) => ({ ...prev, ...s.data }));
    })();
  }, [user]);

  useEffect(() => {
    (async () => {
      if (user && user.role === 'user') return;
      const s = await apiService.getSettings();
      if (s.success && s.data) setSettings((prev) => ({ ...prev, ...s.data }));
    })();
  }, [user]);

  const rentals = cart.rentals || [];
  const services = cart.services || [];

  const subtotal = useMemo(() => {
    let sum = 0;
    const d = String(duration);
    rentals.forEach((r) => {
      const p = r.price?.[d];
      const q = r.quantity || 1;
      if (p != null) sum += Number(p) * q;
    });
    services.forEach((s) => {
      sum += Number(s.servicePrice) || 0;
    });
    return roundMoney(sum);
  }, [rentals, services, duration]);

  const couponDiscount = couponData?.discountAmount
    ? roundMoney(Number(couponData.discountAmount))
    : 0;

  const afterCoupon = roundMoney(Math.max(0, subtotal - couponDiscount));

  const paymentDiscount = useMemo(() => {
    if (paymentOption !== 'payNow') return 0;
    const pct = Number(settings.instantPaymentDiscount) || 0;
    return roundMoney(afterCoupon * (pct / 100));
  }, [afterCoupon, paymentOption, settings.instantPaymentDiscount]);

  const finalTotal = roundMoney(Math.max(0, afterCoupon - paymentDiscount));

  const advanceAmount =
    paymentOption === 'payAdvance'
      ? roundMoney(
          Math.min(Number(settings.advancePaymentAmount) || 500, finalTotal)
        )
      : null;

  const remainingAmount =
    paymentOption === 'payAdvance' && advanceAmount != null
      ? roundMoney(Math.max(0, finalTotal - advanceAmount))
      : null;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const uid = user?.id || user?._id;
    const items = rentals.map((r) => ({
      type: 'rental',
      category: r.product?.category || 'AC',
      duration: Number(duration),
    }));
    const res = await apiService.validateCoupon({
      code: couponCode.trim(),
      orderTotal: subtotal,
      userId: uid,
      items,
    });
    if (res.success) {
      setCouponData(res.data);
      success('Coupon applied');
    } else {
      setCouponData(null);
      const hint = res.error ? `${res.message || 'Invalid coupon'} (${res.error})` : res.message;
      showError(hint || 'Invalid coupon');
    }
  };

  const buildOrderPayload = (orderId) => {
    const uid = user?.id || user?._id;
    const name = profile?.name || user?.name || '';
    const email = profile?.email || user?.email || '';
    const phone = profile?.phone || user?.phone || '';
    const homeAddress =
      profile?.homeAddress || profile?.address?.homeAddress || '';
    const pincode = profile?.pincode || profile?.address?.pincode || '';

    const items = [];
    rentals.forEach((r) => {
      const pid = r.productId?._id || r.productId;
      const p = r.price?.[String(duration)];
      items.push({
        type: 'rental',
        productId: pid,
        quantity: r.quantity || 1,
        duration: Number(duration),
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

    const discountTotal = roundMoney(couponDiscount + paymentDiscount);

    return {
      orderId,
      paymentOption,
      paymentStatus: 'pending',
      total: subtotal,
      productDiscount: 0,
      discount: discountTotal,
      couponCode:
        couponData?.code || (couponCode.trim() ? couponCode.trim().toUpperCase() : ''),
      couponDiscount,
      paymentDiscount,
      finalTotal,
      priorityServiceScheduling: false,
      advanceAmount: paymentOption === 'payAdvance' ? advanceAmount : null,
      remainingAmount:
        paymentOption === 'payAdvance' ? remainingAmount : null,
      customerInfo: {
        userId: uid,
        name,
        email,
        phone,
        homeAddress,
        pincode,
      },
      deliveryAddresses: [
        {
          line1: homeAddress,
          city: '',
          pincode,
          phone,
        },
      ],
      items,
      notes: notes || '',
      orderDate: new Date().toISOString(),
    };
  };

  const runRazorpay = (orderKey, amountRupees, finishSubmitting) => {
    const amt = roundMoney(amountRupees);

    const openGateway = (d, verifyMode) => {
      const rzpOrderId = d.razorpayOrderId || d.razorpay_order_id;
      if (!d.key || !rzpOrderId) {
        finishSubmitting();
        showError('Invalid payment session from server');
        return Promise.resolve();
      }
      return openRazorpayCheckout({
        key: d.key,
        orderId: rzpOrderId,
        prefill: {
          email: profile?.email || user?.email,
          contact: profile?.phone || user?.phone,
        },
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
            v = await apiService.verifyRazorpayPayment({
              ...gatewayBody,
              paymentId: d.paymentId,
            });
          }
          finishSubmitting();
          if (v.success) {
            await apiService.clearCart().catch(() => {});
            await refreshCart();
            openCheckoutModal({
              variant: 'success',
              title: 'Payment successful',
              message: 'Your order is confirmed. You can view details from your dashboard.',
              nextPath: `/orders/${encodeURIComponent(orderKey)}`,
            });
          } else {
            openCheckoutModal({
              variant: 'error',
              title: 'Payment verification failed',
              message: v.error
                ? `${v.message || 'Verification failed'} (${v.error})`
                : v.message || 'Verification failed',
            });
          }
        },
        onDismiss: () => {
          finishSubmitting();
          showError('Payment cancelled');
        },
      }).catch(() => {
        finishSubmitting();
        showError('Razorpay failed to load');
      });
    };

    apiService
      .createRazorpayPaymentOrder(orderKey, amt)
      .then((payRes) => {
        if (payRes.success && payRes.data) {
          return openGateway(payRes.data, 'payments');
        }
        if (payRes.error === 'ORDER_ALREADY_PAID') {
          finishSubmitting();
          showError(payRes.message || 'Order is already paid');
          return;
        }
        return apiService
          .createOrderRetryRazorpay(orderKey, Math.round(Number(amt) * 100))
          .then((retryRes) => {
            if (!retryRes.success || !retryRes.data) {
              const msg = retryRes.error
                ? `${retryRes.message || 'Could not start payment'} (${retryRes.error})`
                : payRes.error
                  ? `${payRes.message || 'Could not start payment'} (${payRes.error})`
                  : retryRes.message || payRes.message || 'Could not start payment';
              showError(msg || 'Could not start payment');
              finishSubmitting();
              return;
            }
            return openGateway(retryRes.data, 'order');
          });
      })
      .catch(() => {
        finishSubmitting();
        showError('Payment init failed');
      });
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'user') {
      openCheckoutModal({
        variant: 'error',
        title: 'Sign in required',
        message: 'Please log in or create an account to place an order. Your cart is saved.',
      });
      return;
    }
    if (!rentals.length && !services.length) {
      showError('Cart is empty');
      return;
    }
    for (const r of rentals) {
      const p = r.price?.[String(duration)];
      if (p == null) {
        showError('Selected duration is not available for every item in your cart');
        return;
      }
    }

    setSubmitting(true);
    const finish = () => setSubmitting(false);

    const orderId = generateOrderId();
    const payload = buildOrderPayload(orderId);
    const created = await apiService.createOrder(payload);
    if (!created.success) {
      openCheckoutModal({
        variant: 'error',
        title: 'Could not place order',
        message: created.error
          ? `${created.message || 'Order failed'} (${created.error})`
          : created.message || 'Order failed',
      });
      finish();
      return;
    }

    const data = created.data || {};
    const orderKey = data.orderId || data.order?.orderId || orderId;

    if (paymentOption === 'payLater') {
      await apiService.clearCart().catch(() => {});
      await refreshCart();
      openCheckoutModal({
        variant: 'success',
        title: 'Order placed',
        message:
          'Your order is saved. For pay later, complete payment anytime from order details—or staff may record cash/UPI as paid.',
        nextPath: `/orders/${encodeURIComponent(orderKey)}`,
      });
      finish();
      return;
    }

    const charge =
      paymentOption === 'payAdvance' ? advanceAmount : finalTotal;
    runRazorpay(orderKey, charge, finish);
  };

  if (!rentals.length && !services.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-text-light mb-4">Your cart is empty.</p>
        <Link to={defaultBrowsePath()} className="text-primary-blue font-semibold">
          Browse products
        </Link>
      </div>
    );
  }

  const isCustomer = user && user.role === 'user';

  if (!isCustomer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4">
        <CheckoutFeedbackModal
          isOpen={!!checkoutModal}
          variant={checkoutModal?.variant || 'success'}
          title={checkoutModal?.title || ''}
          message={checkoutModal?.message}
          onClose={closeCheckoutModal}
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <div className="max-w-lg mx-auto space-y-6">
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-text-light hover:text-primary-blue"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to cart
          </button>
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 space-y-4">
            <h1 className="text-2xl font-bold text-text-dark flex items-center gap-2">
              <LogIn className="w-7 h-7 text-primary-blue" />
              Sign in to pay
            </h1>
            <p className="text-sm text-text-light">
              You can add rentals to your cart without an account. To place the order and pay (card/UPI, advance, or pay
              later), sign in with your email or sign up—use your mobile number on your profile so we can reach you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/login"
                state={{ from: { pathname: '/checkout' } }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-blue text-white rounded-xl font-semibold text-center"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                state={{ from: { pathname: '/checkout' } }}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-primary-blue text-primary-blue rounded-xl font-semibold text-center"
              >
                Sign up
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm">
            <p className="font-semibold text-text-dark mb-2">Order preview</p>
            <div className="flex justify-between">
              <span>Subtotal ({rentals.length + services.length} items)</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-text-light mt-3">
              After login, discounts and coupons apply on the next step.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4">
      <CheckoutFeedbackModal
        isOpen={!!checkoutModal}
        variant={checkoutModal?.variant || 'success'}
        title={checkoutModal?.title || ''}
        message={checkoutModal?.message}
        onClose={closeCheckoutModal}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-lg mx-auto">
        <button
          type="button"
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-text-light hover:text-primary-blue mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to cart
        </button>

        <h1 className="text-2xl font-bold text-text-dark mb-6 flex items-center gap-2">
          <Lock className="w-7 h-7 text-primary-blue" />
          Checkout
        </h1>

        <form onSubmit={placeOrder} className="bg-white rounded-2xl shadow border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Rental duration (months)
            </label>
            <select
              value={duration}
              onChange={(e) => {
                setDuration(Number(e.target.value));
                setCouponData(null);
              }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-blue"
            >
              {DURATIONS.map((m) => (
                <option key={m} value={m}>
                  {m} months
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="block text-sm font-medium text-text-dark mb-2">Payment option</span>
            <div className="space-y-2">
              {[
                { v: 'payNow', label: 'Pay now (full amount)' },
                { v: 'payAdvance', label: 'Pay advance (partial now)' },
                { v: 'payLater', label: 'Pay later' },
              ].map((o) => (
                <label key={o.v} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pay"
                    value={o.v}
                    checked={paymentOption === o.v}
                    onChange={() => setPaymentOption(o.v)}
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2 flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Coupon
            </label>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2"
                placeholder="Code"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="px-4 py-2 bg-gray-100 rounded-xl font-medium text-sm"
              >
                Apply
              </button>
            </div>
            {couponData && (
              <p className="text-sm text-green-600 mt-1">
                −₹{couponDiscount} ({couponData.code})
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2"
            />
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon</span>
                <span>−₹{couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {paymentDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Instant pay discount ({settings.instantPaymentDiscount}%)</span>
                <span>−₹{paymentDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2">
              <span>Total</span>
              <span>₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>
            {paymentOption === 'payAdvance' && (
              <>
                <p className="text-xs text-text-light pt-2">
                  Advance due now: ₹{advanceAmount?.toLocaleString('en-IN')} · Remaining: ₹
                  {remainingAmount?.toLocaleString('en-IN')}
                </p>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-blue text-white rounded-xl font-semibold disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Place order'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
