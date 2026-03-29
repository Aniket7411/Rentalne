import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, CreditCard, XCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { openRazorpayCheckout } from '../utils/razorpay';
import { roundMoney } from '../utils/orderHelpers';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

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
      else showError(res.message);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    const fetchRefund = async () => {
      const r = await apiService.getOrderRefundStatus(orderId);
      if (r.success && r.data) setRefundInfo(r.data);
    };
    if (order?.status === 'cancelled') fetchRefund();
  }, [order?.status, orderId]);

  const pay = () => {
    if (!order) return;
    setPaying(true);
    const oid = order.orderId || order._id;
    const amt =
      order.paymentOption === 'payAdvance' && order.advanceAmount != null
        ? order.advanceAmount
        : order.finalTotal;
    const amtRupees = roundMoney(amt);

    const openGateway = (d, verifyMode) => {
      const rzpOrderId = d.razorpayOrderId || d.razorpay_order_id;
      if (!d.key || !rzpOrderId) {
        setPaying(false);
        showError('Invalid payment session from server');
        return;
      }
      return openRazorpayCheckout({
        key: d.key,
        orderId: rzpOrderId,
        prefill: {
          email: user?.email,
          contact: user?.phone,
        },
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
            v = await apiService.verifyRazorpayPayment({
              ...gatewayBody,
              paymentId: d.paymentId,
            });
          }
          setPaying(false);
          if (v.success) {
            success('Payment successful');
            await refreshOrder();
          } else {
            showError(
              v.error
                ? `${v.message || 'Verification failed'} (${v.error})`
                : v.message || 'Verification failed'
            );
          }
        },
        onDismiss: () => setPaying(false),
      });
    };

    apiService
      .createRazorpayPaymentOrder(oid, amtRupees)
      .then((payRes) => {
        if (payRes.success && payRes.data) {
          return openGateway(payRes.data, 'payments');
        }
        if (payRes.error === 'ORDER_ALREADY_PAID') {
          setPaying(false);
          showError(payRes.message || 'Order is already paid');
          return;
        }
        return apiService
          .createOrderRetryRazorpay(oid, Math.round(Number(amtRupees) * 100))
          .then((retryRes) => {
            if (!retryRes.success || !retryRes.data) {
              const msg = retryRes.error
                ? `${retryRes.message || 'Payment failed'} (${retryRes.error})`
                : payRes.error
                  ? `${payRes.message || 'Payment failed'} (${payRes.error})`
                  : retryRes.message || payRes.message || 'Payment failed';
              showError(msg);
              setPaying(false);
              return;
            }
            return openGateway(retryRes.data, 'order');
          });
      })
      .catch(() => {
        setPaying(false);
        showError('Payment error');
      });
  };

  const cancel = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      showError('Cancellation reason is required');
      return;
    }
    const oid = order.orderId || order._id;
    const res = await apiService.cancelOrder(oid, cancelReason.trim());
    if (res.success) {
      success(res.message || 'Order cancelled');
      setCancelOpen(false);
      await refreshOrder();
    } else showError(res.message);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-blue" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-text-light">Order not found</p>
        <Link to="/user/dashboard" className="text-primary-blue font-semibold">
          Dashboard
        </Link>
      </div>
    );
  }

  const canPay =
    order.paymentStatus === 'pending' &&
    order.status !== 'cancelled' &&
    order.status !== 'completed';

  const canCancel =
    order.status !== 'cancelled' && order.status !== 'completed';

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/user/dashboard')}
          className="flex items-center gap-2 text-text-light hover:text-primary-blue mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 space-y-4">
          <h1 className="text-2xl font-bold text-text-dark">
            Order {order.orderId || order._id}
          </h1>
          <p className="text-sm text-text-light">
            Status: <strong className="text-text-dark">{order.status}</strong> · Payment:{' '}
            <strong className="text-text-dark">{order.paymentStatus}</strong>
          </p>
          <p className="text-xl font-semibold text-primary-blue">
            ₹{Number(order.finalTotal || 0).toLocaleString('en-IN')}
          </p>

          {order.refundDisplayMessage && (
            <p className="text-sm text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-100">
              {order.refundDisplayMessage}
            </p>
          )}

          {canPay && (
            <button
              type="button"
              onClick={pay}
              disabled={paying}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-blue text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {paying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              Pay with Razorpay
            </button>
          )}

          {canCancel && (
            <div className="pt-2 border-t border-gray-100">
              {!cancelOpen ? (
                <button
                  type="button"
                  onClick={() => setCancelOpen(true)}
                  className="inline-flex items-center gap-2 text-red-600 font-medium text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel order
                </button>
              ) : (
                <form onSubmit={cancel} className="space-y-3 max-w-md">
                  <textarea
                    required
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Cancellation reason (required)"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
                    >
                      Confirm cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setCancelOpen(false)}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {order.status === 'cancelled' && refundInfo && (
            <p className="text-sm text-text-light pt-2 border-t">
              Refund status: <strong>{refundInfo.status}</strong>
              {refundInfo.amount != null && (
                <> · ₹{Number(refundInfo.amount).toLocaleString('en-IN')}</>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
