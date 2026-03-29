import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import { Loader2, Trash2, Plus } from 'lucide-react';

const AdminFaqs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ question: '', answer: '', category: 'general' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiService.getFaqs();
    if (r.success) setItems(r.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return;
    setBusy(true);
    const r = await apiService.createAdminFaq({
      question: form.question.trim(),
      answer: form.answer.trim(),
      category: form.category.trim() || 'general',
    });
    setBusy(false);
    if (!r.success) {
      alert(r.message || 'Failed');
      return;
    }
    setForm({ question: '', answer: '', category: 'general' });
    load();
  };

  const del = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    const r = await apiService.deleteAdminFaq(id);
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
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-slate-900">Manage FAQs</h1>
        <form onSubmit={add} className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add FAQ
          </h2>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Question"
            value={form.question}
            onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
            required
          />
          <textarea
            className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
            placeholder="Answer"
            value={form.answer}
            onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2 rounded-lg bg-sky-600 text-white font-semibold disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Create'}
          </button>
        </form>
        <div className="space-y-3">
          {items.map((f) => {
            const id = f._id || f.id;
            return (
              <div
                key={id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex justify-between gap-4"
              >
                <div>
                  <div className="text-xs uppercase text-slate-500">{f.category}</div>
                  <div className="font-semibold text-slate-900">{f.question}</div>
                  <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{f.answer}</p>
                </div>
                <button
                  type="button"
                  onClick={() => del(id)}
                  className="shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg h-fit"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminFaqs;
