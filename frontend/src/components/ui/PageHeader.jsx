import React from 'react';

export function PageHeader({ title, description, action, tabs }) {
  return (
    <div className="pb-4 border-b border-stone-200/80 mb-5 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight font-sans">{title}</h1>
          {description && <p className="mt-0.5 text-xs text-stone-500">{description}</p>}
        </div>
        {action && <div className="flex items-center space-x-2">{action}</div>}
      </div>
      {tabs && <div className="pt-2">{tabs}</div>}
    </div>
  );
}
