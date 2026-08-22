import React from 'react';

export function Badge({ children, variant = 'default', className = '', dot = false }) {
  const variants = {
    default: 'bg-stone-100 text-stone-700 border-stone-200',
    primary: 'bg-plum-50 text-plum-900 border-plum-200/80 font-semibold',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    lavender: 'bg-purple-50 text-purple-800 border-purple-200',
  };

  const dotColors = {
    default: 'bg-stone-400',
    primary: 'bg-plum-700',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    danger: 'bg-rose-600',
    lavender: 'bg-purple-600',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${variants[variant] || variants.default} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant] || dotColors.default}`} />
      )}
      {children}
    </span>
  );
}
