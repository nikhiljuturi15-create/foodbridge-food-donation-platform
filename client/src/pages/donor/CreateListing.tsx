import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { ArrowLeft, PlusCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { FoodSafetyBanner } from '../../components/FoodSafetyBanner';

export const CreateListing: React.FC = () => {
  const navigate = useNavigate();

  // Sensible default pickup window (starts in 1 hr, ends in 6 hrs, use-by in 24 hrs)
  const now = new Date();
  const formatForInput = (d: Date) => d.toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'COOKED_MEALS',
    quantity: 10,
    unit: 'servings',
    dietaryInfo: 'Vegetarian',
    preparedAt: formatForInput(new Date(now.getTime() - 2 * 3600 * 1000)),
    useBy: formatForInput(new Date(now.getTime() + 24 * 3600 * 1000)),
    pickupWindowStart: formatForInput(new Date(now.getTime() + 1 * 3600 * 1000)),
    pickupWindowEnd: formatForInput(new Date(now.getTime() + 6 * 3600 * 1000)),
    pickupAddress: '',
    pickupCity: '',
    storageInstructions: 'Keep refrigerated below 4°C until serving',
    foodSafetyConfirmed: false,
    imageUrl: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.foodSafetyConfirmed) {
      setError('You must certify that this food complies with food safety and temperature control requirements.');
      return;
    }

    if (new Date(formData.pickupWindowEnd) <= new Date(formData.pickupWindowStart)) {
      setError('Pickup window end time must be after the start time.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/listings', {
        ...formData,
        quantity: Number(formData.quantity),
        preparedAt: new Date(formData.preparedAt).toISOString(),
        useBy: new Date(formData.useBy).toISOString(),
        pickupWindowStart: new Date(formData.pickupWindowStart).toISOString(),
        pickupWindowEnd: new Date(formData.pickupWindowEnd).toISOString(),
      });

      navigate('/donor/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create food listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link to="/donor/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 transition">
        <ArrowLeft className="w-4 h-4" />
        Back to Donor Dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Post Food Donation Listing</h1>
          <p className="text-xs text-slate-500 mt-1">Provide clear, accurate details for recipient organisations to safely collect surplus</p>
        </div>

        <FoodSafetyBanner compact />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Food Title / Description Summary *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Prepared Banquet Surplus: Mediterranean Chicken & Roasted Vegetables"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description & Packaging *
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe preparation method, current packaging (e.g. sealed chafing pans, sanitized containers), ingredients, and allergen notices..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category, Quantity, Unit, Dietary */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="COOKED_MEALS">Cooked Meals</option>
                <option value="BAKERY">Fresh Bakery</option>
                <option value="PRODUCE">Produce / Fruit</option>
                <option value="DAIRY">Dairy / Milk</option>
                <option value="PACKAGED_GOODS">Pantry / Packaged</option>
                <option value="OTHER">Other Surplus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min={1}
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Unit *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="servings">servings</option>
                <option value="kg">kg</option>
                <option value="meals">meals / portions</option>
                <option value="boxes">boxes / crates</option>
                <option value="liters">liters</option>
                <option value="loaves">loaves</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dietary Guidance
              </label>
              <select
                value={formData.dietaryInfo}
                onChange={(e) => setFormData({ ...formData, dietaryInfo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Halal">Halal</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Gluten-Free">Gluten-Free</option>
              </select>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Prepared / Cooked Timestamp
              </label>
              <input
                type="datetime-local"
                value={formData.preparedAt}
                onChange={(e) => setFormData({ ...formData, preparedAt: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Use-by / Expiry Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.useBy}
                onChange={(e) => setFormData({ ...formData, useBy: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Pickup Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pickup Window Starts *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.pickupWindowStart}
                onChange={(e) => setFormData({ ...formData, pickupWindowStart: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pickup Window Ends *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.pickupWindowEnd}
                onChange={(e) => setFormData({ ...formData, pickupWindowEnd: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pickup Street Address & Instructions *
              </label>
              <input
                type="text"
                required
                value={formData.pickupAddress}
                onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                placeholder="e.g. 500 Grand Avenue, Banquet Loading Dock C"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                City / Region *
              </label>
              <input
                type="text"
                required
                value={formData.pickupCity}
                onChange={(e) => setFormData({ ...formData, pickupCity: e.target.value })}
                placeholder="e.g. Metropolis"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Storage & Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Storage & Temperature Guidance
              </label>
              <input
                type="text"
                value={formData.storageInstructions}
                onChange={(e) => setFormData({ ...formData, storageInstructions: e.target.value })}
                placeholder="e.g. Hold below 4°C, reheat thoroughly before serving"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Mandatory Safety Checkbox */}
          <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.foodSafetyConfirmed}
                onChange={(e) => setFormData({ ...formData, foodSafetyConfirmed: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-amber-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-amber-950 font-medium leading-relaxed">
                <strong>Mandatory Food Safety Certification:</strong> I declare that this food was prepared and preserved under sanitary conditions and has been stored within permitted temperature limits. I understand that FoodBridge is an administrative coordination platform and does not certify, inspect, or warrant food safety.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Publishing Listing...' : (
              <>
                <PlusCircle className="w-4 h-4" />
                Publish Donation Listing
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
