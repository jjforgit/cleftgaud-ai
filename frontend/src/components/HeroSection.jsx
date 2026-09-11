import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Activity, CheckCircle2 } from 'lucide-react';

export default function HeroSection({ onOpenAuth, onNavigateSection }) {
  return (
    <section className="bg-[#F8FAFC] pt-32 pb-20 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="space-y-6 text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-sky/10 border border-brand-sky/30 text-brand-sky px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Cleft Care Triage</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold text-slate-900 tracking-tight leading-[1.15]">
              Bringing Specialist Care to <span className="text-brand-blue">Every Village.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl">
              Empowering rural dentists with AI-driven post-operative monitoring, ensuring no child's alveolar bone graft recovery is left to chance.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => onOpenAuth('rural', 'signup')}
                className="px-6 py-3.5 rounded-md bg-brand-sky hover:bg-brand-sky-dark text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get Started as a Rural Clinic</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateSection('impact')}
                className="px-5 py-3.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Trust Markers */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Smile Train Partner Certified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-sky" />
                <span>98.4% Diagnostic Concordance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-brand-blue" />
                <span>28 Active Health Centers</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Image with Floating Indicator */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 bg-white aspect-[4/3] group">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"
                alt="Doctor gently examining a young pediatric cleft care patient in a comfortable clinical setting"
                className="w-full h-full object-cover group-hover:scale-102 transition duration-700 ease-out"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>

              {/* In-Image Caption */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-3.5 rounded-lg border border-slate-200/90 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Dr. A. Sharma & Patient Aarav</div>
                  <div className="text-[11px] text-slate-500">6-Month Post-Surgical Bone Density Assessment</div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  Tele-Triage Active
                </span>
              </div>
            </div>

            {/* Floating Trust Metric Card */}
            <div className="absolute -top-4 -right-4 bg-white border border-slate-200 rounded-xl p-3.5 shadow-md hidden sm:flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-50 text-brand-sky flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">1,240+ Screenings</div>
                <div className="text-[10px] text-slate-400">Across Rural Karnataka</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
