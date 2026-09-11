import React, { useState } from 'react';
import { X, Hospital, UserCog, Mail, Lock, Building, FileCheck, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, defaultRole = 'rural', defaultMode = 'login', onAuthenticate }) {
  const [mode, setMode] = useState(defaultMode); // 'login' | 'signup'
  const [role, setRole] = useState(defaultRole); // 'rural' | 'specialist'
  const [email, setEmail] = useState('dr.sharma@dharwadchc.org');
  const [password, setPassword] = useState('••••••••••••');
  const [clinicName, setClinicName] = useState('Dharwad Community Health Center');
  const [licenseNumber, setLicenseNumber] = useState('KA-DCI-2018-9942');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAuthenticate({
      role,
      email,
      clinicName: role === 'rural' ? clinicName : 'Bangalore Craniofacial Institute',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none">
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full shadow-xl overflow-hidden animate-scaleIn">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white font-bold text-xs">
              CG
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 leading-tight">
                Cleft<span className="text-brand-sky">Guard</span> AI Portal Access
              </div>
              <div className="text-[11px] text-slate-500">
                Smile Train Clinical Decision Support
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Login vs Sign Up */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-100/70 p-1 m-6 mb-4 rounded-lg">
          <button
            onClick={() => setMode('login')}
            className={`py-2 text-xs font-semibold rounded-md transition cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-brand-blue shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Login to Portal
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`py-2 text-xs font-semibold rounded-md transition cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-brand-blue shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register Facility
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Role Selector Radio Cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Select Your Clinical Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setRole('rural')}
                className={`p-3 rounded-lg border flex items-center gap-2.5 transition cursor-pointer ${
                  role === 'rural'
                    ? 'border-brand-sky bg-sky-50/50 text-brand-blue ring-1 ring-brand-sky'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Hospital className={`w-4 h-4 ${role === 'rural' ? 'text-brand-sky' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="text-xs font-bold">Rural Clinic</div>
                  <div className="text-[10px] text-slate-400">Primary Triage</div>
                </div>
              </div>

              <div
                onClick={() => setRole('specialist')}
                className={`p-3 rounded-lg border flex items-center gap-2.5 transition cursor-pointer ${
                  role === 'specialist'
                    ? 'border-brand-sky bg-sky-50/50 text-brand-blue ring-1 ring-brand-sky'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <UserCog className={`w-4 h-4 ${role === 'specialist' ? 'text-brand-blue' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="text-xs font-bold">Specialist</div>
                  <div className="text-[10px] text-slate-400">Second Opinion</div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@clinic.org"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-brand-sky focus:ring-1 focus:ring-brand-sky transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-brand-sky focus:ring-1 focus:ring-brand-sky transition"
              />
            </div>
          </div>

          {/* Conditional Sign-up fields */}
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  {role === 'rural' ? 'Healthcare Facility Name' : 'Hospital / Craniofacial Center'}
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="e.g. Dharwad Community Health Center"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-brand-sky focus:ring-1 focus:ring-brand-sky transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Dental Council / Medical Registration No.
                </label>
                <div className="relative">
                  <FileCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. KA-DCI-2018-9942"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-brand-sky focus:ring-1 focus:ring-brand-sky transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-md bg-brand-sky hover:bg-brand-sky-dark text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>{mode === 'login' ? 'Enter Clinical Portal' : 'Register & Enter Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Secure indicator */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Tele-radiology Channel • HIPAA & ISO 13485 Compliant</span>
          </div>
        </form>
      </div>
    </div>
  );
}
