import React from 'react';
import { Hospital, UserCog, Check, ArrowRight, ShieldCheck, Zap, Layers, BarChart3 } from 'lucide-react';

export default function PortalsSection({ onOpenAuth, onDirectPortalLaunch }) {
  return (
    <section id="portals" className="bg-[#F8FAFC] py-24 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-bold text-brand-blue uppercase tracking-widest">
            Role-Based Access
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Choose Your Clinical Portal
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            Tailored interfaces designed specifically for front-line rural clinicians and regional craniofacial surgeons.
          </p>
        </div>

        {/* Two Interactive Cards Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: Rural Clinic Portal */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-6">
              {/* Icon & Badge */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-brand-sky group-hover:scale-105 transition">
                  <Hospital className="w-8 h-8" />
                </div>
                <span className="text-xs font-semibold text-brand-sky bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                  Primary Care Node
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">
                  Rural Clinic Portal
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Upload post-operative dental scans, receive instant AI triage results with bone density metrics, and seamlessly refer complex graft resorption cases to urban specialists.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Easy OPG / Radiograph Upload (JPEG/PNG/DICOM)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Instant AI Bounding Box Analysis & Bone Density Index</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Automated PDF Diagnostic Reports & Specialist Escalation</span>
                </div>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => onOpenAuth('rural', 'signup')}
                className="py-3 px-4 rounded-md bg-brand-sky hover:bg-brand-sky-dark text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Register Clinic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onOpenAuth('rural', 'login')}
                className="py-3 px-4 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Clinic Login</span>
              </button>
            </div>
          </div>

          {/* Card 2: Urban Specialist Portal */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-6">
              {/* Icon & Badge */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-blue group-hover:scale-105 transition">
                  <UserCog className="w-8 h-8" />
                </div>
                <span className="text-xs font-semibold text-brand-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Craniofacial Center
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">
                  Urban Specialist Portal
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Manage your referral queue efficiently. Review AI-flagged cases with detailed Precision Bounding Box Localization and provide remote clinical second-opinion guidance in real time.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Prioritized Referral Queue with AI Confidence Scoring</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Detailed AI Clinical Summaries & Bergland Scale Indicators</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>One-Click Surgical Intervention Confirmation & Second-Opinion Dossiers</span>
                </div>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => onOpenAuth('specialist', 'signup')}
                className="py-3 px-4 rounded-md bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Register as Specialist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onOpenAuth('specialist', 'login')}
                className="py-3 px-4 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Specialist Login</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick NGO Access Banner */}
        <div className="mt-12 bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-brand-sky flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Are you a Smile Train Program Director or Health Ministry Official?</div>
              <div className="text-xs text-slate-500">Access aggregate state-wide triage analytics, rural center health metrics, and grant impact exports.</div>
            </div>
          </div>
          <button
            onClick={() => onDirectPortalLaunch('ngo')}
            className="whitespace-nowrap px-4 py-2 rounded-md bg-white border border-brand-sky text-brand-sky hover:bg-sky-50 text-xs font-semibold transition cursor-pointer"
          >
            Open NGO Analytics Dashboard
          </button>
        </div>
      </div>
    </section>
  );
}
