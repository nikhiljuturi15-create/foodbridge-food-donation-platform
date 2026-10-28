import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Listing, FoodCategory } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { FoodSafetyBanner } from '../components/FoodSafetyBanner';
import { 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  Utensils, 
  AlertTriangle,
  ArrowUpDown,
  Building2,
  RefreshCw
} from 'lucide-react';

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All Categories', value: 'ALL' },
  { label: 'Cooked Meals', value: 'COOKED_MEALS' },
  { label: 'Fresh Bakery', value: 'BAKERY' },
  { label: 'Produce & Fruits', value: 'PRODUCE' },
  { label: 'Dairy & Milk', value: 'DAIRY' },
  { label: 'Pantry & Packaged', value: 'PACKAGED_GOODS' },
  { label: 'Other Surplus', value: 'OTHER' },
];

export const BrowseListings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [dietary, setDietary] = useState('ALL');
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState<'urgency' | 'newest' | 'quantity'>('urgency');

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { sortBy };
      if (category !== 'ALL') params.category = category;
      if (dietary !== 'ALL') params.dietaryInfo = dietary;
      if (search.trim()) params.search = search.trim();
      if (city.trim()) params.city = city.trim();

      const res = await api.get('/listings', { params });
      setListings(res.data.listings || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load food listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, dietary, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Available Surplus Food</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and claim edible food donations verified for community redistribution
          </p>
        </div>

        <button
          onClick={fetchListings}
          className="inline-flex items-center gap-2 self-start md:self-auto px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          Refresh Feed
        </button>
      </div>

      <FoodSafetyBanner compact />

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by food name, description, or pickup address..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-3">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Filter by city (e.g. Metropolis)..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-3 flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold py-2 transition shadow-sm"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCity('');
                setCategory('ALL');
                setDietary('ALL');
                setSortBy('urgency');
              }}
              className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold py-2 transition"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Category Pills & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  category === cat.value
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="urgency">Urgency (Use-by deadline)</option>
              <option value="newest">Newest Listed</option>
              <option value="quantity">Largest Quantity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listing Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-80 animate-pulse space-y-4">
              <div className="h-40 bg-slate-200 rounded-xl"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-red-200 p-8">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">Failed to load listings</h3>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
          <button
            onClick={fetchListings}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
          >
            Try Again
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No food listings match your filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, category pills, or city filter to view available donations.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCity('');
              setCategory('ALL');
              setDietary('ALL');
            }}
            className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {listings.map((item) => {
            const useByDate = new Date(item.useBy);
            const hoursLeft = Math.round((useByDate.getTime() - Date.now()) / (3600 * 1000));
            const isUrgent = hoursLeft > 0 && hoursLeft <= 24;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {item.imageUrl ? (
                    <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      {isUrgent && (
                        <div className="absolute bottom-2 left-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
                          <Clock className="w-3 h-3" />
                          <span>Urgent: {hoursLeft}h left</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-28 bg-emerald-50 flex items-center justify-center relative p-4">
                      <Utensils className="w-8 h-8 text-emerald-300" />
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {item.category.replace('_', ' ')}
                      </span>
                      {item.dietaryInfo && (
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {item.dietaryInfo}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between text-slate-800">
                    <span className="font-medium">Quantity:</span>
                    <span className="font-extrabold text-emerald-600 text-sm">{item.quantity} {item.unit}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{item.donor?.name || 'Verified Donor'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{item.pickupAddress}, {item.pickupCity}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50/70 p-2 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Pickup Window: {new Date(item.pickupWindowStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(item.pickupWindowEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <Link
                    to={`/listings/${item.id}`}
                    className="block w-full text-center py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs transition shadow-2xs mt-2"
                  >
                    View Details & Claim
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
