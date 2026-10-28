import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';

  let colorClasses = 'bg-gray-100 text-gray-700 border-gray-200';

  switch (normalized) {
    case 'AVAILABLE':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'REQUESTED':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'CONFIRMED':
    case 'ACCEPTED':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'COMPLETED':
      colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
    case 'PENDING':
      colorClasses = 'bg-yellow-50 text-yellow-700 border-yellow-200';
      break;
    case 'REJECTED':
    case 'CANCELLED':
    case 'EXPIRED':
      colorClasses = 'bg-red-50 text-red-700 border-red-200';
      break;
  }

  return (
    <span className={`inline-flex items-center rounded-full border ${sizeClasses} ${colorClasses}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75"></span>
      {normalized}
    </span>
  );
};
