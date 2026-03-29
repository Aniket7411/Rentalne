import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import { Loader2, RefreshCw } from 'lucide-react';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

const AdminTickets = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiService.getAdminTickets();
    if (r.success) setRows(r.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, status) => {
    setBusy(id);
    const r = await apiService.patchAdminTicketStatus(id, status);
    setBusy(null);
    if (!r.success) alert(r.message || 'Update failed');
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Support tickets</h1>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white"
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
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const id = t._id || t.ticketId || t.id;
                const b = busy === id;
                return (
                  <tr key={id} className="border-b">
                    <td className="p-3">{t.subject || '—'}</td>
                    <td className="p-3">{t.category || '—'}</td>
                    <td className="p-3">
                      <select
                        className="border rounded-lg px-2 py-1"
                        disabled={b}
                        value={t.status || 'open'}
                        onChange={(e) => updateStatus(id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <p className="p-8 text-center text-slate-500">No tickets.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminTickets;
