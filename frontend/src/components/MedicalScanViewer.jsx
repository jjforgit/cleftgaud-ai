import React from 'react';
import { Eye, Layers, ZoomIn } from 'lucide-react';

export default function MedicalScanViewer({
  isDefect = false,
  showOverlay = false,
  title = "Scan Preview",
  imageSrc = null,
  heatmapBase64 = null,
}) {
  const hasCustomHeatmap = showOverlay && heatmapBase64;
  const hasCustomOriginal = !showOverlay && imageSrc;

  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 relative group aspect-[4/3] flex flex-col items-center justify-center select-none">
      {hasCustomHeatmap ? (
        <img
          src={`data:image/jpeg;base64,${heatmapBase64}`}
          alt="AI Grad-CAM Heatmap"
          className="w-full h-full object-contain bg-black"
        />
      ) : hasCustomOriginal ? (
        <img
          src={imageSrc}
          alt="Original Radiograph"
          className="w-full h-full object-contain bg-black"
        />
      ) : (
        /* SVG Synthetic High-Contrast Radiograph Fallback */
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Base Radiograph Gradient */}
            <radialGradient id="xrayGlow" cx="50%" cy="60%" r="60%">
              <stop offset="0%" stopColor="#2c3440" />
              <stop offset="60%" stopColor="#131822" />
              <stop offset="100%" stopColor="#080c14" />
            </radialGradient>

            {/* Alveolar Bone Texture Pattern */}
            <pattern id="boneTrabeculae" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.8" fill="#475569" opacity="0.4" />
              <circle cx="5" cy="5" r="0.6" fill="#334155" opacity="0.3" />
            </pattern>

          </defs>

          {/* Background & Bone Trabeculae Texture */}
          <rect width="400" height="300" fill="url(#xrayGlow)" />
          <rect width="400" height="300" fill="url(#boneTrabeculae)" />

          {/* Maxillary / Alveolar Dental Arch Arc */}
          <path
            d="M 50 240 Q 200 130 350 240"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="38"
            strokeLinecap="round"
            opacity="0.45"
          />

          <path
            d="M 60 238 Q 200 138 340 238"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Tooth Roots */}
          {/* Central Incisor Left */}
          <ellipse cx="170" cy="180" rx="14" ry="42" fill="#E2E8F0" opacity="0.75" />
          <ellipse cx="170" cy="160" rx="8" ry="32" fill="#FFFFFF" opacity="0.9" />

          {/* Central Incisor Right */}
          <ellipse cx="230" cy="180" rx="14" ry="42" fill="#E2E8F0" opacity="0.75" />
          <ellipse cx="230" cy="160" rx="8" ry="32" fill="#FFFFFF" opacity="0.9" />

          {/* Lateral Incisor & Canine Right */}
          <ellipse cx="280" cy="200" rx="12" ry="46" fill="#CBD5E1" opacity="0.7" />
          <ellipse cx="325" cy="220" rx="15" ry="50" fill="#94A3B8" opacity="0.65" />

          {/* Left Alveolar Zone: Cleft Defect or Consolidated Bone */}
          {isDefect ? (
            /* Radiolucent cleft defect gap (dark pocket) */
            <g>
              <ellipse cx="125" cy="190" rx="18" ry="36" fill="#090D16" opacity="0.95" />
              <path
                d="M 115 165 Q 128 190 120 220"
                stroke="#0f172a"
                strokeWidth="10"
                fill="none"
                opacity="0.9"
              />
              {/* Displaced canine root */}
              <ellipse cx="85" cy="225" rx="14" ry="48" fill="#64748B" opacity="0.6" />
            </g>
          ) : (
            /* Consolidated bone graft bridging the cleft */
            <g>
              <ellipse cx="125" cy="190" rx="18" ry="36" fill="#E2E8F0" opacity="0.75" />
              <ellipse cx="125" cy="190" rx="12" ry="26" fill="#FFFFFF" opacity="0.85" />
              <ellipse cx="85" cy="225" rx="14" ry="48" fill="#CBD5E1" opacity="0.7" />
            </g>
          )}

          {/* AI Bounding Box & Anatomical ROI Detection (if enabled) */}
          {showOverlay && (
            <g>
              {/* ROI Focus Frame Fill */}
              <rect
                x="95"
                y="145"
                width="60"
                height="90"
                fill={isDefect ? "rgba(239, 68, 68, 0.08)" : "rgba(16, 185, 129, 0.08)"}
                stroke={isDefect ? "#EF4444" : "#10B981"}
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />

              {/* Corner HUD Brackets for Clinical Precision */}
              <g stroke={isDefect ? "#EF4444" : "#10B981"} strokeWidth="2.5" strokeLinecap="round">
                {/* Top-Left */}
                <line x1="95" y1="145" x2="105" y2="145" />
                <line x1="95" y1="145" x2="95" y2="155" />
                {/* Top-Right */}
                <line x1="155" y1="145" x2="145" y2="145" />
                <line x1="155" y1="145" x2="155" y2="155" />
                {/* Bottom-Left */}
                <line x1="95" y1="235" x2="105" y2="235" />
                <line x1="95" y1="235" x2="95" y2="225" />
                {/* Bottom-Right */}
                <line x1="155" y1="235" x2="145" y2="235" />
                <line x1="155" y1="235" x2="155" y2="225" />
              </g>

              {/* Anatomical Targeting Reticle Crosshair */}
              <g stroke={isDefect ? "#EF4444" : "#10B981"} strokeWidth="1" opacity="0.85">
                <line x1="120" y1="190" x2="130" y2="190" />
                <line x1="125" y1="185" x2="125" y2="195" />
                <circle cx="125" cy="190" r="3.5" fill="none" />
              </g>

              {/* HUD Header Label Badge */}
              <rect
                x="90"
                y="128"
                width="70"
                height="15"
                fill={isDefect ? "#EF4444" : "#10B981"}
                rx="3"
              />
              <text
                x="125"
                y="139"
                fill="#FFFFFF"
                fontSize="7.5"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="sans-serif"
                letterSpacing="0.4"
              >
                {isDefect ? "DEFECT: 4.8mm" : "CONSOLIDATED"}
              </text>

              {/* HUD Caliper Metric Badge */}
              <rect
                x="85"
                y="238"
                width="80"
                height="12"
                fill="#0F172A"
                stroke={isDefect ? "#EF4444" : "#10B981"}
                strokeWidth="0.8"
                rx="2"
              />
              <text
                x="125"
                y="247"
                fill="#E2E8F0"
                fontSize="6.5"
                fontWeight="600"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {isDefect ? "ROI 4.8mm | Conf 94%" : "BONE BRIDGE 96%"}
              </text>
            </g>
          )}

          {/* Anatomical Calibration Grid */}
          <g stroke="#334155" strokeWidth="0.5" opacity="0.4">
            <line x1="20" y1="20" x2="60" y2="20" />
            <line x1="20" y1="20" x2="20" y2="60" />
            <line x1="380" y1="20" x2="340" y2="20" />
            <line x1="380" y1="20" x2="380" y2="60" />
            <line x1="20" y1="280" x2="60" y2="280" />
            <line x1="20" y1="280" x2="20" y2="240" />
            <line x1="380" y1="280" x2="340" y2="280" />
            <line x1="380" y1="280" x2="380" y2="240" />
          </g>
        </svg>
      )}

      {/* Title & Badge Overlay */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
        <span className="text-[11px] font-semibold bg-slate-900/80 text-slate-300 border border-slate-700/80 px-2 py-0.5 rounded backdrop-blur-xs">
          {title}
        </span>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded">
          {hasCustomHeatmap ? "ROI Bounding Box" : showOverlay ? "Bounding Box HUD" : "OPG 100kV"}
        </span>
      </div>
    </div>
  );
}
