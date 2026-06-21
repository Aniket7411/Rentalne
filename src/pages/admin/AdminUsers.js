import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import { Loader2, RefreshCw, User, Phone, Mail, ShoppingBag, X, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Detail drawer
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiService.getAdminUsers();
    if (r.success) setUsers(r.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openUser = async (user) => {
    setSelectedUser(user);
    setUserOrders([]);
    setUserStats(null);
    setDrawerLoading(true);
    const uid = user._id || user.id;
    const [ordersRes, statsRes] = await Promise.all([
      apiService.getAdminUserOrders(uid),
      apiService.getAdminUserStats(uid).catch(() => ({ success: false })),
    ]);
    if (ordersRes.success) setUserOrders(ordersRes.data || []);
    if (statsRes.success) setUserStats(statsRes.data);
    setDrawerLoading(false);
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').includes(q)
    );
  });

  const statusColor = (status) => {
    const s = String(status || '').toLowerCase();
    if (['active', 'completed', 'delivered'].includes(s)) return 'bg-green-100 text-green-700';
    if (['pending', 'processing', 'confirmed'].includes(s)) return 'bg-yellow-100 text-yellow-700';
    if (['cancelled', 'failed'].includes(s)) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-dark">Users</h1>
            <p className="text-text-light text-sm">{users.length} total registered users</p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-text-dark hover:bg-gray-50 transition text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
          />
        </div>

        {/* Users table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                      {search ? 'No users match your search.' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const uid = u._id || u.id;
                    return (
                      <motion.tr
                        key={uid}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-blue/10 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-primary-blue" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-text-dark truncate">{u.name || '—'}</div>
                              <div className="text-xs text-text-light truncate">{u.email || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-text-light hidden sm:table-cell">{u.phone || '—'}</td>
                        <td className="px-4 py-3 text-text-light hidden md:table-cell">{fmt(u.createdAt)}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700'
                            : u.role === 'vendor' ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                          }`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openUser(u)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-text-dark text-xs font-medium transition"
                          >
                            View <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── User Detail Drawer ── */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setSelectedUser(null)}>
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-text-dark">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Basic info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-blue/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-7 h-7 text-primary-blue" />
                </div>
                <div>
                  <div className="text-lg font-bold text-text-dark">{selectedUser.name || '—'}</div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-700'
                    : selectedUser.role === 'vendor' ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedUser.role || 'user'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {selectedUser.email && (
                  <div className="flex items-center gap-2 text-text-light">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span>{selectedUser.email}</span>
                  </div>
                )}
                {selectedUser.phone && (
                  <div className="flex items-center gap-2 text-text-light">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <a href={`tel:${selectedUser.phone}`} className="hover:text-primary-blue">
                      {selectedUser.phone}
                    </a>
                  </div>
                )}
                {selectedUser.homeAddress && (
                  <div className="text-text-light">{selectedUser.homeAddress}</div>
                )}
                <div className="text-text-light text-xs">Joined: {fmt(selectedUser.createdAt)}</div>
              </div>

              {/* Stats */}
              {userStats && (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(userStats).map(([k, v]) => (
                    <div key={k} className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-text-dark">{v}</div>
                      <div className="text-xs text-text-light capitalize">{k.replace(/([A-Z])/g, ' $1')}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Orders */}
              <div>
                <h3 className="font-semibold text-text-dark mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Orders
                </h3>
                {drawerLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-blue" />
                  </div>
                ) : userOrders.length === 0 ? (
                  <p className="text-text-light text-sm">No orders yet.</p>
                ) : (
                  <div className="space-y-2">
                    {userOrders.slice(0, 10).map((o) => {
                      const oid = o.orderId || o._id;
                      return (
                        <div key={oid} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-text-dark truncate">{oid}</div>
                            <div className="text-xs text-text-light">{fmt(o.createdAt)}</div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {o.finalTotal != null && (
                              <span className="text-sm font-medium text-text-dark">₹{o.finalTotal}</span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(o.status)}`}>
                              {o.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
