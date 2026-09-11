import React from 'react';

export default function MetricCard({ label, value, trend, trendPositive = true, subtext, icon: Icon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs hover:shadow-sm transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-md bg-sky-50 text-brand-sky flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
        {value}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span
          className={`font-semibold ${
            trendPositive ? 'text-emerald-600' : 'text-slate-600'
          }`}
        >
          {trend}
        </span>
        {subtext && <span className="text-slate-400">{subtext}</span>}
      </div>
    </div>
  );
}
