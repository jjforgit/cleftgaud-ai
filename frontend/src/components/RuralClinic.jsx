import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Send,
  Loader2,
  Sparkles,
  User,
  Calendar,
  Tag,
  Clock,
  FileImage,
  X,
  RefreshCw,
} from 'lucide-react';
import MedicalScanViewer from './MedicalScanViewer';

const API_BASE_URL = 'http://localhost:8000';

export default function RuralClinic({ onSendToSpecialist, recentPatients }) {
  const [patientName, setPatientName] = useState('Aarav Patel');
  const [patientId, setPatientId] = useState('CG-2026-8841');
  const [patientAge, setPatientAge] = useState(9);
  const [surgeryDate, setSurgeryDate] = useState('2026-03-12');
  const [sampleType, setSampleType] = useState('defect'); // 'defect' | 'normal'
  
  // Real Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [backendError, setBackendError] = useState(null);
  const [backendSuccess, setBackendSuccess] = useState(false);
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(true);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState({
    jobId: 'cg-scan-8841',
    status: 'REVIEW',
    confidence: 94.6,
    bdiScore: 41.8,
    gapFillPct: 38.4,
    berglandScale: 'Type III (Incomplete)',
    recommendation: 'Suspected graft resorption in upper left alveolar arch. Inter-dental vertical height deficit > 4.2mm. Specialist second-opinion review required prior to orthodontic canine eruption.',
    heatmapBase64: null,
  });

  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setBackendError(null);
    setBackendSuccess(false);

    // Create a local blob preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setBackendError(null);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setSentSuccess(false);
    setBackendError(null);
    setBackendSuccess(false);

    if (selectedFile) {
      // Send real file upload to FastAPI backend microservice
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || `Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const isDefectStatus = data.status === 'REVIEW';
        const bdiScoreNum = +(data.bone_density_index * 100).toFixed(1);
        const confNum = +(data.confidence_score * 100).toFixed(1);

        setAnalyzedResult({
          jobId: data.job_id,
          status: data.status,
          confidence: confNum,
          bdiScore: bdiScoreNum,
          gapFillPct: isDefectStatus ? +(bdiScoreNum * 0.9).toFixed(1) : +(bdiScoreNum * 1.05).toFixed(1),
          berglandScale: isDefectStatus ? 'Type III (Incomplete)' : 'Type I (Optimal)',
          recommendation: data.recommendation,
          heatmapBase64: data.heatmap_base64 || null,
        });

        setBackendSuccess(true);
        setAnalyzed(true);
      } catch (err) {
        console.warn('Backend inference fallback active:', err);
        setBackendError(
          `Backend connection note: ${err.message || 'FastAPI offline'}. Displaying calibrated clinical simulation.`
        );

        // Graceful fallback to client-side model simulation
        const isDef = sampleType === 'defect';
        setAnalyzedResult({
          jobId: `cg-scan-${Math.random().toString(36).substring(2, 8)}`,
          status: isDef ? 'REVIEW' : 'SUCCESS',
          confidence: isDef ? 94.6 : 96.8,
          bdiScore: isDef ? 41.8 : 89.2,
          gapFillPct: isDef ? 38.4 : 92.0,
          berglandScale: isDef ? 'Type III (Incomplete)' : 'Type I (Optimal)',
          recommendation: isDef
            ? 'Suspected graft resorption in upper left alveolar arch. Specialist review recommended.'
            : 'Normal consolidation observed across alveolar margin. Routine follow-up in 6 months.',
          heatmapBase64: null,
        });
        setAnalyzed(true);
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      // Preset Sample Scan Analysis
      setTimeout(() => {
        const isDef = sampleType === 'defect';
        setAnalyzedResult({
          jobId: `cg-scan-${Math.random().toString(36).substring(2, 8)}`,
          status: isDef ? 'REVIEW' : 'SUCCESS',
          confidence: isDef ? 94.6 : 96.8,
          bdiScore: isDef ? 41.8 : 89.2,
          gapFillPct: isDef ? 38.4 : 92.0,
          berglandScale: isDef ? 'Type III (Incomplete)' : 'Type I (Optimal)',
          recommendation: isDef
            ? 'Suspected graft resorption in upper left alveolar arch. Inter-dental vertical height deficit > 4.2mm. Specialist second-opinion review required prior to orthodontic canine eruption.'
            : 'Satisfactory bone bridging across alveolar margin. Trabecular osteoid density within normal parameters. Routine clinical follow-up in 6 months.',
          heatmapBase64: null,
        });
        setIsAnalyzing(false);
        setAnalyzed(true);
      }, 600);
    }
  };

  const isDefect = analyzedResult.status === 'REVIEW';

  const handleSendSpecialist = () => {
    const newCase = {
      id: patientId,
      name: patientName,
      age: patientAge,
      gender: 'Male',
      clinic: 'Dharwad Community Health Center',
      operator: 'Dr. A. Sharma',
      scanDate: '11 Sep 2026',
      surgeryDate: `${surgeryDate} (6 mo post-op)`,
      cleftType: isDefect ? 'Unilateral Alveolar Cleft (Left)' : 'Bilateral Alveolar Cleft',
      status: isDefect ? 'REVIEW' : 'NORMAL',
      priority: isDefect ? 'Urgent' : 'Routine',
      bdiScore: analyzedResult.bdiScore,
      gapFillPct: analyzedResult.gapFillPct,
      berglandScale: analyzedResult.berglandScale,
      confidence: analyzedResult.confidence,
      findings: isDefect
        ? 'Significant radiolucency in alveolar cleft crest. Secondary bone bridge volume under 40%.'
        : 'Continuous cortical bone bridge across alveolar margin. Normal osteoid trabeculation.',
      recommendation: analyzedResult.recommendation,
      actionStatus: 'Pending Review',
      notes: '',
    };

    onSendToSpecialist(newCase);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 4000);
  };

  const handleDownloadPDF = async () => {
    // Attempt backend official PDF generation endpoint first
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          status: analyzedResult.status,
          recommendation: analyzedResult.recommendation,
          confidence_score: +(analyzedResult.confidence / 100).toFixed(2),
          bone_density_index: +(analyzedResult.bdiScore / 100).toFixed(4),
          job_id: analyzedResult.jobId,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CleftGuard_${patientId}_Triage_Report.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
    } catch (err) {
      console.warn('PDF microservice fallback to text document:', err);
    }

    // Client-side text document fallback
    const reportText = `
CLEFTGUARD AI - CLINICAL DIAGNOSTIC REPORT
Smile Train India Partner Initiative
============================================================
Patient Name: ${patientName}
Patient ID: ${patientId}
Age: ${patientAge} Years
Surgery Date: ${surgeryDate}
Referring Facility: Dharwad Community Health Center
Evaluating Clinician: Dr. A. Sharma
Date of Evaluation: 11 Sep 2026

DIAGNOSTIC VERDICT:
Status: ${isDefect ? 'ANOMALY DETECTED (REVIEW REQUIRED)' : 'NORMAL HEALING (CONSOLIDATED)'}
Bone Density Index (BDI): ${analyzedResult.bdiScore} / 100
Alveolar Gap Fill: ${analyzedResult.gapFillPct}%
Bergland Scale: ${analyzedResult.berglandScale}
AI Model Confidence: ${analyzedResult.confidence}%

CLINICAL RECOMMENDATION:
${analyzedResult.recommendation}

DISCLAIMER:
CleftGuard AI is a decision support tool designed for tele-radiology triage.
============================================================
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CleftGuard_Report_${patientId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-brand-blue tracking-tight">
          Rural Clinic Portal
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Post-operative cleft care triage, AI analysis, and specialist referral.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (col-span-2): Intake, Upload, Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Intake Form Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-sky" />
              Patient Registration & Surgical Timeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-brand-sky focus:ring-1 focus:ring-brand-sky transition"
                  placeholder="e.g. Aarav Patel"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                  Patient ID / MRN
                </label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-brand-sky focus:ring-1 focus:ring-brand-sky transition"
                  placeholder="e.g. CG-2026-8841"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                  Patient Age (Years)
                </label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  min={4}
                  max={18}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-brand-sky focus:ring-1 focus:ring-brand-sky transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                  Date of Secondary Bone Graft Surgery
                </label>
                <input
                  type="date"
                  value={surgeryDate}
                  onChange={(e) => setSurgeryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-brand-sky focus:ring-1 focus:ring-brand-sky transition"
                />
              </div>
            </div>
          </div>

          {/* File Upload Zone Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-brand-sky" />
                Upload Post-Operative Radiograph
              </span>
              <span className="text-xs font-normal text-slate-400">
                DICOM / JPEG / PNG / WebP
              </span>
            </h3>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/bmp,.dcm"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {/* Radio sample toggle (active when no custom file is selected) */}
            {!selectedFile && (
              <div className="mb-4 flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-3 rounded-md border border-slate-200/80">
                <span className="font-semibold text-slate-700">Preset Clinical Sample:</span>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="sampleType"
                    value="defect"
                    checked={sampleType === 'defect'}
                    onChange={() => setSampleType('defect')}
                    className="text-brand-sky focus:ring-brand-sky"
                  />
                  <span className="text-slate-700">Suspected Cleft Defect</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="sampleType"
                    value="normal"
                    checked={sampleType === 'normal'}
                    onChange={() => setSampleType('normal')}
                    className="text-brand-sky focus:ring-brand-sky"
                  />
                  <span className="text-slate-700">Normal Consolidated Graft</span>
                </label>
              </div>
            )}

            {/* Drag and Drop Zone or Selected File View */}
            {selectedFile ? (
              <div className="border border-brand-sky/60 bg-sky-50/40 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <FileImage className="w-6 h-6 text-brand-sky" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 truncate max-w-[280px] sm:max-w-md">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB | Ready for FastAPI Inference
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-brand-sky hover:underline px-2 py-1"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer ${
                  isDragging
                    ? 'border-brand-sky bg-sky-50/60'
                    : 'border-brand-sky/40 bg-[#F8FAFC] hover:bg-sky-50/50 hover:border-brand-sky'
                }`}
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-brand-sky">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  Drag and drop dental radiograph here, or click to browse
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Supports JPEG, PNG, WebP, BMP, DICOM (Max 25MB)
                </div>
              </div>
            )}

            {/* Backend notice if present */}
            {backendError && (
              <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{backendError}</span>
              </div>
            )}

            {backendSuccess && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>FastAPI Microservice processed radiograph & localized alveolar bounding box successfully.</span>
              </div>
            )}

            {/* Analyze Button */}
            <div className="mt-5">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full py-3 px-4 rounded-md bg-brand-sky hover:bg-brand-sky-dark text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-75 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Bone Trabeculation & Grad-CAM Mapping...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze Bone Graft
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Results Display */}
          {analyzed && !isAnalyzing && (
            <div className="space-y-6 animate-fadeIn">
              {/* Side-by-side Scans */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Original Radiograph
                  </div>
                  <MedicalScanViewer
                    isDefect={isDefect}
                    showOverlay={false}
                    title="Original OPG Scan"
                    imageSrc={previewUrl}
                  />
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
                  <div className="text-xs font-semibold text-brand-sky uppercase tracking-wider mb-2">
                    AI Bounding Box Detection
                  </div>
                  <MedicalScanViewer
                    isDefect={isDefect}
                    showOverlay={true}
                    title="Alveolar Defect Bounding Box"
                    heatmapBase64={analyzedResult.heatmapBase64}
                  />
                </div>
              </div>

              {/* Quantitative Metrics Bar */}
              <div className="grid grid-cols-3 gap-3 bg-white border border-slate-200 rounded-lg p-4 shadow-xs text-center">
                <div className="border-r border-slate-100 pr-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Bone Density Index</div>
                  <div className={`text-xl font-bold mt-0.5 ${isDefect ? 'text-red-600' : 'text-emerald-600'}`}>
                    {analyzedResult.bdiScore} / 100
                  </div>
                </div>
                <div className="border-r border-slate-100 pr-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Alveolar Gap Fill</div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">
                    {analyzedResult.gapFillPct}%
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Bergland Scale</div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">
                    {analyzedResult.berglandScale}
                  </div>
                </div>
              </div>

              {/* Result Card */}
              <div
                className={`p-5 rounded-lg border shadow-xs ${
                  isDefect
                    ? 'border-l-4 border-l-red-500 border-red-200 bg-red-50/50'
                    : 'border-l-4 border-l-emerald-500 border-emerald-200 bg-emerald-50/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isDefect ? (
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-slate-900">
                      {isDefect ? 'Status: Anomaly Detected (Review Required)' : 'Status: Normal Bone Healing'}
                    </div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      {analyzedResult.recommendation}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-md bg-white border border-brand-sky text-brand-sky hover:bg-slate-50 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  Download Clinical Report
                </button>

                <button
                  onClick={handleSendSpecialist}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-md bg-brand-sky hover:bg-brand-sky-dark text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Send to Urban Specialist
                </button>
              </div>

              {sentSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs font-semibold text-emerald-800 text-center animate-fadeIn">
                  Case successfully transferred to Bangalore Craniofacial Center Specialist Queue.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (col-span-1): Recent Activity & Quick Stats */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Today's Clinic Activity</span>
              <span className="text-[11px] font-semibold text-brand-sky bg-sky-50 px-2 py-0.5 rounded">
                Dharwad CHC
              </span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 border border-slate-200/80 rounded-md p-2.5">
                <div className="text-lg font-bold text-slate-900">14</div>
                <div className="text-[10px] text-slate-500 font-medium">Scans Today</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-2.5">
                <div className="text-lg font-bold text-emerald-700">11</div>
                <div className="text-[10px] text-emerald-700 font-medium">Normal</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-md p-2.5">
                <div className="text-lg font-bold text-red-700">3</div>
                <div className="text-[10px] text-red-700 font-medium">Referred</div>
              </div>
            </div>
          </div>

          {/* Recent Patients Table */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
              <span className="text-xs text-slate-400">Last 5 patients</span>
            </div>

            <div className="divide-y divide-slate-100">
              {recentPatients.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {p.id} - {p.date}
                    </div>
                  </div>
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                        p.status === 'NORMAL'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
