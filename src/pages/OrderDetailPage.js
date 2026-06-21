import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Loader2, ArrowLeft, CreditCard, XCircle, Package,
  CheckCircle2, Clock, Truck, Wrench, Home, AlertTriangle,
  Calendar, MapPin, Tag, Receipt, PhoneCall
} from 'lucide-react';
import { apiService } from '../services/api';
import { openRazorpayCheckout } from '../utils/razorpay';
import { roundMoney } from '../utils/orderHelpers';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Receipt },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
  { key: 'installed', label: 'Installed', icon: Wrench },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

const CANCELLED_STATUS = 'cancelled';

const STATUS_ORDER = STATUS_STEPS.map((s) => s.key);

function getStatusIndex(status) {
  const s = String(status || '').toLowerCase();
  const idx = STATUS_ORDER.indexOf(s);
  return idx >= 0 ? idx : 0;
}

const PAYMENT_STATUS_COLORS = {
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  refunded: 'bg-sky-100 text-sky-700 border-sky-200',
};

const ORDER_STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-sky-100 text-sky-700',
  processing: 'bg-violet-100 text-violet-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-teal-100 text-teal-700',
  installed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [refundInfo, setRefundInfo] = useState(null);

  const refreshOrder = async () => {
    const res = await apiService.getOrderById(orderId);
    if (res.success) setOrder(res.data);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await apiService.getOrderById(orderId);
      if (cancelled) return;
      if (res.success) setOrder(res.data);
      else showError(res.message || 'Order not found');
      setLoading(false);
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (order?.status?.toLowerCase() === CANCELLED_STATUS) {
      apiService.getOrderRefundStatus(orderId).then((r) => {
        if (r.success && r.data) setRefundInfo(r.data);
      });
    }
  }, [order?.status, orderId]);

  const pay = () => {
    if (!order) return;
    setPaying(true);
    const oid = order.orderId || order._id;
    const amt = order.paymentOption === 'payAdvance' && order.advanceAmount != null
      ? order.advanceAmount : order.finalTotal;
    const amtRupees = roundMoney(amt);

    const openGateway = (d, verifyMode) => {
      const rzpOrderId = d.razorpayOrderId || d.razorpay_order_id;
      if (!d.key || !rzpOrderId) { setPaying(false); showError('Invalid payment session'); return; }
      return openRazorpayCheckout({
        key: d.key,
        orderId: rzpOrderId,
        prefill: { email: user?.email, contact: user?.phone },
        onSuccess: async (response) => {
          const gatewayBody = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };
          let v;
          if (verifyMode === 'order') {
            v = await apiService.verifyOrderGatewayPayment(oid, gatewayBody);
          } else {
            v = await apiService.verifyRazorpayPayment({ ...gatewayBody, paymentId: d.paymentId });
          }
          setPaying(false);
          if (v.success) { success('Payment successful!'); await refreshOrder(); }
          else showError(v.message || 'Verification failed');
        },
        onDismiss: () => setPaying(false),
      });
    };

    apiService.createRazorpayPaymentOrder(oid, amtRupees).then((payRes) => {
      if (payRes.success && payRes.data) return openGateway(payRes.data, 'payments');
      if (payRes.error === 'ORDER_ALREADY_PAID') { setPaying(false); showError('Order is already paid'); return; }
      return apiService.createOrderRetryRazorpay(oid, Math.round(Number(amtRupees) * 100)).then((retryRes) => {
        if (!retryRes.success || !retryRes.data) { showError(retryRes.message || 'Payment failed'); setPaying(false); return; }
        return openGateway(retryRes.data, 'order');
      });
    }).catch(() => { setPaying(false); showError('Payment error'); });
  };

  const cancel = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) { showError('Please provide a cancellation reason'); return; }
    setCancelling(true);
    const oid = order.orderId || order._id;
    const res = await apiService.cancelOrder(oid, cancelReason.trim());
    setCancelling(false);
    if (res.success) {
      success(res.message || 'Order cancelled');
      setCancelOpen(false);
      await refreshOrder();
    } else {
      showError(res.message || 'Cancellation failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <Package className="w-14 h-14 text-slate-300" />
        <p className="text-slate-500 font-medium">Order not found</p>
        <Link to="/user/dashboard" className="text-sky-500 font-semibold hover:underline">Go to Dashboard</Link>
      </div>
    );
  }

  const isCancelled = order.status?.toLowerCase() === CANCELLED_STATUS;
  const isCompleted = order.status?.toLowerCase() === 'completed';
  const canPay = order.paymentStatus === 'pending' && !isCancelled && !isCompleted;
  const canCancel = !isCancelled && !isCompleted;
  const statusIdx = getStatusIndex(order.status);

  const items = order.items || [];
  const rentalItems = items.filter((i) => i.type === 'rental');
  const serviceItems = items.filter((i) => i.type === 'service');

  const payOptLabel = { payNow: 'Paid in Full', payAdvance: 'Advance Payment', payLater: 'Pay Later' };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-3xl mx-auto">
        <button type="button" onClick={() => navigate('/user/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-sky-600 mb-5 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Order ID</p>
              <h1 className="text-xl font-bold text-slate-900">{order.orderId || order._id}</h1>
              {order.orderDate && (
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${ORDER_STATUS_COLORS[order.status?.toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>
                {order.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${PAYMENT_STATUS_COLORS[order.paymentStatus?.toLowerCase()] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Status timeline */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4 overflow-x-auto">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Order Progress</h2>
            <div className="flex items-start gap-0 min-w-max">
              {STATUS_STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = i <= statusIdx;
                const current = i === statusIdx;
                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        done ? (current ? 'bg-sky-500 ring-4 ring-sky-100' : 'bg-emerald-500') : 'bg-slate-200'
                      }`}>
                        <Icon className={`w-4 h-4 ${done ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`w-10 h-0.5 ${i < statusIdx ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                      )}
                    </div>
                    <p className={`text-[10px] mt-1.5 text-center w-14 leading-tight ${done ? 'text-slate-700 font-semibold' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">Order Cancelled</p>
              {order.cancellationReason && <p className="text-xs text-red-600 mt-0.5">{order.cancellationReason}</p>}
            </div>
          </div>
        )}

        {/* Refund info */}
        {isCancelled && refundInfo && (
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 mb-4">
            <p className="text-sm font-semibold text-sky-700 mb-1">Refund Status</p>
            <p className="text-xs text-sky-600">
              Status: <strong className="capitalize">{refundInfo.status}</strong>
              {refundInfo.amount != null && <> · Amount: ₹{Number(refundInfo.amount).toLocaleString('en-IN')}</>}
            </p>
          </div>
        )}

        {order.refundDisplayMessage && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <p className="text-sm text-amber-800">{order.refundDisplayMessage}</p>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4 space-y-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-sky-500" />
            Order Items
          </h2>

          {rentalItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Rentals</p>
              <div className="space-y-3">
                {rentalItems.map((item, idx) => {
                  const prod = item.productId || item.product || {};
                  const name = prod.name || [prod.brand, prod.model].filter(Boolean).join(' ') || item.productDetails?.name || 'Rental Appliance';
                  const image = prod.images?.[0] || item.productDetails?.images?.[0] || null;
                  return (
                    <div key={idx} className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                      {image && (
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-white flex-shrink-0">
                          <img src={image} alt={name} className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm line-clamp-1">{name}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.duration && (
                            <span className="text-xs text-slate-500 flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> {item.duration} months
                            </span>
                          )}
                          {item.quantity > 1 && (
                            <span className="text-xs text-slate-500">Qty: {item.quantity}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-slate-800">
                          ₹{Number(item.price || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {serviceItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Services</p>
              <div className="space-y-3">
                {serviceItems.map((item, idx) => {
                  const svc = item.serviceId || item.service || {};
                  const title = svc.title || item.serviceDetails?.title || 'Service';
                  return (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{title}</p>
                        {item.bookingDetails?.date && (
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {item.bookingDetails.date}
                            {item.bookingDetails.time && ` · ${item.bookingDetails.time}`}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-800">₹{Number(item.price || 0).toLocaleString('en-IN')}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Pricing breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
          <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-sky-500" />
            Payment Summary
          </h2>
          <div className="space-y-2 text-sm">
            {order.total != null && (
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{Number(order.total).toLocaleString('en-IN')}</span>
              </div>
            )}
            {Number(order.couponDiscount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Coupon discount {order.couponCode && `(${order.couponCode})`}</span>
                <span>−₹{Number(order.couponDiscount).toLocaleString('en-IN')}</span>
              </div>
            )}
            {Number(order.paymentDiscount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Payment discount</span>
                <span>−₹{Number(order.paymentDiscount).toLocaleString('en-IN')}</span>
              </div>
            )}
            {Number(order.productDiscount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Product discount</span>
                <span>−₹{Number(order.productDiscount).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-100 pt-2">
              <span>Total</span>
              <span>₹{Number(order.finalTotal || 0).toLocaleString('en-IN')}</span>
            </div>
            {order.paymentOption && (
              <div className="flex justify-between text-slate-500 text-xs pt-1">
                <span>Payment method</span>
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {payOptLabel[order.paymentOption] || order.paymentOption}
                </span>
              </div>
            )}
            {order.paymentOption === 'payAdvance' && order.advanceAmount != null && (
              <div className="bg-sky-50 rounded-xl p-3 mt-2 space-y-1 text-xs">
                <div className="flex justify-between text-sky-700">
                  <span>Advance paid</span>
                  <span className="font-semibold">₹{Number(order.advanceAmount).toLocaleString('en-IN')}</span>
                </div>
                {order.remainingAmount != null && (
                  <div className="flex justify-between text-sky-600">
                    <span>Remaining at delivery</span>
                    <span>₹{Number(order.remainingAmount).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delivery address */}
        {(order.customerInfo?.homeAddress || order.deliveryAddresses?.[0]?.line1) && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
            <h2 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-500" />
              Delivery Address
            </h2>
            <p className="text-sm text-slate-600">
              {order.customerInfo?.homeAddress || order.deliveryAddresses?.[0]?.line1}
            </p>
            {(order.customerInfo?.pincode || order.deliveryAddresses?.[0]?.pincode) && (
              <p className="text-sm text-slate-500 mt-0.5">
                Pincode: {order.customerInfo?.pincode || order.deliveryAddresses?.[0]?.pincode}
              </p>
            )}
            {order.customerInfo?.phone && (
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                <PhoneCall className="w-3 h-3" /> {order.customerInfo.phone}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          {canPay && (
            <button
              type="button"
              onClick={pay}
              disabled={paying}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 disabled:opacity-50 transition-colors"
            >
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              {paying ? 'Processing…' : `Pay ₹${Number(order.paymentOption === 'payAdvance' && order.advanceAmount != null ? order.advanceAmount : order.finalTotal).toLocaleString('en-IN')}`}
            </button>
          )}

          {canCancel && (
            <div>
              {!cancelOpen ? (
                <button
                  type="button"
                  onClick={() => setCancelOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Order
                </button>
              ) : (
                <form onSubmit={cancel} className="space-y-3">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm font-semibold text-red-700 mb-2">Confirm Cancellation</p>
                    <p className="text-xs text-red-600 mb-3">
                      If payment was made, a refund will be processed according to our refund policy.
                    </p>
                    <textarea
                      required
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Reason for cancellation (required)"
                      rows={3}
                      className="w-full border border-red-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none resize-none bg-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={cancelling}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                      {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCancelOpen(false); setCancelReason(''); }}
                      className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
                    >
                      Keep Order
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <Link
            to="/user/dashboard"
            className="block text-center text-sm text-slate-500 hover:text-sky-600 py-1"
          >
            ← Back to all orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
