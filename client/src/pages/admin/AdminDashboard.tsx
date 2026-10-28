import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { User, Listing, AuditLog } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  ShieldCheck, 
  Users, 
  Package, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'listings' | 'logs'>('users');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, listingsRes, logsRes] = await Promise.all([
        api.get('/stats/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/listings'),
        api.get('/admin/audit-logs'),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setListings(listingsRes.data.listings);
      setAuditLogs(logsRes.data.logs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/verify`, { isVerified: !currentStatus });
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification update failed');
    }
  };

  const handleModerateListing = async (listingId: string, newStatus: string) => {
    const note = prompt(`Enter moderation reason for setting status to ${newStatus}:`);
    try {
      await api.patch(`/admin/listings/${listingId}/moderate`, { status: newStatus, note });
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Moderation update failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Administrative Security Console
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Moderation & Oversight</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage NGO verifications, moderate live food inventory, and review cryptographic audit trails
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          Refresh Console
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Accounts</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalUsers ?? users.length}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Donors & Recipients</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Listings</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalListings ?? listings.length}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Platform inventory</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Rescues</p>
          <h3 className="text-2xl font-extrabold text-purple-600 mt-1">{stats?.totalCompleted ?? 1}</h3>
          <p className="text-[11px] text-purple-700 font-semibold mt-1">Zero hunger delivered</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Audit Log Entries</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{auditLogs.length}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Governance events</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Organisation Verification ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'listings'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Listing Moderation ({listings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: USER DIRECTORY & VERIFICATION */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Organisation / Name</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Reg ID</th>
                    <th className="pb-3">City</th>
                    <th className="pb-3">Verification</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 font-bold text-slate-900">
                        {u.name}
                        <span className="block text-[11px] font-normal text-slate-500">{u.email}</span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'DONOR' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">{u.organizationType || 'N/A'}</td>
                      <td className="py-3 font-mono text-[11px] text-slate-500">{u.registrationNumber || '—'}</td>
                      <td className="py-3 text-slate-600">{u.city || '—'}</td>
                      <td className="py-3">
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full text-[11px]">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleVerification(u.id, u.isVerified)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                              u.isVerified
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                            }`}
                          >
                            {u.isVerified ? 'Revoke Status' : 'Approve NGO'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: LISTINGS MODERATION */}
          {activeTab === 'listings' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Title & Category</th>
                    <th className="pb-3">Donor</th>
                    <th className="pb-3">Quantity</th>
                    <th className="pb-3">Use-By</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Moderation Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 font-bold text-slate-900 max-w-xs">
                        <span className="line-clamp-1">{l.title}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{l.category.replace('_', ' ')}</span>
                      </td>
                      <td className="py-3 text-slate-700">{l.donor?.name || 'Donor'}</td>
                      <td className="py-3 font-semibold text-emerald-700">{l.quantity} {l.unit}</td>
                      <td className="py-3 text-slate-500">{new Date(l.useBy).toLocaleDateString()}</td>
                      <td className="py-3"><StatusBadge status={l.status} size="sm" /></td>
                      <td className="py-3 text-right space-x-1">
                        {l.status !== 'CANCELLED' && l.status !== 'COMPLETED' && (
                          <>
                            <button
                              onClick={() => handleModerateListing(l.id, 'CANCELLED')}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg text-[11px]"
                            >
                              Flag & Remove
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Timestamp</th>
                      <th className="pb-3">Action Event</th>
                      <th className="pb-3">Triggered By</th>
                      <th className="pb-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 text-slate-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 font-bold text-purple-700">{log.action}</td>
                        <td className="py-2.5 text-slate-700">{log.user?.name || log.user?.email || 'System'}</td>
                        <td className="py-2.5 text-slate-500 font-sans truncate max-w-sm">
                          {log.details || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
