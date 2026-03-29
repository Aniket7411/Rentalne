import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import { Loader2, RefreshCw } from 'lucide-react';

const AdminServiceRequests = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [note, setNote] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiService.getAdminServiceRequestsList();
    if (r.success) setRows(r.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (id, status) => {
    setBusy(id);
    const body = { status };
    const extra = note[id]?.trim();
    if (extra) body.adminNotes = extra;
    const r = await apiService.patchAdminServiceRequest(id, body);
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
          <h1 className="text-2xl font-bold text-slate-900">Service requests</h1>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        <div className="space-y-4">
          {rows.length === 0 ? (
            <p className="text-slate-500">No service requests.</p>
          ) : (
            rows.map((r) => {
              const id = r._id || r.id;
              const b = busy === id;
              return (
                <div key={id} className="bg-white rounded-xl border p-4 text-sm space-y-2">
                  <div className="font-semibold text-slate-900">
                    {r.serviceType || r.type || 'Request'} · {r.status || 'pending'}
                  </div>
                  <div className="text-slate-600">{r.description || r.message || '—'}</div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <input
                      className="border rounded-lg px-2 py-1 flex-1 min-w-[200px]"
                      placeholder="Admin notes (optional)"
                      value={note[id] || ''}
                      onChange={(e) => setNote((n) => ({ ...n, [id]: e.target.value }))}
                    />
                    {['pending', 'in_progress', 'completed', 'cancelled'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={b}
                        onClick={() => patch(id, st)}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 capitalize disabled:opacity-50"
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminServiceRequests;
