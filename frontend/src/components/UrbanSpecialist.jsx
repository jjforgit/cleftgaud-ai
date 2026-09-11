import React, { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, FileText, User, Building, Calendar, Activity, ChevronRight, ShieldAlert } from 'lucide-react';
import MedicalScanViewer from './MedicalScanViewer';

export default function UrbanSpecialist({ cases, setCases, onLogActivity }) {
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || 'CG-2026-8841');
  const [notes, setNotes] = useState('');
  const [actionFeedback, setActionFeedback] = useState(null);

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];
  const urgentCount = cases.filter((c) => c.actionStatus === 'Pending Review').length;

  const handleConfirmIntervention = () => {
    if (!selectedCase) return;
    const updated = cases.map((c) =>
      c.id === selectedCase.id
        ? { ...c, actionStatus: 'Surgical Revision Confirmed', notes: notes || 'Second opinion verified. Revision scheduled.' }
        : c
    );
    setCases(updated);
    setActionFeedback({
      type: 'confirmed',
      text: `Surgical intervention confirmed for ${selectedCase.name} (${selectedCase.id}). Logged in Bangalore Craniofacial Registry.`,
    });
    onLogActivity({
      type: 'review',
      title: `Specialist confirmed surgery for ${selectedCase.name} (${selectedCase.id})`,
      description: `Reviewed by Craniofacial Specialist - Secondary bone graft scheduled.`,
    });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleDismiss = () => {
    if (!selectedCase) return;
    const updated = cases.map((c) =>
      c.id === selectedCase.id
        ? { ...c, actionStatus: 'Dismissed (Benign Healing)', notes: notes || 'Benign margin discontinuity. 6-month monitoring recommended.' }
        : c
    );
    setCases(updated);
    setActionFeedback({
      type: 'dismissed',
      text: `Case ${selectedCase.name} (${selectedCase.id}) dismissed as false alarm / benign healing.`,
    });
    onLogActivity({
      type: 'review',
      title: `Case marked benign for ${selectedCase.name} (${selectedCase.id})`,
      description: `Follow-up in 6 months recommended by specialist.`,
    });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-brand-blue tracking-tight">
          Specialist Review Queue
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          AI-prioritized cases requiring clinical attention.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (col-span-1): Queue */}
        <div className="space-y-4">
          {/* Alert Banner */}
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">Triage Alert</div>
                <div className="text-sm font-semibold">
                  {urgentCount} Urgent Referrals Awaiting Review
                </div>
              </div>
            </div>
            <span className="text-xs font-bold bg-red-200/80 text-red-800 px-2 py-0.5 rounded">
              High Priority
            </span>
          </div>

          {/* Referral Queue Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Referral Queue</span>
              <span className="text-xs font-medium text-slate-400">
                {cases.length} Total Cases
              </span>
            </h3>

            <div className="space-y-2.5">
              {cases.map((c) => {
                const isSelected = c.id === selectedCase?.id;
                const isPending = c.actionStatus === 'Pending Review';

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCaseId(c.id);
                      setNotes(c.notes || '');
                    }}
                    className={`p-3.5 rounded-lg border transition cursor-pointer ${
                      isSelected
                        ? 'border-l-4 border-l-brand-sky border-slate-300 bg-slate-50 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-sm text-slate-900">
                        {c.name}
                      </span>
                      <span className="text-[11px] font-semibold text-brand-blue bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                        {c.confidence}% Conf.
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mb-2">
                      {c.id} - {c.age} yrs - {c.clinic}
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span
                        className={`font-semibold ${
                          isPending ? 'text-red-600' : 'text-emerald-700'
                        }`}
                      >
                        Status: {c.actionStatus}
                      </span>
                      <span className="text-slate-400 font-mono">BDI: {c.bdiScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (col-span-2): Case Review */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCase ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-5">
              {/* Patient Details Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedCase.name}
                    </h3>
                    <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {selectedCase.id}
                    </span>
                    <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      {selectedCase.priority} Triage
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Age: {selectedCase.age}Y</span>
                    <span>Facility: {selectedCase.clinic}</span>
                    <span>Referred by: {selectedCase.operator}</span>
                    <span>Surgery: {selectedCase.surgeryDate}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Current Action Status</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {selectedCase.actionStatus}
                  </div>
                </div>
              </div>

              {/* Two Images Side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                  <div className="text-xs font-semibold text-slate-600 mb-2">
                    Original Occlusal Radiograph
                  </div>
                  <MedicalScanViewer
                    isDefect={selectedCase.status === 'REVIEW'}
                    showOverlay={false}
                    title="Rural OPG Capture"
                  />
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                  <div className="text-xs font-semibold text-brand-sky mb-2">
                    AI Bounding Box Detection & Localization HUD
                  </div>
                  <MedicalScanViewer
                    isDefect={selectedCase.status === 'REVIEW'}
                    showOverlay={true}
                    title="Alveolar Defect Bounding Box"
                  />
                </div>
              </div>

              {/* AI Analysis Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-sm text-slate-600 space-y-1.5">
                <div className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Automated AI Analysis Summary
                </div>
                <div className="text-xs leading-relaxed">
                  <span className="font-semibold text-slate-900">Findings: </span>
                  {selectedCase.findings}
                </div>
                <div className="text-xs leading-relaxed">
                  <span className="font-semibold text-slate-900">Quantitative Metrics: </span>
                  Bone Density Index (BDI) = <span className="font-semibold text-red-600">{selectedCase.bdiScore}/100</span> |
                  Alveolar Gap Fill = <span className="font-semibold">{selectedCase.gapFillPct}%</span> |
                  Bergland Scale = <span className="font-semibold">{selectedCase.berglandScale}</span>
                </div>
              </div>

              {/* Clinical Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                  Specialist Clinical Evaluation Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter secondary evaluation findings, surgical clearance recommendations, or follow-up protocol..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-brand-sky focus:ring-1 focus:ring-brand-sky transition"
                />
              </div>

              {/* Decision Buttons Row */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleConfirmIntervention}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-md bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm Intervention
                </button>

                <button
                  onClick={handleDismiss}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  Dismiss as False Alarm
                </button>
              </div>

              {/* Feedback Alert */}
              {actionFeedback && (
                <div
                  className={`p-3 rounded-md text-xs font-semibold text-center animate-fadeIn ${
                    actionFeedback.type === 'confirmed'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-slate-100 border border-slate-200 text-slate-800'
                  }`}
                >
                  {actionFeedback.text}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500">
              No referral case selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
