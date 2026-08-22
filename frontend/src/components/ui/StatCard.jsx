import React from 'react';

export function StatCard({ title, value, change, icon: Icon, trend = 'up', statusColor = 'stone' }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    plum: 'bg-plum-50 text-plum-900 border-plum-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    stone: 'bg-stone-50 text-stone-700 border-stone-200',
  };

  return (
    <div className="bg-white border border-stone-200/80 rounded-lg p-3.5 shadow-subtle flex items-center justify-between">
      <div>
        <span className="text-xs font-medium text-stone-500 uppercase tracking-wider block">{title}</span>
        <div className="mt-1 flex items-baseline space-x-2">
          <span className="text-xl font-bold text-stone-900 font-sans tracking-tight">{value}</span>
          {change && (
            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded border ${colorMap[statusColor] || colorMap.stone}`}>
              {change}
            </span>
          )}
        </div>
      </div>
      {Icon && (
        <div className="p-2 rounded-md bg-stone-100/80 text-stone-600 border border-stone-200/60 shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
