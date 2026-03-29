import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Loader2, Save } from 'lucide-react';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    instantPaymentDiscount: 10,
    advancePaymentDiscount: 5,
    advancePaymentAmount: 500,
  });

  useEffect(() => {
    (async () => {
      const r = await apiService.getAdminSettings();
      if (r.success && r.data && typeof r.data === 'object') {
        setForm((f) => ({
          ...f,
          instantPaymentDiscount: Number(r.data.instantPaymentDiscount ?? f.instantPaymentDiscount),
          advancePaymentDiscount: Number(r.data.advancePaymentDiscount ?? f.advancePaymentDiscount),
          advancePaymentAmount: Number(r.data.advancePaymentAmount ?? f.advancePaymentAmount),
        }));
      }
      setLoading(false);
    })();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const r = await apiService.updateAdminSettings({
      instantPaymentDiscount: Number(form.instantPaymentDiscount),
      advancePaymentDiscount: Number(form.advancePaymentDiscount),
      advancePaymentAmount: Number(form.advancePaymentAmount),
    });
    setSaving(false);
    setMessage(r.success ? 'Saved.' : r.message || 'Save failed');
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
      <div className="max-w-lg mx-auto bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Checkout discounts</h1>
        <p className="text-sm text-slate-600 mb-6">
          Matches public <code className="text-xs bg-slate-100 px-1 rounded">GET /settings</code> — used on
          checkout labels.
        </p>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Instant payment discount (%)
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
              value={form.instantPaymentDiscount}
              onChange={(e) =>
                setForm((f) => ({ ...f, instantPaymentDiscount: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Advance payment discount (%)
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
              value={form.advancePaymentDiscount}
              onChange={(e) =>
                setForm((f) => ({ ...f, advancePaymentDiscount: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Advance amount (₹)
            </label>
            <input
              type="number"
              step="1"
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
              value={form.advancePaymentAmount}
              onChange={(e) =>
                setForm((f) => ({ ...f, advancePaymentAmount: e.target.value }))
              }
            />
          </div>
          {message && (
            <p className={`text-sm ${message === 'Saved.' ? 'text-green-700' : 'text-red-700'}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
