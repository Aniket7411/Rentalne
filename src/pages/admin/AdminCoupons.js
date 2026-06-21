import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import { Loader2, Plus, Trash2, Edit, X, Save } from 'lucide-react';

const emptyForm = {
  code: '',
  title: '',
  description: '',
  type: 'percentage',
  value: 10,
  minAmount: 0,
  maxDiscount: 2000,
  usageLimit: '',
  userLimit: '',
  validFrom: '',
  validUntil: '',
  applicableCategories: 'AC',
  applicableDurations: '12,24',
  isActive: true,
};

const parseCats = (s) =>
  String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

const parseDurs = (s) =>
  String(s || '')
    .split(',')
    .map((x) => parseInt(x.trim(), 10))
    .filter((n) => !Number.isNaN(n));

const isoToLocal = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toISOString().slice(0, 16);
  } catch {
    return '';
  }
};

const AdminCoupons = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = create mode

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiService.getAdminCoupons();
    if (r.success) setList(r.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (coupon) => {
    setEditingId(coupon._id || coupon.id);
    setForm({
      code: coupon.code || '',
      title: coupon.title || '',
      description: coupon.description || '',
      type: coupon.type || 'percentage',
      value: coupon.value ?? 10,
      minAmount: coupon.minAmount ?? 0,
      maxDiscount: coupon.maxDiscount ?? 2000,
      usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
      userLimit: coupon.userLimit != null ? String(coupon.userLimit) : '',
      validFrom: isoToLocal(coupon.validFrom),
      validUntil: isoToLocal(coupon.validUntil),
      applicableCategories: Array.isArray(coupon.applicableCategories)
        ? coupon.applicableCategories.join(', ')
        : coupon.applicableCategories || '',
      applicableDurations: Array.isArray(coupon.applicableDurations)
        ? coupon.applicableDurations.join(', ')
        : coupon.applicableDurations || '',
      isActive: coupon.isActive !== false,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const buildPayload = () => ({
    code: form.code.trim().toUpperCase(),
    title: form.title.trim(),
    description: form.description.trim(),
    type: form.type,
    value: Number(form.value),
    minAmount: Number(form.minAmount) || 0,
    maxDiscount: Number(form.maxDiscount) || 0,
    usageLimit: form.usageLimit !== '' ? Number(form.usageLimit) : undefined,
    userLimit: form.userLimit !== '' ? Number(form.userLimit) : undefined,
    isActive: form.isActive,
    validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : undefined,
    validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
    applicableCategories: parseCats(form.applicableCategories),
    applicableDurations: parseDurs(form.applicableDurations),
  });

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    const r = await apiService.createAdminCoupon(buildPayload());
    setBusy(false);
    if (!r.success) { alert(r.message || 'Failed'); return; }
    setForm(emptyForm);
    load();
  };

  const update = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setBusy(true);
    const r = await apiService.updateAdminCoupon(editingId, buildPayload());
    setBusy(false);
    if (!r.success) { alert(r.message || 'Failed'); return; }
    cancelEdit();
    load();
  };

  const del = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    const r = await apiService.deleteAdminCoupon(id);
    if (!r.success) alert(r.message || 'Failed');
    else load();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-sky-600" />
      </div>
    );
  }

  const isEditing = editingId !== null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">

        {/* ── Left: coupon list ── */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Coupons</h1>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-[75vh] overflow-y-auto">
            {list.length === 0 ? (
              <p className="p-6 text-slate-500">No coupons yet.</p>
            ) : (
              list.map((c) => {
                const id = c._id || c.id;
                const isActive = editingId === id;
                return (
                  <div
                    key={id}
                    className={`p-4 flex justify-between gap-3 items-start ${isActive ? 'bg-sky-50' : ''}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        {c.code}
                        {isActive && (
                          <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">Editing</span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600">{c.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {c.type} · value {c.value}
                        {c.minAmount ? ` · min ₹${c.minAmount}` : ''}
                        {c.usageLimit ? ` · limit ${c.usageLimit}` : ''}
                      </div>
                      {(c.validFrom || c.validUntil) && (
                        <div className="text-xs text-slate-400">
                          {c.validFrom && `From ${new Date(c.validFrom).toLocaleDateString()}`}
                          {c.validFrom && c.validUntil && ' → '}
                          {c.validUntil && `Until ${new Date(c.validUntil).toLocaleDateString()}`}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {isActive ? (
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                          title="Cancel edit"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => del(id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: create / edit form ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-fit sticky top-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            {isEditing ? (
              <><Edit className="w-5 h-5" /> Edit coupon</>
            ) : (
              <><Plus className="w-5 h-5" /> New coupon</>
            )}
          </h2>

          <form onSubmit={isEditing ? update : create} className="space-y-3 text-sm">
            {/* Code */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Code *</label>
              <input
                className="w-full border rounded-lg px-3 py-2 uppercase"
                placeholder="SAVE20"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                required
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="20% off on 12-month rental"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Optional description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            {/* Type + Value */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Value *</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g. 20"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Min amount + Max discount */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Min order (₹)</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="0"
                  value={form.minAmount}
                  onChange={(e) => setForm((f) => ({ ...f, minAmount: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Max discount (₹)</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="2000"
                  value={form.maxDiscount}
                  onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                />
              </div>
            </div>

            {/* Usage limits */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Total usage limit</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Unlimited"
                  value={form.usageLimit}
                  onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Per user limit</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Unlimited"
                  value={form.userLimit}
                  onChange={(e) => setForm((f) => ({ ...f, userLimit: e.target.value }))}
                />
              </div>
            </div>

            {/* Valid dates */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Valid from</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.validFrom}
                  onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Valid until</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.validUntil}
                  onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Categories (comma-separated)
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="AC, Refrigerator, Washing Machine"
                value={form.applicableCategories}
                onChange={(e) => setForm((f) => ({ ...f, applicableCategories: e.target.value }))}
              />
            </div>

            {/* Durations */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Applicable durations (months, comma-separated)
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="3, 6, 9, 11, 12, 24"
                value={form.applicableDurations}
                onChange={(e) => setForm((f) => ({ ...f, applicableDurations: e.target.value }))}
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-slate-600">Active</label>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${form.isActive ? 'bg-sky-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${form.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-xs text-slate-500">{form.isActive ? 'Coupon is active' : 'Coupon is disabled'}</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              {isEditing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={busy}
                className="flex-1 py-2.5 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {busy ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                ) : isEditing ? (
                  <><Save className="w-4 h-4" />Update coupon</>
                ) : (
                  <><Plus className="w-4 h-4" />Create coupon</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
