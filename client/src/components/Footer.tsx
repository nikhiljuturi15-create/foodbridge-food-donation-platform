import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, Heart, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Food<span className="text-emerald-400">Bridge</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering food businesses and social impact organisations to eliminate edible surplus waste and achieve zero hunger through responsible, community-led food redistribution.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg w-fit">
              <Award className="w-3.5 h-3.5" />
              <span>College Hackathon • Problem ID: HACK-P197</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/listings" className="hover:text-emerald-400 transition">Browse Available Food</Link></li>
              <li><Link to="/register/donor" className="hover:text-emerald-400 transition">Register as Donor</Link></li>
              <li><Link to="/register/recipient" className="hover:text-emerald-400 transition">Register as Recipient NGO</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition">Platform Login</Link></li>
            </ul>
          </div>

          {/* Donor Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Donation Categories</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Cooked Banquet & Dining Surplus</li>
              <li>Artisan Bakery & Fresh Breads</li>
              <li>Farm Fresh Organic Produce</li>
              <li>Chilled Dairy & Pasteurized Milk</li>
              <li>Sealed Pantry & Packaged Staples</li>
            </ul>
          </div>

          {/* Regulatory & Safety Notice */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-4 h-4" />
              Food Safety Disclaimer
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              FoodBridge coordinates surplus redistribution and <strong>does not certify, inspect, or guarantee</strong> food safety. Donors and recipient organisations must independently observe standard food hygiene, storage temperatures, and expiration guidelines.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} FoodBridge Platform. Academic Hackathon Project Submission (HACK-P197).</p>
          <p className="flex items-center gap-1">
            Built with React, Express, Prisma & TypeScript <Heart className="w-3.5 h-3.5 text-red-500 fill-current inline" /> for Zero Hunger (UN SDG 2).
          </p>
        </div>
      </div>
    </footer>
  );
};
