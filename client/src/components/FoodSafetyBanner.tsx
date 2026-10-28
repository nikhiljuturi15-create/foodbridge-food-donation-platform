import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface FoodSafetyBannerProps {
  compact?: boolean;
}

export const FoodSafetyBanner: React.FC<FoodSafetyBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Food Safety Notice:</strong> FoodBridge is a redistribution coordination platform and does not inspect or certify food safety. Donors and recipients are solely responsible for ensuring adherence to applicable hygiene and food safety standards.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl p-5 shadow-sm">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg flex-shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-950 uppercase tracking-wide flex items-center gap-2">
            Important Food Safety & Regulatory Disclosure
            <span className="text-[10px] font-medium bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">Non-Certification Platform</span>
          </h4>
          <p className="mt-1.5 text-xs text-amber-900/90 leading-relaxed">
            FoodBridge coordinates the rescue and handover of surplus edible food. <strong>FoodBridge does not inspect, test, or certify food safety or quality.</strong> All donors must ensure food is prepared, stored, and transported under strict sanitary and temperature-controlled standards (cold foods ≤ 4°C, hot foods ≥ 63°C). Recipient organisations must inspect donations prior to serving.
          </p>
        </div>
      </div>
    </div>
  );
};
