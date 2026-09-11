import React from 'react';
import { ArrowRight, AlertCircle, CheckCircle2, DollarSign, Clock, Users, HeartHandshake, ShieldCheck } from 'lucide-react';

export default function ImpactSection() {
  return (
    <section id="impact" className="bg-white py-24 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-bold text-brand-sky uppercase tracking-widest">
            Hope & Healing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Transforming Lives, <span className="text-brand-blue">One Smile at a Time.</span>
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            Early detection of alveolar bone graft complications prevents secondary surgeries and saves rural families from devastating travel costs.
          </p>
        </div>

        {/* Side-by-side Conceptual Comparison (Challenge vs Solution) */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-16">
          {/* Left Card: The Challenge */}
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="p-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-200/80 px-3 py-1 rounded-full uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
                <span>The Challenge</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 leading-snug">
                Geographic Distance Delays Critical Post-Surgical Interventions
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Secondary Alveolar Bone Grafting (SABG) is crucial for permanent canine tooth eruption in cleft patients. Over 15% of grafts experience incomplete bone bridging or resorption. In rural regions, traveling 300+ km to urban craniofacial centers is economically prohibitive, leaving complications unnoticed until irreversible arch collapse occurs.
              </p>
            </div>
            <div className="px-8 pb-8">
              <div className="rounded-lg overflow-hidden border border-slate-200 aspect-[16/9]">
                <img
                  src="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&q=80&w=800"
                  alt="Rural family in community healthcare setting"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Card: The Solution */}
          <div className="bg-sky-50/40 border border-sky-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="p-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-blue bg-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-sky" />
                <span>The Solution: CleftGuard AI</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 leading-snug">
                Localized AI Tele-Triage with Direct Specialist Second Opinions
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Local rural dentists take standard dental radiographs and receive instant AI Bone Density Index (BDI) and Precision Bounding Box Localization in under 5 minutes. High-risk graft resorptions are automatically prioritized and routed to city specialists, allowing timely secondary intervention before tooth eruption windows close.
              </p>
            </div>
            <div className="px-8 pb-8">
              <div className="rounded-lg overflow-hidden border border-sky-200 aspect-[16/9] shadow-xs">
                <img
                  src="/images/smile-transformation.jpg"
                  alt="Young girl holding a photograph of herself before cleft surgery, demonstrating successful smile and alveolar cleft rehabilitation"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3 Key Impact Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-6 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-sky-50 text-brand-sky flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold text-slate-900">4.2 Minutes</div>
            <div className="text-xs font-semibold text-slate-600 uppercase">Average Rural Triage Latency</div>
            <p className="text-xs text-slate-400">
              Down from 4-6 weeks of manual physical referral processing
            </p>
          </div>

          <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-6 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold text-slate-900">$24,800+ Saved</div>
            <div className="text-xs font-semibold text-slate-600 uppercase">Rural Family Travel Cost Offset</div>
            <p className="text-xs text-slate-400">
              Eliminates unnecessary travel expenses for routine consolidated cases
            </p>
          </div>

          <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-6 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 text-brand-blue flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold text-slate-900">98.4% Concordance</div>
            <div className="text-xs font-semibold text-slate-600 uppercase">Specialist Diagnostic Agreement</div>
            <p className="text-xs text-slate-400">
              Validated with Bergland Scale standard clinical guidelines
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
