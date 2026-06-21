import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import { Loader2, RefreshCw, ChevronRight, X, Send } from 'lucide-react';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

const AdminTickets = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  // Detail drawer
  const [selected, setSelected] = useState(null);
  const [remarkText, setRemarkText] = useState('');
  const [remarkBusy, setRemarkBusy] = useState(false);
  const [remarkMsg, setRemarkMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiService.getAdminTickets();
    if (r.success) setRows(r.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    setBusy(id);
    const r = await apiService.patchAdminTicketStatus(id, status);
    setBusy(null);
    if (!r.success) alert(r.message || 'Update failed');
    else {
      load();
      if (selected && (selected._id || selected.ticketId || selected.id) === id) {
        setSelected((prev) => prev ? { ...prev, status } : prev);
      }
    }
  };

  const submitRemark = async (e) => {
    e.preventDefault();
    if (!remarkText.trim() || !selected) return;
    const id = selected._id || selected.ticketId || selected.id;
    setRemarkBusy(true);
    setRemarkMsg('');
    const r = await apiService.addAdminTicketRemark(id, remarkText.trim());
    setRemarkBusy(false);
    if (r.success) {
      setRemarkText('');
      setRemarkMsg('Remark added');
      setTimeout(() => setRemarkMsg(''), 2000);
    } else {
      setRemarkMsg(r.message || 'Failed');
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-3">Subject</th>
                <th className="text-left p-3 hidden sm:table-cell">Category</th>
                <th className="text-left p-3 hidden md:table-cell">Priority</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3 hidden sm:table-cell">Created</th>
                <th className="text-left p-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No tickets yet.</td>
                </tr>
              ) : (
                rows.map((t) => {
                  const id = t._id || t.ticketId || t.id;
                  const b = busy === id;
                  return (
                    <tr key={id} className="border-b hover:bg-slate-50 transition">
                      <td className="p-3 max-w-[180px]">
                        <span className="truncate block">{t.subject || '—'}</span>
                      </td>
                      <td className="p-3 hidden sm:table-cell text-slate-500">{t.category || '—'}</td>
                      <td className="p-3 hidden md:table-cell">
                        {t.priority && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            t.priority === 'high' || t.priority === 'urgent'
                              ? 'bg-red-100 text-red-700'
                              : t.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {t.priority}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <select
                          className="border rounded-lg px-2 py-1 text-xs"
                          disabled={b}
                          value={t.status || 'open'}
                          onChange={(e) => updateStatus(id, e.target.value)}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="p-3 text-slate-400 text-xs hidden sm:table-cell">{fmt(t.createdAt)}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => { setSelected(t); setRemarkText(''); setRemarkMsg(''); }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium transition"
                        >
                          View <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail Drawer ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div
            className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-slate-900">Ticket Detail</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-5">
              {/* Subject */}
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase mb-1">Subject</div>
                <div className="font-semibold text-slate-900">{selected.subject || '—'}</div>
              </div>

              {/* Description */}
              {selected.description && (
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase mb-1">Description</div>
                  <div className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{selected.description}</div>
                </div>
              )}

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Category</div>
                  <div className="font-medium">{selected.category || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Priority</div>
                  <div className="font-medium">{selected.priority || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Created</div>
                  <div className="font-medium">{fmt(selected.createdAt)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Status</div>
                  <select
                    className="border rounded-lg px-2 py-1 text-xs w-full"
                    value={selected.status || 'open'}
                    onChange={(e) => updateStatus(selected._id || selected.ticketId || selected.id, e.target.value)}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* User info */}
              {selected.userId && typeof selected.userId === 'object' && (
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase mb-1">Raised by</div>
                  <div className="text-sm">
                    <div className="font-medium">{selected.userId.name || '—'}</div>
                    <div className="text-slate-500">{selected.userId.email || selected.userId.phone || '—'}</div>
                  </div>
                </div>
              )}

              {/* Existing remarks */}
              {Array.isArray(selected.remarks) && selected.remarks.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase mb-2">Remarks</div>
                  <div className="space-y-2">
                    {selected.remarks.map((r, i) => (
                      <div key={i} className="bg-blue-50 rounded-lg px-3 py-2 text-sm text-slate-700">
                        {typeof r === 'string' ? r : r.text || r.remark || JSON.stringify(r)}
                        {r.createdAt && (
                          <div className="text-xs text-slate-400 mt-0.5">{fmt(r.createdAt)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add remark */}
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase mb-2">Add Remark</div>
                <form onSubmit={submitRemark} className="flex gap-2">
                  <input
                    type="text"
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                    placeholder="Type a remark…"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={remarkBusy || !remarkText.trim()}
                    className="px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
                  >
                    {remarkBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
                {remarkMsg && (
                  <p className="text-xs text-green-600 mt-1">{remarkMsg}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
