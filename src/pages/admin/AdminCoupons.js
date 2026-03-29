import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import { Loader2, Plus, Trash2 } from 'lucide-react';

const emptyForm = {
  code: '',
  title: '',
  description: '',
  type: 'percentage',
  value: 10,
  minAmount: 0,
  maxDiscount: 2000,
  validFrom: '',
  validUntil: '',
  applicableCategories: 'AC',
  applicableDurations: '12,24',
};

const AdminCoupons = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiService.getAdminCoupons();
    if (r.success) setList(r.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const parseCats = (s) =>
    String(s || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  const parseDurs = (s) =>
    String(s || '')
      .split(',')
      .map((x) => parseInt(x.trim(), 10))
      .filter((n) => !Number.isNaN(n));

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      value: Number(form.value),
      minAmount: Number(form.minAmount) || 0,
      maxDiscount: Number(form.maxDiscount) || 0,
      validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : undefined,
      validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
      applicableCategories: parseCats(form.applicableCategories),
      applicableDurations: parseDurs(form.applicableDurations),
    };
    const r = await apiService.createAdminCoupon(payload);
    setBusy(false);
    if (!r.success) {
      alert(r.message || 'Failed');
      return;
    }
    setForm(emptyForm);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Coupons</h1>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
            {list.length === 0 ? (
              <p className="p-6 text-slate-500">No coupons.</p>
            ) : (
              list.map((c) => (
                <div key={c._id || c.id} className="p-4 flex justify-between gap-4 items-start">
                  <div>
                    <div className="font-bold text-slate-900">{c.code}</div>
                    <div className="text-sm text-slate-600">{c.title}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {c.type} · value {c.value}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => del(c._id || c.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-fit">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" /> New coupon
          </h2>
          <form onSubmit={create} className="space-y-3 text-sm">
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="CODE"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              required
            />
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                className="border rounded-lg px-3 py-2"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="percentage">percentage</option>
                <option value="fixed">fixed</option>
              </select>
              <input
                type="number"
                className="border rounded-lg px-3 py-2"
                placeholder="Value"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                className="border rounded-lg px-3 py-2"
                placeholder="Min amount"
                value={form.minAmount}
                onChange={(e) => setForm((f) => ({ ...f, minAmount: e.target.value }))}
              />
              <input
                type="number"
                className="border rounded-lg px-3 py-2"
                placeholder="Max discount"
                value={form.maxDiscount}
                onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="datetime-local"
                className="border rounded-lg px-3 py-2"
                value={form.validFrom}
                onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
              />
              <input
                type="datetime-local"
                className="border rounded-lg px-3 py-2"
                value={form.validUntil}
                onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
              />
            </div>
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Categories (comma): AC, Refrigerator"
              value={form.applicableCategories}
              onChange={(e) => setForm((f) => ({ ...f, applicableCategories: e.target.value }))}
            />
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Durations (comma months): 12, 24"
              value={form.applicableDurations}
              onChange={(e) => setForm((f) => ({ ...f, applicableDurations: e.target.value }))}
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Create coupon'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
