import React from 'react';

export function Card({ children, className = '', title, subtitle, action, compact = false }) {
  return (
    <div className={`bg-white border border-stone-200/80 rounded-lg shadow-subtle ${compact ? 'p-3.5' : 'p-5'} ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-stone-100">
          <div>
            {title && <h3 className="text-sm font-semibold text-stone-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="text-xs">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
