import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Loader2, RefreshCw, ExternalLink } from 'lucide-react';

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'installed',
  'completed',
  'cancelled',
];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const r = await apiService.getAdminOrders({ limit: 100 });
    if (r.success) setOrders(r.data || []);
    else setError(r.message || 'Failed to load orders');
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patchStatus = async (orderId, status) => {
    setBusyId(orderId);
    const r = await apiService.patchAdminOrderStatus(orderId, status);
    setBusyId(null);
    if (!r.success) {
      alert(r.message || 'Update failed');
      return;
    }
    load();
  };

  const patchPayment = async (orderId, paymentStatus) => {
    setBusyId(orderId);
    const r = await apiService.patchAdminOrderPaymentStatus(orderId, paymentStatus);
    setBusyId(null);
    if (!r.success) {
      alert(r.message || 'Update failed');
      return;
    }
    load();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All orders</h1>
            <p className="text-slate-600 text-sm">
              Fulfillment and payment (pay-later can be marked paid here per API).
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 border border-red-100">{error}</div>
        )}
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-3 font-semibold text-slate-700">Order</th>
                <th className="text-left p-3 font-semibold text-slate-700">Total</th>
                <th className="text-left p-3 font-semibold text-slate-700">Payment option</th>
                <th className="text-left p-3 font-semibold text-slate-700">Status</th>
                <th className="text-left p-3 font-semibold text-slate-700">Payment</th>
                <th className="text-left p-3 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const key = o.orderId || o._id;
                const id = o._id || o.orderId;
                const linkId = encodeURIComponent(key);
                const b = busyId === key || busyId === id;
                return (
                  <tr key={key} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{o.orderId || id}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[180px]">
                        {o.customerInfo?.name || o.customerInfo?.email || '—'}
                      </div>
                    </td>
                    <td className="p-3">₹{Number(o.finalTotal || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3">{o.paymentOption || '—'}</td>
                    <td className="p-3">
                      <select
                        className="border border-slate-200 rounded-lg px-2 py-1 max-w-[160px]"
                        value={o.status || 'pending'}
                        disabled={b}
                        onChange={(e) => patchStatus(key, e.target.value)}
                      >
                        {[
                          ...(ORDER_STATUSES.includes(o.status) ? [] : [o.status].filter(Boolean)),
                          ...ORDER_STATUSES,
                        ]
                          .filter((v, i, a) => v && a.indexOf(v) === i)
                          .map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <select
                        className="border border-slate-200 rounded-lg px-2 py-1 max-w-[130px]"
                        value={o.paymentStatus || 'pending'}
                        disabled={b}
                        onChange={(e) => patchPayment(key, e.target.value)}
                      >
                        {[
                          ...(PAYMENT_STATUSES.includes(o.paymentStatus)
                            ? []
                            : [o.paymentStatus].filter(Boolean)),
                          ...PAYMENT_STATUSES,
                        ]
                          .filter((v, i, a) => v && a.indexOf(v) === i)
                          .map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <Link
                        to={`/orders/${linkId}`}
                        className="inline-flex items-center gap-1 text-sky-600 font-medium hover:underline"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="p-8 text-center text-slate-500">No orders found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
