import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Listing, DonationRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { FoodSafetyBanner } from '../components/FoodSafetyBanner';
import { 
  Clock, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  Thermometer, 
  Calendar,
  Send,
  Edit,
  Trash2,
  Phone
} from 'lucide-react';

export const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Claim modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [requestedQuantity, setRequestedQuantity] = useState<number>(0);
  const [pickupTime, setPickupTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const fetchListing = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/listings/${id}`);
      setListing(res.data.listing);
      if (res.data.listing) {
        setRequestedQuantity(res.data.listing.quantity);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load listing details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setClaimLoading(true);
    setClaimError(null);
    setClaimSuccess(null);

    try {
      const res = await api.post('/requests', {
        listingId: listing?.id,
        requestedQuantity: Number(requestedQuantity),
        pickupTime: pickupTime ? new Date(pickupTime).toISOString() : undefined,
        purpose,
      });

      setClaimSuccess('Claim request submitted successfully! The donor will review your request.');
      setTimeout(() => {
        setModalOpen(false);
        fetchListing();
      }, 2000);
    } catch (err: any) {
      setClaimError(err.response?.data?.message || 'Failed to submit claim request');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleDonorAccept = async (requestId: string) => {
    try {
      const res = await api.post(`/requests/${requestId}/accept`);
      alert(`Request Accepted! Verification handover code: ${res.data.request.verificationCode}`);
      fetchListing();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error accepting request');
    }
  };

  const handleDonorReject = async (requestId: string) => {
    const reason = prompt('Please enter a rejection reason (optional):');
    try {
      await api.post(`/requests/${requestId}/reject`, { reason: reason || 'Declined' });
      fetchListing();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error rejecting request');
    }
  };

  const handleDeleteListing = async () => {
    if (!window.confirm('Are you sure you want to cancel and remove this listing?')) return;
    try {
      await api.delete(`/listings/${listing?.id}`);
      navigate('/donor/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-xs text-slate-500">Loading donation details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-800">Listing not found</h2>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <Link to="/listings" className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl">
          Back to Listings
        </Link>
      </div>
    );
  }

  const isOwner = isAuthenticated && user?.id === listing.donorId;
  const isRecipient = isAuthenticated && user?.role === 'RECIPIENT';
  const isAvailable = listing.status === 'AVAILABLE' || listing.status === 'REQUESTED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/listings" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 transition">
        <ArrowLeft className="w-4 h-4" />
        Back to Available Donations
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {listing.imageUrl && (
          <div className="h-64 sm:h-80 w-full bg-slate-100 overflow-hidden relative">
            <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4">
              <StatusBadge status={listing.status} />
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Title & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">
                  {listing.category.replace('_', ' ')}
                </span>
                {listing.dietaryInfo && (
                  <span className="bg-teal-50 text-teal-800 border border-teal-200 font-semibold px-2.5 py-0.5 rounded-full text-xs">
                    {listing.dietaryInfo}
                  </span>
                )}
                {!listing.imageUrl && <StatusBadge status={listing.status} />}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{listing.title}</h1>
              <p className="text-xs text-slate-500 mt-1">Listed on {new Date(listing.createdAt).toLocaleDateString()} at {new Date(listing.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            {/* Quantity Callout */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-right flex-shrink-0">
              <span className="text-xs text-slate-500 block uppercase font-medium">Quantity Available</span>
              <span className="text-2xl font-extrabold text-emerald-600">
                {listing.quantity} <span className="text-sm font-semibold text-slate-600">{listing.unit}</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-sm text-slate-700 leading-relaxed max-w-none">
            <p className="text-sm whitespace-pre-line">{listing.description}</p>
          </div>

          <FoodSafetyBanner compact />

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Use-By Guidance
              </span>
              <p className="text-sm font-semibold text-slate-900">
                {new Date(listing.useBy).toLocaleDateString()} • {new Date(listing.useBy).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Consume or freeze before deadline</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                Pickup Window
              </span>
              <p className="text-sm font-semibold text-slate-900">
                {new Date(listing.pickupWindowStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(listing.pickupWindowEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {new Date(listing.pickupWindowStart).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-emerald-500" />
                Storage & Handling
              </span>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {listing.storageInstructions || 'Standard food storage'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Cold chain & hygiene checked</p>
            </div>
          </div>

          {/* Location and Donor Info */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">{listing.donor?.name || 'Verified Donor'}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  Verified Food Partner
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{listing.pickupAddress}, {listing.pickupCity}</span>
              </div>
              {listing.donor?.phone && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{listing.donor.phone}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div>
              {isOwner ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteListing}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl border border-red-200 transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Cancel Listing
                  </button>
                </div>
              ) : isAvailable ? (
                <button
                  onClick={() => {
                    if (!isAuthenticated) navigate('/login');
                    else if (user?.role !== 'RECIPIENT') alert('Only registered Recipient Organisations can claim food donations.');
                    else setModalOpen(true);
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Claim this Donation
                </button>
              ) : (
                <div className="text-xs font-semibold text-slate-400 bg-slate-100 px-4 py-2 rounded-xl">
                  Listing {listing.status}
                </div>
              )}
            </div>
          </div>

          {/* Owner Donor: Manage incoming requests for this listing */}
          {isOwner && listing.requests && listing.requests.length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Incoming Claims for this Listing ({listing.requests.length})
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {listing.requests.map((req) => (
                  <div key={req.id} className="p-4 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{req.recipient.name}</span>
                        <StatusBadge status={req.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Requested: <strong>{req.requestedQuantity} {listing.unit}</strong> • Purpose: {req.purpose || 'Community meal distribution'}
                      </p>
                      {req.verificationCode && (
                        <p className="text-xs text-emerald-700 font-mono font-bold mt-1">
                          Pickup Handover Code: {req.verificationCode}
                        </p>
                      )}
                    </div>

                    {req.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDonorAccept(req.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
                        >
                          Accept Claim
                        </button>
                        <button
                          onClick={() => handleDonorReject(req.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recipient Claim Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Request Donation Allocation</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
            </div>

            {claimSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-emerald-900">{claimSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                {claimError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{claimError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Requested Quantity (Max: {listing.quantity} {listing.unit})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={listing.quantity}
                    required
                    value={requestedQuantity}
                    onChange={(e) => setRequestedQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Pickup Time
                  </label>
                  <input
                    type="datetime-local"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Must fall within donor pickup window</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Intended Distribution Purpose / Community Group
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Dinner service for 35 residents at our evening shelter..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-900 leading-relaxed border border-amber-200/60">
                  By requesting, you confirm that your recipient organisation possesses suitable transport and safe storage capacity to maintain food quality.
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={claimLoading}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-sm disabled:opacity-50"
                  >
                    {claimLoading ? 'Submitting...' : 'Submit Claim Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
