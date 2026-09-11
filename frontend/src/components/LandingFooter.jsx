import React from 'react';
import { ShieldCheck, HeartHandshake, ExternalLink } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="bg-brand-blue text-white py-14 border-t border-brand-blue/80 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-sky-800/80">
          {/* Col 1: Logo & Mission Statement */}
          <div className="md:col-span-2 space-y-4">
            <div className="inline-flex bg-white px-3 py-1.5 rounded-lg shadow-xs">
              <img
                src="/images/cleftguard-logo.png"
                alt="CleftGuard AI"
                className="h-7 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-sky-100/80 leading-relaxed max-w-md">
              CleftGuard AI is a clinical tele-radiology decision support platform developed in partnership with Smile Train partner networks. Dedicated to eliminating secondary cleft bone graft morbidity and empowering rural dentists across underserved communities.
            </p>
            <div className="flex items-center gap-2 text-xs text-sky-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ISO 13485 Quality Management & HIPAA Compliant Architecture</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-200">
              Platform
            </div>
            <ul className="space-y-2 text-xs text-sky-100/80">
              <li>
                <a href="#mission" className="hover:text-white transition">Our Mission</a>
              </li>
              <li>
                <a href="#impact" className="hover:text-white transition">The Impact & Healing</a>
              </li>
              <li>
                <a href="#portals" className="hover:text-white transition">Rural Clinic Access</a>
              </li>
              <li>
                <a href="#portals" className="hover:text-white transition">Specialist Second Opinions</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Regulatory */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-200">
              Governance
            </div>
            <ul className="space-y-2 text-xs text-sky-100/80">
              <li>
                <span className="hover:text-white transition cursor-pointer">Privacy & Data Security</span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-pointer">Clinical Protocols</span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-pointer">Smile Train Partner Standards</span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-pointer">Research & Publications</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Strict Clinical Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-sky-200/70">
          <div>
            © 2026 CleftGuard AI • Smile Train Partner Initiative. All rights reserved.
          </div>
          <div className="text-right max-w-xl text-[11px] leading-relaxed text-sky-200/60">
            CleftGuard AI is a prototype for demonstration purposes. Not for clinical diagnosis. All clinical decisions must be made by qualified healthcare professionals.
          </div>
        </div>
      </div>
    </footer>
  );
}
