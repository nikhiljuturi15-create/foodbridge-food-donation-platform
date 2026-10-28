import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HeartHandshake, 
  PlusCircle, 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut, 
  User, 
  Menu, 
  X,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                Food<span className="text-emerald-600">Bridge</span>
              </span>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest -mt-1">
                Redistribution Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/listings" className="hover:text-emerald-600 transition flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-500" />
              Browse Donations
            </Link>

            {isAuthenticated && user?.role === 'DONOR' && (
              <>
                <Link to="/donor/dashboard" className="hover:text-emerald-600 transition flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                  Donor Dashboard
                </Link>
                <Link 
                  to="/donor/create" 
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold transition shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post Food
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'RECIPIENT' && (
              <Link to="/recipient/dashboard" className="hover:text-emerald-600 transition flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                Recipient Portal
              </Link>
            )}

            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link to="/admin/dashboard" className="hover:text-purple-600 transition flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Admin Console
              </Link>
            )}
          </div>

          {/* User Controls & Demo Switcher */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition text-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800 leading-none">{user.name}</p>
                    <span className="text-[10px] text-emerald-600 uppercase font-medium">{user.role}</span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <div className="relative group">
                  <button className="text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1">
                    Get Started
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 hidden group-hover:block transition z-50">
                    <Link to="/register/donor" className="block px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">
                      Register as Food Donor
                    </Link>
                    <Link to="/register/recipient" className="block px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">
                      Register as Recipient NGO
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/listings"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700"
          >
            Browse Donations
          </Link>
          {isAuthenticated && user?.role === 'DONOR' && (
            <>
              <Link
                to="/donor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700"
              >
                Donor Dashboard
              </Link>
              <Link
                to="/donor/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-emerald-600 font-semibold"
              >
                + Post Food Listing
              </Link>
            </>
          )}
          {isAuthenticated && user?.role === 'RECIPIENT' && (
            <Link
              to="/recipient/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700"
            >
              Recipient Dashboard
            </Link>
          )}
          {isAuthenticated && user?.role === 'ADMIN' && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-purple-700"
            >
              Admin Console
            </Link>
          )}

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm font-medium text-red-600"
              >
                Sign Out ({user?.name})
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2 text-sm font-medium bg-slate-100 rounded-lg text-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register/donor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
