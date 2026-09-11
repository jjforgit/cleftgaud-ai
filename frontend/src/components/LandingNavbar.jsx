import React from 'react';
import { Hospital, UserCog, BarChart3, ChevronRight } from 'lucide-react';

export default function LandingNavbar({ onOpenAuth, onNavigateSection }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            window.location.hash = '';
          }}
          className="flex items-center cursor-pointer group"
          title="CleftGuard AI - Return to Public Website"
        >
          <img
            src="/images/cleftguard-logo.png"
            alt="CleftGuard AI"
            className="h-11 w-auto max-w-[220px] object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigateSection('mission')}
            className="hover:text-brand-blue transition cursor-pointer"
          >
            Our Mission
          </button>
          <button
            onClick={() => onNavigateSection('impact')}
            className="hover:text-brand-blue transition cursor-pointer"
          >
            The Impact
          </button>
          <button
            onClick={() => onNavigateSection('portals')}
            className="hover:text-brand-blue transition cursor-pointer"
          >
            For Clinics
          </button>
          <button
            onClick={() => onNavigateSection('ngo')}
            className="hover:text-brand-blue transition cursor-pointer"
          >
            NGO Analytics
          </button>
        </nav>

        {/* Right CTA Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAuth('rural', 'login')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white border border-brand-sky text-brand-sky hover:bg-sky-50/50 text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <Hospital className="w-3.5 h-3.5" />
            <span>Rural Clinic Login</span>
          </button>

          <button
            onClick={() => onOpenAuth('specialist', 'login')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-sky hover:bg-brand-sky-dark text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <UserCog className="w-3.5 h-3.5" />
            <span>Specialist Login</span>
          </button>
        </div>
      </div>
    </header>
  );
}
