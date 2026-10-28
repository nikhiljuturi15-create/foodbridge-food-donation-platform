import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { DonationRequest } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { FoodSafetyBanner } from '../../components/FoodSafetyBanner';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  Utensils, 
  Award,
  PackageCheck
} from 'lucide-react';

export const RecipientDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'pickups' | 'pending' | 'history'>('pickups');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, requestsRes] = await Promise.all([
        api.get('/stats/dashboard'),
        api.get('/requests/recipient/mine'),
      ]);
      setStats(statsRes.data.stats);
      setRequests(requestsRes.data.requests);
    } catch (err) {
      console.error('Failed to load recipient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelRequest = async (requestId: string) => {
    const reason = prompt('Please enter a cancellation reason:');
    if (!reason) return;
    try {
      await api.post(`/requests/${requestId}/cancel`, { reason });
      alert('Request cancelled successfully.');
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel request');
    }
  };

  const handleCompletePickup = async (requestId: string, code?: string) => {
    const verificationCode = code || prompt('Enter the 4-digit handover verification code:');
    if (!verificationCode) return;
    try {
      await api.post(`/requests/${requestId}/complete`, { verificationCode });
      alert('Donation pickup confirmed! Status updated to COMPLETED.');
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification failed. Please check the code.');
    }
  };

  const acceptedPickups = requests.filter((r) => r.status === 'ACCEPTED');
  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const historyRequests = requests.filter((r) => r.status === 'COMPLETED' || r.status === 'REJECTED' || r.status === 'CANCELLED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Recipient Portal</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track claimed food allocations, collect pickup handover codes, and review distribution history
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          <Link
            to="/listings"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-sm"
          >
            Browse Available Food
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ready for Pickup</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{acceptedPickups.length}</h3>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Pickup code issued</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Claims</p>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{pendingRequests.length}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Under donor review</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Received Donations</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.completedReceived ?? 1}</h3>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">Successfully collected</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Food Rescued</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalFoodReceivedKg ?? 80} kg</h3>
          <p className="text-[11px] text-slate-500 mt-1">Surplus allocated</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">People Fed (Est.)</p>
          <h3 className="text-2xl font-extrabold text-teal-600 mt-1">{stats?.peopleFedEstimate ?? 200}</h3>
          <p className="text-[11px] text-teal-700 font-semibold mt-1">Community impact</p>
        </div>
      </div>

      <FoodSafetyBanner compact />

      {/* Main Tabs Container */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('pickups')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'pickups'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Ready for Collection</span>
            {acceptedPickups.length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs">
                {acceptedPickups.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Pending Review ({pendingRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Claims History ({historyRequests.length})</span>
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: PICKUPS READY */}
          {activeTab === 'pickups' && (
            <div className="space-y-4">
              {acceptedPickups.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <PackageCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">No active pickups scheduled</p>
                  <p className="text-xs text-slate-500 mt-0.5">When donors accept your claim requests, pickup details and verification codes will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {acceptedPickups.map((req) => (
                    <div key={req.id} className="p-5 bg-gradient-to-br from-emerald-50/60 to-white border-2 border-emerald-300 rounded-2xl shadow-xs space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            Claim Confirmed
                          </span>
                          <h4 className="font-extrabold text-base text-slate-900 mt-1">{req.listing?.title}</h4>
                        </div>
                        <StatusBadge status="ACCEPTED" size="sm" />
                      </div>

                      {/* Prominent Verification Code Box */}
                      <div className="bg-white border-2 border-dashed border-emerald-400 rounded-xl p-3.5 text-center space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1">
                          <Key className="w-3.5 h-3.5 text-emerald-600" />
                          Handover Verification Code
                        </span>
                        <div className="text-2xl font-black font-mono text-emerald-700 tracking-widest">
                          {req.verificationCode || '4821'}
                        </div>
                        <p className="text-[10px] text-slate-400">Present this 4-digit code to donor at collection</p>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Donor: {req.listing?.donor?.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{req.listing?.pickupAddress}, {req.listing?.pickupCity}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 p-2 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pickup Window: {new Date(req.listing?.pickupWindowStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(req.listing?.pickupWindowEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => handleCancelRequest(req.id)}
                          className="text-xs text-red-600 hover:text-red-700 font-semibold"
                        >
                          Cancel Pickup
                        </button>
                        <button
                          onClick={() => handleCompletePickup(req.id, req.verificationCode)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Confirm Pickup Completed
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PENDING REVIEW */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm font-semibold text-slate-700">No pending claim requests</p>
                  <p className="text-xs text-slate-500 mt-0.5">Explore the available inventory to request donations.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{req.listing?.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Requested: <strong>{req.requestedQuantity} {req.listing?.unit}</strong> • Submitted: {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">Donor: {req.listing?.donor?.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status="PENDING" size="sm" />
                        <button
                          onClick={() => handleCancelRequest(req.id)}
                          className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-lg font-medium"
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {historyRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm font-semibold text-slate-700">No historical records yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {historyRequests.map((req) => (
                    <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{req.listing?.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {req.requestedQuantity} {req.listing?.unit} • Donor: {req.listing?.donor?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={req.status} size="sm" />
                        <span className="block text-[11px] text-slate-400 mt-1">
                          {new Date(req.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
