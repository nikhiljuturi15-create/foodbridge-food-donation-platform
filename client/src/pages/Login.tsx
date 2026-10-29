import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { HeartHandshake, LogIn, AlertCircle, Sparkles, Building2, ShieldCheck, Heart } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await api.post('/auth/login', { email: normalizedEmail, password: password.trim() });
      login(res.data.token, res.data.user);

      // Route by role
      if (res.data.user.role === 'DONOR') navigate('/donor/dashboard');
      else if (res.data.user.role === 'RECIPIENT') navigate('/recipient/dashboard');
      else if (res.data.user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Sign in to FoodBridge</h1>
          <p className="text-xs text-slate-500 mt-1">Access your donor or recipient organisation account</p>
        </div>

        {/* 1-Click Demo Evaluation Buttons */}
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Hackathon Quick-Fill Credentials
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemoAccount('donor@grandplaza.com', 'Password@123')}
              className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-emerald-500 text-slate-700 font-medium transition text-center shadow-2xs"
            >
              Donor
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('recipient@hopefoodbank.org', 'Password@123')}
              className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-emerald-500 text-slate-700 font-medium transition text-center shadow-2xs"
            >
              Recipient
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@foodbridge.org', 'Admin@123')}
              className="px-2 py-1.5 bg-white border border-purple-200 rounded-lg hover:border-purple-500 text-purple-800 font-medium transition text-center shadow-2xs"
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. donor@grandplaza.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
          <p>Don't have an account yet?</p>
          <div className="flex justify-center gap-4 font-semibold text-emerald-600">
            <Link to="/register/donor" className="hover:underline">Register as Donor</Link>
            <span>•</span>
            <Link to="/register/recipient" className="hover:underline">Register as Recipient NGO</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
