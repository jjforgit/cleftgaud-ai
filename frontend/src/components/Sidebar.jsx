import React from 'react';
import { Hospital, UserCheck, BarChart3, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, pendingCount, onReturnHome }) {
  const navItems = [
    { id: 'rural', label: 'Rural Clinic', icon: Hospital, badge: null },
    { id: 'specialist', label: 'Urban Specialist', icon: UserCheck, badge: pendingCount > 0 ? `${pendingCount} Urgent` : null },
    { id: 'ngo', label: 'NGO Dashboard', icon: BarChart3, badge: null },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100">
          <div
            onClick={onReturnHome}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-sky-50/60 border border-transparent hover:border-sky-100 transition-all cursor-pointer group"
            title="Click to open Public Website"
          >
            <img
              src="/images/cleftguard-logo.png"
              alt="CleftGuard AI"
              className="h-10 w-auto max-w-[200px] object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </div>

          {/* Return to Public Landing Page Button */}
          <button
            onClick={onReturnHome}
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Return to Public Website</span>
          </button>
        </div>

        {/* Navigation List */}
        <div className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Clinical Portals
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-sky-50 text-brand-blue font-semibold border-l-4 border-brand-sky shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-sky' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[11px] font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* System Health Status */}
        <div className="px-4 py-2.5 mx-4 mt-2 bg-slate-50 rounded-lg border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-600">AI Inference Node</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </span>
          </div>
          <div className="text-[11px] text-slate-500 leading-tight">
            ResNet-18 Osteoid Trabeculae Segmentation Model Active
          </div>
        </div>
      </div>

      {/* Clinician Profile Mock */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-sky/10 border border-brand-sky/30 text-brand-blue font-bold flex items-center justify-center text-xs">
            DS
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-900 truncate">Dr. A. Sharma</div>
            <div className="text-[11px] text-slate-500 truncate">Dharwad CHC - Rural Lead</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
