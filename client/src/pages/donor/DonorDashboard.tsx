import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Listing, DonationRequest } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  PlusCircle, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Leaf, 
  MapPin, 
  ShieldCheck, 
  Users,
  Eye,
  Trash2,
  RefreshCw,
  Award
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<DonationRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'listings' | 'history'>('requests');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, listingsRes, requestsRes] = await Promise.all([
        api.get('/stats/dashboard'),
        api.get('/listings/donor/mine'),
        api.get('/requests/donor/incoming'),
      ]);
      setStats(statsRes.data.stats);
      setListings(listingsRes.data.listings);
      setIncomingRequests(requestsRes.data.requests);
    } catch (err) {
      console.error('Failed to load donor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const res = await api.post(`/requests/${requestId}/accept`);
      alert(`Donation claim accepted! Pickup Verification Code: ${res.data.request.verificationCode}`);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt('Reason for declining this request (optional):');
    try {
      await api.post(`/requests/${requestId}/reject`, { reason: reason || 'Declined' });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleCompletePickup = async (requestId: string) => {
    const code = prompt('Enter the 4-digit verification code presented by the recipient:');
    if (!code) return;
    try {
      await api.post(`/requests/${requestId}/complete`, { verificationCode: code });
      alert('Pickup confirmed! Donation marked as COMPLETED.');
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification failed. Incorrect code or invalid status.');
    }
  };

  const pendingRequests = incomingRequests.filter((r) => r.status === 'PENDING');
  const acceptedRequests = incomingRequests.filter((r) => r.status === 'ACCEPTED');
  const completedListings = listings.filter((l) => l.status === 'COMPLETED');
  const activeListings = listings.filter((l) => l.status === 'AVAILABLE' || l.status === 'REQUESTED' || l.status === 'CONFIRMED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Donor Operations Center</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage surplus inventory, review incoming claims, and track verified food rescues
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
            to="/donor/create"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Donation
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Listings</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.activeListings ?? activeListings.length}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Available for claim</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Claims</p>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{pendingRequests.length}</h3>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">Awaiting your approval</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Donations</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.completedDonations ?? completedListings.length}</h3>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">Successfully rescued</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Food Rescued</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalFoodDonatedKg ?? 180} kg</h3>
          <p className="text-[11px] text-slate-500 mt-1">Direct surplus diverted</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CO2 Emissions Avoided</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{stats?.co2SavedKg ?? 450} kg</h3>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Greenhouse impact</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Incoming Recipient Claims</span>
            {pendingRequests.length > 0 && (
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'listings'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Active Listings ({activeListings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Donation History ({completedListings.length})</span>
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: INCOMING REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {incomingRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">No recipient claims yet</p>
                  <p className="text-xs text-slate-500 mt-0.5">When recipient shelters request your surplus, they will appear here for review.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {incomingRequests.map((req) => (
                    <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{req.recipient?.name || 'Community Recipient'}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                            {req.recipient?.organizationType || 'NGO'}
                          </span>
                          <StatusBadge status={req.status} size="sm" />
                        </div>

                        <p className="text-xs text-slate-700">
                          Listing: <strong>{req.listing?.title}</strong>
                        </p>

                        <p className="text-xs text-slate-500">
                          Requested: <strong className="text-emerald-700">{req.requestedQuantity} {req.listing?.unit}</strong> • Intended: {req.purpose || 'Community kitchen feeding'}
                        </p>

                        {req.verificationCode && (
                          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-mono font-bold text-emerald-900">
                            <span>Pickup Handover Code:</span>
                            <span className="text-emerald-700 tracking-wider text-sm">{req.verificationCode}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        {req.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleAcceptRequest(req.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                            >
                              Accept Claim
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req.id)}
                              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {req.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleCompletePickup(req.id)}
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Verify Handover
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACTIVE LISTINGS */}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              {activeListings.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">No active food listings</p>
                  <Link to="/donor/create" className="text-xs text-emerald-600 font-bold hover:underline mt-1 inline-block">
                    + Post a donation listing now
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeListings.map((item) => (
                    <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            {item.category.replace('_', ' ')}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 mt-0.5">{item.title}</h4>
                        </div>
                        <StatusBadge status={item.status} size="sm" />
                      </div>

                      <div className="flex justify-between text-xs text-slate-600 pt-2 border-t border-slate-200">
                        <span>Quantity: <strong>{item.quantity} {item.unit}</strong></span>
                        <span>Use by: <strong>{new Date(item.useBy).toLocaleDateString()}</strong></span>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Link
                          to={`/listings/${item.id}`}
                          className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View Listing
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DONATION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {completedListings.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Award className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">No completed donations yet</p>
                  <p className="text-xs text-slate-500 mt-0.5">Completed food handovers will be recorded here with impact statistics.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {completedListings.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.quantity} {item.unit} • Categorized as {item.category.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status="COMPLETED" size="sm" />
                        <span className="block text-[11px] text-slate-400 mt-1">
                          {new Date(item.updatedAt).toLocaleDateString()}
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
