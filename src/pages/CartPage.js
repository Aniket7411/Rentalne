import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2, ShoppingBag, ArrowRight, Loader2, Package, ChevronRight,
  Zap, ShieldCheck, Clock, Tag, X, CreditCard, Plus,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { defaultBrowsePath } from '../utils/browseUrls';
import { apiService } from '../services/api';

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

function round(n) {
  return Math.round((n || 0) * 100) / 100;
}

const STATUS_COLORS = {
  Available: 'text-emerald-600 bg-emerald-50',
  'Rented Out': 'text-amber-600 bg-amber-50',
  'Under Maintenance': 'text-red-600 bg-red-50',
};

const PAY_OPTS = [
  { v: 'payNow',     label: 'Pay Now',     sub: 'Full amount upfront',              icon: Zap,         ring: 'ring-emerald-400', bg: 'bg-emerald-50 border-emerald-300', chip: 'bg-emerald-500', color: 'text-emerald-600' },
  { v: 'payAdvance', label: 'Pay Advance', sub: 'Small advance, rest at delivery',  icon: ShieldCheck, ring: 'ring-sky-400',     bg: 'bg-sky-50 border-sky-300',         chip: 'bg-sky-500',     color: 'text-sky-600' },
  { v: 'payLater',   label: 'Pay Later',   sub: 'Pay after our team installs',      icon: Clock,       ring: 'ring-amber-400',  bg: 'bg-amber-50 border-amber-300',     chip: null,             color: 'text-amber-600' },
];

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, loading, refreshCart, removeFromCart } = useCart();
  const { user } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();

  const rentals = useMemo(() => cart.rentals || [], [cart.rentals]);
  const services = useMemo(() => cart.services || [], [cart.services]);

  const [itemDurations, setItemDurations] = useState(() => {
    const init = {};
    (cart.rentals || []).forEach((r) => {
      const id = r._id || r.id;
      init[id] = firstAvailableDuration(r.price || r.product?.price);
    });
    return init;
  });

  const [paymentOption, setPaymentOption] = useState('payAdvance');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [settings, setSettings] = useState({ instantPaymentDiscount: 10, advancePaymentDiscount: 5, advancePaymentAmount: 500 });

  useEffect(() => {
    apiService.getSettings().then((r) => {
      if (r.success && r.data) setSettings((p) => ({ ...p, ...r.data }));
    });
  }, []);

  useEffect(() => {
    const init = {};
    (cart.rentals || []).forEach((r) => {
      const id = r._id || r.id;
      if (!itemDurations[id]) init[id] = firstAvailableDuration(r.price || r.product?.price);
    });
    if (Object.keys(init).length) setItemDurations((p) => ({ ...p, ...init }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.rentals]);

  const setDuration = (itemId, months) =>
    setItemDurations((prev) => ({ ...prev, [itemId]: months }));

  const removeLine = async (itemId) => {
    const res = await removeFromCart(itemId);
    if (res.success) {
      success('Item removed');
      await refreshCart();
    } else {
      showError(res.message || 'Could not remove item');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponBusy(true);
    const uid = user?.id || user?._id;
    const items = rentals.map((r) => {
      const id = r._id || r.id;
      const dur = itemDurations[id] || firstAvailableDuration(r.price || r.product?.price);
      return { type: 'rental', category: r.product?.category || 'AC', duration: Number(dur) };
    });
    const res = await apiService.validateCoupon({
      code: couponCode.trim(),
      orderTotal: rentalSubtotal + serviceSubtotal,
      userId: uid,
      items,
    });
    setCouponBusy(false);
    if (res.success) { setCouponData(res.data); success('Coupon applied!'); }
    else { setCouponData(null); showError(res.message || 'Invalid coupon'); }
  };

  const rentalSubtotal = useMemo(() => {
    let sum = 0;
    rentals.forEach((r) => {
      const id = r._id || r.id;
      const dur = itemDurations[id] || firstAvailableDuration(r.price || r.product?.price);
      const price = priceForDuration(r.price || r.product?.price, dur);
      if (price != null) sum += price * (r.quantity || 1);
    });
    return sum;
  }, [rentals, itemDurations]);

  const serviceSubtotal = useMemo(
    () => services.reduce((s, svc) => s + (Number(svc.servicePrice) || 0), 0),
    [services]
  );

  const subtotal = rentalSubtotal + serviceSubtotal;
  const couponDiscount = couponData?.discountAmount ? round(Number(couponData.discountAmount)) : 0;
  const afterCoupon = round(Math.max(0, subtotal - couponDiscount));

  const payNowDiscount = round(afterCoupon * ((Number(settings.instantPaymentDiscount) || 0) / 100));
  const payAdvDiscount = round(afterCoupon * ((Number(settings.advancePaymentDiscount) || 0) / 100));
  const advanceAmount  = round(Math.min(Number(settings.advancePaymentAmount) || 500, afterCoupon - payAdvDiscount));

  const totalDiscount = paymentOption === 'payNow' ? payNowDiscount : paymentOption === 'payAdvance' ? payAdvDiscount : 0;
  const finalTotal = round(Math.max(0, afterCoupon - totalDiscount));
  const atDelivery = round(Math.max(0, finalTotal - advanceAmount));

  const count = rentals.length + services.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-9 h-9 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 pt-3 pb-8 px-3 sm:px-5 lg:px-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-5xl mx-auto">

        {/* Page title */}
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="w-5 h-5 text-sky-500" />
          <h1 className="text-lg font-bold text-slate-900">
            Your Cart{count > 0 && <span className="ml-2 text-sm font-normal text-slate-500">({count} item{count !== 1 ? 's' : ''})</span>}
          </h1>
        </div>

        {count === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="font-semibold text-slate-600 mb-1">Your cart is empty</p>
            <p className="text-sm text-slate-400 mb-5">Browse our appliances and add rentals to get started.</p>
            <Link to={defaultBrowsePath()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-colors text-sm">
              Browse Appliances <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-start">

            {/* ─── Left: items ─── */}
            <div className="flex-1 min-w-0 space-y-3">

              {rentals.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rental Appliances</p>
                    <p className="text-xs text-slate-400">{rentals.length} item{rentals.length !== 1 ? 's' : ''}</p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {rentals.map((line) => {
                      const id = line._id || line.id;
                      const product = line.product || {};
                      const priceObj = line.price || product.price || {};
                      const selDur = itemDurations[id] || firstAvailableDuration(priceObj);
                      const selPrice = priceForDuration(priceObj, selDur);
                      const qty = line.quantity || 1;
                      const lineTotal = selPrice != null ? selPrice * qty : null;
                      const image = product.images?.[0] || null;
                      const name = product.name || [product.brand, product.model].filter(Boolean).join(' ') || 'Rental Appliance';
                      const subtitle = [product.capacity, product.type].filter(Boolean).join(' · ');
                      const status = product.status;

                      return (
                        <div key={id} className="p-4">
                          <div className="flex gap-3">
                            {/* Thumbnail */}
                            <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                              {image ? (
                                <img src={image} alt={name} className="w-full h-full object-cover"
                                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=200&q=60'; }} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-7 h-7 text-slate-300" />
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-slate-900 text-sm leading-snug truncate">{name}</h3>
                                  {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
                                  {status && (
                                    <span className={`inline-block text-[10px] font-semibold rounded-full px-2 py-0.5 mt-1 ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-500'}`}>
                                      {status}
                                    </span>
                                  )}
                                </div>
                                <button type="button" onClick={() => removeLine(id)} aria-label="Remove"
                                  className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="flex items-end justify-between mt-2">
                                {qty > 1 && <span className="text-xs text-slate-400">×{qty}</span>}
                                {lineTotal != null ? (
                                  <span className="text-base font-bold text-sky-600 ml-auto">₹{lineTotal.toLocaleString('en-IN')}</span>
                                ) : (
                                  <span className="text-sm text-slate-400 ml-auto">Price on request</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Duration chips */}
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rental Duration</p>
                            <div className="flex flex-wrap gap-1.5">
                              {DURATIONS.map((m) => {
                                const p = priceForDuration(priceObj, m);
                                const isSel = selDur === m;
                                return (
                                  <button key={m} type="button" disabled={p == null}
                                    onClick={() => p != null && setDuration(id, m)}
                                    className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all ${
                                      p == null ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                        : isSel ? 'bg-sky-500 text-white shadow-sm'
                                          : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-600 border border-slate-200'
                                    }`}>
                                    {m}m
                                    {p != null && (
                                      <span className={`ml-1 font-normal ${isSel ? 'text-sky-100' : 'text-slate-400'}`}>
                                        ₹{p.toLocaleString('en-IN')}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {services.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Services</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {services.map((line) => {
                      const id = line._id || line.id;
                      return (
                        <div key={id} className="p-4 flex items-center gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-sm">{line.serviceTitle}</p>
                            {line.bookingDetails?.date && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                {line.bookingDetails.date}{line.bookingDetails.time && ` · ${line.bookingDetails.time}`}
                              </p>
                            )}
                            <p className="text-base font-bold text-sky-600 mt-1">₹{Number(line.servicePrice || 0).toLocaleString('en-IN')}</p>
                          </div>
                          <button type="button" onClick={() => removeLine(id)} aria-label="Remove"
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <Link to={defaultBrowsePath()} className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:underline px-1">
                <Plus className="w-3.5 h-3.5" /> Add more items
              </Link>
            </div>

            {/* ─── Right: summary panel ─── */}
            <div className="w-full lg:w-[340px] flex-shrink-0 lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

                {/* Payment option selector */}
                <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 mb-3">
                    <CreditCard className="w-4 h-4 text-sky-500" />
                    <p className="text-sm font-bold text-slate-800">Payment Option</p>
                  </div>
                  <div className="space-y-2">
                    {PAY_OPTS.map((opt) => {
                      const Icon = opt.icon;
                      const isSel = paymentOption === opt.v;
                      const discPct = opt.v === 'payNow' ? Number(settings.instantPaymentDiscount) || 0
                        : opt.v === 'payAdvance' ? Number(settings.advancePaymentDiscount) || 0 : 0;
                      const saveAmt = opt.v === 'payNow' ? payNowDiscount
                        : opt.v === 'payAdvance' ? payAdvDiscount : 0;

                      return (
                        <button key={opt.v} type="button" onClick={() => setPaymentOption(opt.v)}
                          className={`w-full text-left rounded-xl border-2 px-3 py-2.5 transition-all ${
                            isSel ? opt.bg : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                          }`}>
                          <div className="flex items-center gap-2">
                            {/* radio dot */}
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSel ? 'border-sky-500 bg-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSel && <div className="w-2 h-2 rounded-full bg-sky-500" />}
                            </div>
                            <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSel ? opt.color : 'text-slate-400'}`} />
                            <span className={`text-xs font-semibold flex-1 ${isSel ? 'text-slate-900' : 'text-slate-600'}`}>{opt.label}</span>
                            {discPct > 0 && (
                              <span className={`text-[10px] font-bold text-white rounded-full px-1.5 py-0.5 leading-none ${opt.chip}`}>
                                {discPct}% off
                              </span>
                            )}
                          </div>

                          {/* Collapsed hint */}
                          {!isSel && <p className="text-[10px] text-slate-400 mt-1 ml-6 pl-0.5">{opt.sub}</p>}

                          {/* Expanded detail */}
                          {isSel && (
                            <div className="mt-2 ml-6 space-y-1.5">
                              {opt.v === 'payNow' && (
                                <>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">You pay</span>
                                    <span className="font-bold text-slate-900">₹{finalTotal.toLocaleString('en-IN')}</span>
                                  </div>
                                  {saveAmt > 0 && (
                                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                      <Zap className="w-3 h-3" /> Save ₹{saveAmt.toLocaleString('en-IN')} instantly
                                    </p>
                                  )}
                                </>
                              )}
                              {opt.v === 'payAdvance' && (
                                <>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <div className="bg-sky-500/10 rounded-lg p-2 text-center">
                                      <p className="text-[9px] text-slate-500 mb-0.5">Pay now</p>
                                      <p className="text-xs font-bold text-sky-600">₹{advanceAmount.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="bg-slate-100 rounded-lg p-2 text-center">
                                      <p className="text-[9px] text-slate-500 mb-0.5">At delivery</p>
                                      <p className="text-xs font-bold text-slate-700">₹{atDelivery.toLocaleString('en-IN')}</p>
                                    </div>
                                  </div>
                                  {saveAmt > 0 && (
                                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3" /> Save ₹{saveAmt.toLocaleString('en-IN')} on advance
                                    </p>
                                  )}
                                </>
                              )}
                              {opt.v === 'payLater' && (
                                <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> No payment now — pay after installation
                                </p>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Coupon */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Tag className="w-3.5 h-3.5 text-sky-500" />
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Coupon Code</p>
                  </div>
                  {couponData ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                      <div>
                        <p className="text-xs font-bold text-emerald-700">{couponData.code}</p>
                        <p className="text-[11px] text-emerald-600">−₹{couponDiscount.toLocaleString('en-IN')} off</p>
                      </div>
                      <button type="button" onClick={() => { setCouponCode(''); setCouponData(null); }}
                        className="text-emerald-400 hover:text-emerald-700 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                        placeholder="Enter code"
                        className="flex-1 min-w-0 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase tracking-wide focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none bg-slate-50 focus:bg-white transition-colors"
                      />
                      <button type="button" onClick={applyCoupon}
                        disabled={couponBusy || !couponCode.trim()}
                        className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex-shrink-0 flex items-center">
                        {couponBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Order summary */}
                <div className="px-4 py-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Order Summary</p>
                  <div className="space-y-2">
                    {rentals.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Rentals ({rentals.length})</span>
                        <span className="text-slate-700 font-medium">₹{rentalSubtotal.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {services.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Services ({services.length})</span>
                        <span className="text-slate-700 font-medium">₹{serviceSubtotal.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>Coupon ({couponData?.code})</span>
                        <span className="font-medium">−₹{couponDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>{paymentOption === 'payNow' ? 'Instant pay discount' : 'Advance discount'}</span>
                        <span className="font-medium">−₹{totalDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                    <span className="font-bold text-slate-900">Total</span>
                    <div className="text-right">
                      <p className="text-xl font-bold text-sky-600">₹{finalTotal.toLocaleString('en-IN')}</p>
                      {totalDiscount > 0 && (
                        <p className="text-[10px] text-slate-400 line-through">₹{subtotal.toLocaleString('en-IN')}</p>
                      )}
                    </div>
                  </div>

                  {paymentOption === 'payAdvance' && (
                    <p className="text-xs text-slate-400 mt-1.5">
                      Pay ₹{advanceAmount.toLocaleString('en-IN')} now · ₹{atDelivery.toLocaleString('en-IN')} at delivery
                    </p>
                  )}
                  {paymentOption === 'payLater' && (
                    <p className="text-xs text-amber-600 font-medium mt-1.5">Full amount collected after installation</p>
                  )}

                  <button type="button" onClick={() => navigate('/checkout')}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 active:scale-[0.98] transition-all text-sm shadow-sm">
                    Proceed to Checkout <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
