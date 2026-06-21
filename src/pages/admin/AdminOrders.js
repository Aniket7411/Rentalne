import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../../services/api';
import {
  Loader2, RefreshCw, X, ChevronRight, Package, Wrench,
  IndianRupee, Calendar, Phone, User, MapPin, CreditCard, CheckCircle2,
  Clock, AlertCircle, Ban, Truck, Home, Hammer
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'shipped',
  'delivered', 'installed', 'completed', 'cancelled',
];
const PAYMENT_METHODS = ['cash', 'online', 'upi', 'card', 'bank_transfer'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtMoney = (v) =>
  v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '—';

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtPaymentOption = (v) => {
  if (v === 'payNow') return 'Pay Now';
  if (v === 'payAdvance') return 'Advance';
  if (v === 'payLater') return 'Pay Later';
  return v || '—';
};

const STATUS_META = {
  pending:    { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed:  { color: 'bg-blue-100 text-blue-800',    icon: CheckCircle2 },
  processing: { color: 'bg-indigo-100 text-indigo-800', icon: Package },
  shipped:    { color: 'bg-sky-100 text-sky-800',      icon: Truck },
  delivered:  { color: 'bg-teal-100 text-teal-800',    icon: Home },
  installed:  { color: 'bg-green-100 text-green-800',  icon: Hammer },
  completed:  { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  cancelled:  { color: 'bg-red-100 text-red-800',      icon: Ban },
};

const PAYMENT_META = {
  pending:  { color: 'bg-yellow-100 text-yellow-800' },
  paid:     { color: 'bg-green-100 text-green-800' },
  failed:   { color: 'bg-red-100 text-red-800' },
  refunded: { color: 'bg-purple-100 text-purple-800' },
};

const StatusBadge = ({ status, map }) => {
  const meta = map[status] || { color: 'bg-gray-100 text-gray-700' };
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {status || '—'}
    </span>
  );
};

const FILTER_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Installed', value: 'installed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

// ─── Mark-Paid Modal ──────────────────────────────────────────────────────────

const MarkPaidModal = ({ order, onClose, onSave }) => {
  const [method, setMethod] = useState('cash');
  const [ref, setRef] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    const id = order.orderId || order._id;
    const r = await apiService.patchAdminOrderPaymentStatus(id, {
      paymentStatus: 'paid',
      paymentMethod: method,
      paymentReference: ref.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setSaving(false);
    if (!r.success) { setErr(r.message || 'Failed'); return; }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-slate-900">Mark Payment Collected</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-800">
            Order <strong>{order.orderId}</strong> — Amount due:{' '}
            <strong>{fmtMoney(order.finalTotal)}</strong>
          </div>
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Payment Method *</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Payment Reference (optional)</label>
            <input
              type="text"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="UTR / transaction ID / receipt number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any remarks"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Order Detail Drawer ──────────────────────────────────────────────────────

const DetailDrawer = ({ order, onClose, onStatusChange, onMarkPaid, busyId }) => {
  const drawerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) onClose();
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (!order) return null;
  const id = order.orderId || order._id;
  const b = busyId === id || busyId === order._id;

  const rentalItems = (order.items || []).filter(i => i.type === 'rental');
  const serviceItems = (order.items || []).filter(i => i.type === 'service');
  const isPayLater = order.paymentOption === 'payLater';
  const isPayAdvance = order.paymentOption === 'payAdvance';
  const canMarkPaid = isPayLater && order.paymentStatus !== 'paid' && order.paymentStatus !== 'refunded';

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50 flex-shrink-0">
          <div>
            <div className="font-bold text-slate-900 text-lg">{order.orderId || id}</div>
            <div className="text-xs text-slate-500">{fmtDate(order.createdAt || order.orderDate)}</div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} map={STATUS_META} />
            <StatusBadge status={order.paymentStatus} map={PAYMENT_META} />
            <button onClick={onClose} className="ml-2 p-1.5 hover:bg-gray-200 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Financial Summary */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">{fmtMoney(order.total)}</span>
            </div>
            {order.productDiscount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Product discount</span>
                <span>−{fmtMoney(order.productDiscount)}</span>
              </div>
            )}
            {order.paymentDiscount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Payment discount ({fmtPaymentOption(order.paymentOption)})</span>
                <span>−{fmtMoney(order.paymentDiscount)}</span>
              </div>
            )}
            {order.couponDiscount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Coupon {order.couponCode && <strong>({order.couponCode})</strong>}</span>
                <span>−{fmtMoney(order.couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-1.5 font-bold text-base">
              <span>Final Total</span>
              <span className="text-blue-700">{fmtMoney(order.finalTotal)}</span>
            </div>
            {isPayAdvance && (
              <>
                <div className="flex justify-between text-orange-700">
                  <span>Advance paid</span>
                  <span>{fmtMoney(order.advanceAmount)}</span>
                </div>
                <div className="flex justify-between text-red-700 font-semibold">
                  <span>Remaining due</span>
                  <span>{fmtMoney(order.remainingAmount)}</span>
                </div>
              </>
            )}
          </div>

          {/* Payment + Order status controls */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Order Status</label>
              <select
                value={order.status || 'pending'}
                disabled={b}
                onChange={(e) => onStatusChange(id, e.target.value)}
                className="w-full border rounded-lg px-2 py-1.5 text-sm"
              >
                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Payment Status</label>
              <div className="flex items-center gap-2">
                <StatusBadge status={order.paymentStatus} map={PAYMENT_META} />
                {canMarkPaid && (
                  <button
                    onClick={() => onMarkPaid(order)}
                    className="text-xs px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Mark Paid
                  </button>
                )}
              </div>
              {!isPayLater && (
                <p className="text-xs text-slate-400 mt-0.5">Auto-managed by payment gateway</p>
              )}
            </div>
          </div>

          {/* Payment Option details */}
          <div className="rounded-xl border p-3 text-sm space-y-1">
            <div className="flex gap-3">
              <CreditCard className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-800">{fmtPaymentOption(order.paymentOption)}</div>
                {isPayLater && <div className="text-slate-500 text-xs">Payment collected after installation</div>}
                {isPayAdvance && (
                  <div className="text-slate-500 text-xs">
                    Advance ₹{order.advanceAmount} paid upfront · Remaining ₹{order.remainingAmount} due after install
                  </div>
                )}
                {order.paymentDetails?.paymentMethod && (
                  <div className="text-green-700 text-xs mt-0.5">
                    Collected via <strong>{order.paymentDetails.paymentMethod}</strong>
                    {order.paymentDetails.paymentReference && ` · Ref: ${order.paymentDetails.paymentReference}`}
                    {order.paymentDetails.paidAt && ` on ${fmtDate(order.paymentDetails.paidAt)}`}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          {order.customerInfo && (
            <div className="rounded-xl border p-3 text-sm space-y-1.5">
              <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-4 h-4" /> Customer
              </div>
              {order.customerInfo.name && <div className="text-slate-800 font-medium">{order.customerInfo.name}</div>}
              {order.customerInfo.phone && (
                <div className="flex items-center gap-1 text-slate-600">
                  <Phone className="w-3.5 h-3.5" /> {order.customerInfo.phone}
                </div>
              )}
              {order.customerInfo.email && <div className="text-slate-500 text-xs">{order.customerInfo.email}</div>}
              {(order.customerInfo.address?.homeAddress || order.customerInfo.homeAddress) && (
                <div className="flex items-start gap-1 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span className="text-xs">{order.customerInfo.address?.homeAddress || order.customerInfo.homeAddress}</span>
                </div>
              )}
            </div>
          )}

          {/* Rental Items */}
          {rentalItems.length > 0 && (
            <div>
              <div className="font-semibold text-slate-700 text-sm mb-2 flex items-center gap-1">
                <Package className="w-4 h-4" /> Rental Items ({rentalItems.length})
              </div>
              <div className="space-y-2">
                {rentalItems.map((item, i) => {
                  const pd = item.productDetails || item.product || {};
                  return (
                    <div key={i} className="rounded-xl border p-3 text-sm">
                      <div className="flex items-start gap-3">
                        {pd.images?.[0] && (
                          <img src={pd.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-slate-800">
                            {pd.brand} {pd.model || pd.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {pd.category} · {pd.capacity} {pd.type && `· ${pd.type}`}
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            {item.isMonthlyPayment
                              ? `Monthly ₹${item.monthlyPrice}/mo × ${item.monthlyTenure} months + deposit ₹${item.securityDeposit}`
                              : `${item.duration} months · ₹${item.price}`}
                          </div>
                          {item.deliveryInfo?.address && (
                            <div className="flex items-start gap-1 text-xs text-slate-500 mt-0.5">
                              <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              <span>{item.deliveryInfo.address}</span>
                            </div>
                          )}
                          {item.deliveryInfo?.contactPhone && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Phone className="w-3 h-3" />{item.deliveryInfo.contactName} · {item.deliveryInfo.contactPhone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Service Items */}
          {serviceItems.length > 0 && (
            <div>
              <div className="font-semibold text-slate-700 text-sm mb-2 flex items-center gap-1">
                <Wrench className="w-4 h-4" /> Service Items ({serviceItems.length})
              </div>
              <div className="space-y-2">
                {serviceItems.map((item, i) => {
                  const sd = item.serviceDetails || item.service || {};
                  const bd = item.bookingDetails || {};
                  return (
                    <div key={i} className="rounded-xl border p-3 text-sm">
                      <div className="font-medium text-slate-800">{sd.title}</div>
                      <div className="text-xs text-slate-600">₹{item.price}</div>
                      {(bd.preferredDate || bd.date) && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {bd.preferredDate || bd.date} {bd.preferredTime || bd.time && `at ${bd.preferredTime || bd.time}`}
                        </div>
                      )}
                      {bd.address && (
                        <div className="flex items-start gap-1 text-xs text-slate-500 mt-0.5">
                          <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          <span>{bd.address}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancellation */}
          {order.status === 'cancelled' && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm">
              <div className="font-semibold text-red-800 mb-1 flex items-center gap-1">
                <Ban className="w-4 h-4" /> Cancellation
              </div>
              <div className="text-red-700 text-xs">Reason: {order.cancellationReason || '—'}</div>
              {order.cancelledAt && <div className="text-red-500 text-xs mt-0.5">At: {fmtDate(order.cancelledAt)}</div>}
              {order.cancelledBy && <div className="text-red-500 text-xs">By: {order.cancelledBy}</div>}
              {order.refundAmount && (
                <div className="text-purple-700 text-xs mt-1">
                  Refund: {fmtMoney(order.refundAmount)} · Status: {order.refundStatus || '—'}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="rounded-xl border p-3 text-sm text-slate-600">
              <strong>Notes:</strong> {order.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [markPaidOrder, setMarkPaidOrder] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const r = await apiService.getAdminOrders({ limit: 200 });
    if (r.success) setOrders(r.data || []);
    else setError(r.message || 'Failed to load orders');
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const patchStatus = async (orderId, status) => {
    setBusyId(orderId);
    const r = await apiService.patchAdminOrderStatus(orderId, status);
    setBusyId(null);
    if (!r.success) { alert(r.message || 'Update failed'); return; }
    load();
    if (selected && (selected.orderId === orderId || selected._id === orderId)) {
      setSelected(prev => ({ ...prev, status }));
    }
  };

  const handleMarkPaidSave = async () => {
    setMarkPaidOrder(null);
    load();
    if (selected) {
      setSelected(prev => ({ ...prev, paymentStatus: 'paid' }));
    }
  };

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (o.orderId || '').toLowerCase().includes(q) ||
        (o.customerInfo?.name || '').toLowerCase().includes(q) ||
        (o.customerInfo?.phone || '').toLowerCase().includes(q) ||
        (o.customerInfo?.email || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Counts per tab
  const counts = {};
  orders.forEach(o => {
    counts[o.status] = (counts[o.status] || 0) + 1;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Orders</h1>
            <p className="text-slate-500 text-sm">{orders.length} orders · Click a row to view details</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search order ID, name, phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button onClick={load}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-200">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                filter === tab.value
                  ? 'text-sky-700 border-b-2 border-sky-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.value !== 'all' && counts[tab.value] > 0 && (
                <span className="ml-1 bg-slate-100 text-slate-600 text-xs rounded-full px-1.5">{counts[tab.value]}</span>
              )}
              {tab.value === 'all' && (
                <span className="ml-1 bg-slate-100 text-slate-600 text-xs rounded-full px-1.5">{orders.length}</span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 border border-red-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Order</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Amount</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Payment</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Pay. Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const key = o.orderId || o._id;
                const b = busyId === key || busyId === o._id;
                const isPayLater = o.paymentOption === 'payLater';
                const isPayAdvance = o.paymentOption === 'payAdvance';
                const canMarkPaid = isPayLater && o.paymentStatus !== 'paid' && o.paymentStatus !== 'refunded';

                return (
                  <tr
                    key={key}
                    className="border-b border-slate-100 hover:bg-sky-50/40 cursor-pointer transition-colors"
                    onClick={() => setSelected(o)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{o.orderId || key}</div>
                      <div className="text-xs text-slate-400">{(o.items || []).length} item(s)</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="font-medium text-slate-800">{o.customerInfo?.name || '—'}</div>
                      <div className="text-xs text-slate-500">{o.customerInfo?.phone || o.customerInfo?.email || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">
                      {fmtDate(o.createdAt || o.orderDate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{fmtMoney(o.finalTotal)}</div>
                      {isPayAdvance && o.advanceAmount != null && (
                        <div className="text-xs text-orange-600">Adv: {fmtMoney(o.advanceAmount)}</div>
                      )}
                      {isPayAdvance && o.remainingAmount != null && (
                        <div className="text-xs text-red-600">Due: {fmtMoney(o.remainingAmount)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isPayLater ? 'bg-amber-100 text-amber-800'
                        : isPayAdvance ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                      }`}>
                        {fmtPaymentOption(o.paymentOption)}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <select
                        className="border border-slate-200 rounded-lg px-2 py-1 text-xs max-w-[130px]"
                        value={o.status || 'pending'}
                        disabled={b}
                        onChange={(e) => patchStatus(key, e.target.value)}
                      >
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex flex-col gap-1 items-start">
                        <StatusBadge status={o.paymentStatus} map={PAYMENT_META} />
                        {canMarkPaid && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setMarkPaidOrder(o); }}
                            className="text-xs px-2 py-0.5 bg-green-600 text-white rounded-full hover:bg-green-700 font-medium"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="p-10 text-center text-slate-400">No orders found.</p>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <DetailDrawer
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={patchStatus}
          onMarkPaid={(o) => setMarkPaidOrder(o)}
          busyId={busyId}
        />
      )}

      {/* Mark Paid Modal */}
      {markPaidOrder && (
        <MarkPaidModal
          order={markPaidOrder}
          onClose={() => setMarkPaidOrder(null)}
          onSave={handleMarkPaidSave}
        />
      )}
    </div>
  );
};

export default AdminOrders;
