/**
 * CleftGuard AI — Clinical Interactive Frontend Controller
 * 
 * Manages image ingestion, live simulated GPU inference pipeline tracking,
 * interactive radiograph before/after split slider visualizer,
 * explainable AI (XAI) diagnostics, HIPAA audit logging, and PDF report downloads.
 */

// Application State
const state = {
  selectedFile: null,
  selectedPreset: null,
  rawImageSrc: null,
  heatmapImageSrc: null,
  currentAnalysis: null,
  currentViewMode: 'split',
  splitPosition: 50,
  isDraggingSplit: false,
  pipelineInterval: null,
};

// DOM Elements
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const filePreviewStrip = document.getElementById('filePreviewStrip');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const btnAnalyze = document.getElementById('btnAnalyze');
const patientIdInput = document.getElementById('patientIdInput');
const notesInput = document.getElementById('notesInput');

// Viewport Elements
const viewportPlaceholder = document.getElementById('viewportPlaceholder');
const splitViewer = document.getElementById('splitViewer');
const sideViewer = document.getElementById('sideViewer');
const heatmapLayer = document.getElementById('heatmapLayer');
const splitHandle = document.getElementById('splitHandle');
const imgOriginalSplit = document.getElementById('imgOriginalSplit');
const imgHeatmapSplit = document.getElementById('imgHeatmapSplit');
const imgOriginalSide = document.getElementById('imgOriginalSide');
const imgHeatmapSide = document.getElementById('imgHeatmapSide');
const opacitySlider = document.getElementById('opacitySlider');
const opacityDisplay = document.getElementById('opacityDisplay');

// Pipeline Elements
const pipelineCard = document.getElementById('pipelineCard');
const pipelineProgressBar = document.getElementById('pipelineProgressBar');
const pipelineTimer = document.getElementById('pipelineTimer');

// Results & XAI Elements
const resultsSection = document.getElementById('resultsSection');
const triageBanner = document.getElementById('triageBanner');
const triageIcon = document.getElementById('triageIcon');
const triageTitle = document.getElementById('triageTitle');
const triageSubtext = document.getElementById('triageSubtext');
const resultJobId = document.getElementById('resultJobId');
const resultTimestamp = document.getElementById('resultTimestamp');
const densityValue = document.getElementById('densityValue');
const densityStateTag = document.getElementById('densityStateTag');
const densityBarFill = document.getElementById('densityBarFill');
const radialConfidenceBar = document.getElementById('radialConfidenceBar');
const confidenceValue = document.getElementById('confidenceValue');
const bboxX = document.getElementById('bboxX');
const bboxY = document.getElementById('bboxY');
const bboxW = document.getElementById('bboxW');
const bboxH = document.getElementById('bboxH');
const recText = document.getElementById('recText');
const webhookBanner = document.getElementById('webhookBanner');
const webhookModal = document.getElementById('webhookModal');
const webhookPayloadCode = document.getElementById('webhookPayloadCode');
const auditTableBody = document.getElementById('auditTableBody');

// ---------------------------------------------------------------------------
// Initialization & Event Listeners
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  setupDropzone();
  setupSplitSlider();
  refreshAuditLogs();
  fetchMetrics();
});

// ---------------------------------------------------------------------------
// Ingestion: Drag & Drop and File Selection
// ---------------------------------------------------------------------------
function setupDropzone() {
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelected(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });
}

function handleFileSelected(file) {
  if (!file.type.match('image/.*')) {
    alert('Please select a valid image file (JPG or PNG).');
    return;
  }

  state.selectedFile = file;
  state.selectedPreset = null;
  clearPresetButtonStates();

  fileNameDisplay.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  filePreviewStrip.classList.add('visible');
  btnAnalyze.disabled = false;

  // Read file to preview raw radiograph immediately
  const reader = new FileReader();
  reader.onload = (e) => {
    state.rawImageSrc = e.target.result;
    showInitialImagePreview(e.target.result);
  };
  reader.readAsDataURL(file);
}

function clearSelectedFile() {
  state.selectedFile = null;
  state.selectedPreset = null;
  state.rawImageSrc = null;
  state.heatmapImageSrc = null;
  state.currentAnalysis = null;
  fileInput.value = '';
  
  clearPresetButtonStates();
  filePreviewStrip.classList.remove('visible');
  btnAnalyze.disabled = true;
  
  viewportPlaceholder.style.display = 'flex';
  splitViewer.classList.remove('active');
  sideViewer.classList.remove('active');
  resultsSection.classList.remove('visible');
  webhookBanner.classList.remove('visible');
  pipelineCard.classList.remove('active');
}

function clearPresetButtonStates() {
  document.getElementById('btnPresetHealthy').className = 'preset-btn';
  document.getElementById('btnPresetDefect').className = 'preset-btn';
}

// ---------------------------------------------------------------------------
// 1-Click Sample Presets Loader
// ---------------------------------------------------------------------------
async function loadSamplePreset(type) {
  clearPresetButtonStates();
  const isHealthy = type === 'healthy';
  const btn = document.getElementById(isHealthy ? 'btnPresetHealthy' : 'btnPresetDefect');
  btn.classList.add('active', isHealthy ? 'healthy' : 'defect');

  state.selectedPreset = type;
  const sampleUrl = isHealthy ? '/static/samples/sample_healthy.png' : '/static/samples/sample_defect.png';
  const sampleName = isHealthy ? 'sample_healthy_graft.png' : 'sample_cleft_resorption.png';

  patientIdInput.value = isHealthy ? 'PT-HEALTHY-01' : 'PT-REVIEW-02';
  notesInput.value = isHealthy 
    ? 'Routine 6-mo follow-up: Bone consolidation evaluation' 
    : 'Suspected bone loss at cleft margin / secondary resorption';

  try {
    const response = await fetch(sampleUrl);
    const blob = await response.blob();
    const file = new File([blob], sampleName, { type: 'image/png' });
    
    state.selectedFile = file;
    fileNameDisplay.textContent = `${sampleName} (Preset)`;
    filePreviewStrip.classList.add('visible');
    btnAnalyze.disabled = false;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      state.rawImageSrc = e.target.result;
      showInitialImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

  } catch (err) {
    console.error('Failed to load sample preset:', err);
    alert('Failed to load preset image.');
  }
}

function showInitialImagePreview(src) {
  viewportPlaceholder.style.display = 'none';
  resultsSection.classList.remove('visible');
  webhookBanner.classList.remove('visible');
  
  imgOriginalSplit.src = src;
  imgHeatmapSplit.src = src;
  imgOriginalSide.src = src;
  imgHeatmapSide.src = src;

  setViewMode(state.currentViewMode);
}

// ---------------------------------------------------------------------------
// AI Inference Execution & Live Pipeline Tracking
// ---------------------------------------------------------------------------
async function runAnalysis() {
  if (!state.selectedFile) return;

  // Prepare UI for execution
  btnAnalyze.disabled = true;
  btnAnalyze.innerHTML = `<span>⏳ Running AI Inference...</span>`;
  resultsSection.classList.remove('visible');
  webhookBanner.classList.remove('visible');
  
  // Start animated multi-stage progress pipeline
  startPipelineAnimation();

  const formData = new FormData();
  formData.append('file', state.selectedFile);

  try {
    const startTime = performance.now();
    const response = await fetch('/api/v1/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Server error (${response.status})`);
    }

    const result = await response.json();
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    
    // Complete pipeline animation
    completePipelineAnimation();

    // Process and display clinical findings
    state.currentAnalysis = result;
    state.heatmapImageSrc = `data:image/jpeg;base64,${result.heatmap_base64}`;

    displayAnalysisResults(result, elapsed);
    
    // Auto-refresh HIPAA audit trail and telemetry
    setTimeout(refreshAuditLogs, 500);
    setTimeout(fetchMetrics, 600);

  } catch (error) {
    console.error('Analysis error:', error);
    clearInterval(state.pipelineInterval);
    pipelineCard.classList.remove('active');
    alert(`Clinical AI Inference Failed: ${error.message}`);
  } finally {
    btnAnalyze.disabled = false;
    btnAnalyze.innerHTML = `<span>⚡ Run Clinical AI Triage</span>`;
  }
}

function startPipelineAnimation() {
  pipelineCard.classList.add('active');
  pipelineProgressBar.style.width = '0%';
  
  // Reset stages
  for (let i = 1; i <= 6; i++) {
    const stage = document.getElementById(`stage${i}`);
    stage.className = 'stage-item';
  }

  const startTime = Date.now();
  const totalDurationMs = 2500; // Match 2.5s simulated GPU inference

  clearInterval(state.pipelineInterval);
  state.pipelineInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(100, (elapsed / totalDurationMs) * 100);
    pipelineProgressBar.style.width = `${progress}%`;
    pipelineTimer.textContent = `${(elapsed / 1000).toFixed(1)}s / 2.5s`;

    // Step transitions
    if (progress >= 10 && progress < 30) {
      setStageState(1, 'completed');
      setStageState(2, 'in-progress');
    } else if (progress >= 30 && progress < 50) {
      setStageState(2, 'completed');
      setStageState(3, 'in-progress');
    } else if (progress >= 50 && progress < 70) {
      setStageState(3, 'completed');
      setStageState(4, 'in-progress');
    } else if (progress >= 70 && progress < 90) {
      setStageState(4, 'completed');
      setStageState(5, 'in-progress');
    } else if (progress >= 90) {
      setStageState(5, 'completed');
      setStageState(6, 'in-progress');
    } else {
      setStageState(1, 'in-progress');
    }

    if (elapsed >= totalDurationMs) {
      clearInterval(state.pipelineInterval);
    }
  }, 50);
}

function setStageState(num, status) {
  const stage = document.getElementById(`stage${num}`);
  if (!stage) return;
  if (status === 'completed') {
    stage.className = 'stage-item completed';
    stage.querySelector('.stage-dot').textContent = '✓';
  } else if (status === 'in-progress') {
    stage.className = 'stage-item in-progress';
  }
}

function completePipelineAnimation() {
  clearInterval(state.pipelineInterval);
  pipelineProgressBar.style.width = '100%';
  pipelineTimer.textContent = '2.5s / 2.5s (Completed)';
  for (let i = 1; i <= 6; i++) {
    setStageState(i, 'completed');
  }
}

// ---------------------------------------------------------------------------
// Render Results & Explainable AI (XAI)
// ---------------------------------------------------------------------------
function displayAnalysisResults(data, elapsedSeconds) {
  // Update Radiograph Images with AI Heatmap
  imgHeatmapSplit.src = state.heatmapImageSrc;
  imgHeatmapSide.src = state.heatmapImageSrc;
  
  if (state.rawImageSrc) {
    imgOriginalSplit.src = state.rawImageSrc;
    imgOriginalSide.src = state.rawImageSrc;
  }

  // Triage Banner Status
  const isHealthy = data.status === 'SUCCESS';
  triageBanner.className = `triage-decision-banner ${isHealthy ? 'success' : 'review'}`;
  triageIcon.textContent = isHealthy ? '✓' : '🚨';
  
  if (isHealthy) {
    triageTitle.textContent = 'STATUS: NORMAL ALVEOLAR BONE HEALING';
    triageSubtext.textContent = 'Bone graft structure is stable and consolidated with uniform radio-opacity.';
  } else {
    triageTitle.textContent = 'STATUS: REVIEW REQUIRED — DEFECT DETECTED';
    triageSubtext.textContent = 'Suspected bone graft resorption or radiolucent cleft cavity detected.';
  }

  resultJobId.textContent = `Job ID: ${data.job_id}`;
  resultTimestamp.textContent = new Date(data.timestamp).toUTCString();

  // Bone Density Index (BDI)
  const density = data.bone_density_index;
  densityValue.textContent = density.toFixed(4);
  densityBarFill.style.width = `${Math.min(100, Math.max(0, density * 100))}%`;
  
  if (isHealthy) {
    densityStateTag.textContent = 'Healthy Graft (≥0.43)';
    densityStateTag.className = 'density-state-tag healthy';
  } else {
    densityStateTag.textContent = 'Resorption Risk (<0.43)';
    densityStateTag.className = 'density-state-tag resorption';
  }

  // Model Confidence Radial Meter
  const conf = data.confidence_score;
  confidenceValue.textContent = `${(conf * 100).toFixed(1)}%`;
  const circumference = 2 * Math.PI * 25; // r=25 -> ~157.08
  const offset = circumference - (conf * circumference);
  radialConfidenceBar.style.strokeDashoffset = offset;
  radialConfidenceBar.style.stroke = isHealthy ? 'var(--emerald-success)' : 'var(--crimson-alert)';

  // Anomaly Bounding Box Coordinates
  const bbox = data.anomaly_bounding_box;
  bboxX.textContent = `${bbox.x} px`;
  bboxY.textContent = `${bbox.y} px`;
  bboxW.textContent = `${bbox.width} px`;
  bboxH.textContent = `${bbox.height} px`;

  // Clinical Recommendation
  recText.textContent = data.recommendation;

  // Emergency Webhook Alert
  if (!isHealthy) {
    webhookBanner.classList.add('visible');
    const webhookPayload = {
      event: "URGENT_TRIAGE_ALERT",
      job_id: data.job_id,
      timestamp: data.timestamp,
      triage_status: data.status,
      clinical_urgency: "HIGH",
      bone_density_index: data.bone_density_index,
      confidence_score: data.confidence_score,
      anomaly_region: data.anomaly_bounding_box,
      dispatch_channel: "WhatsApp-Clinician-Direct & SMS-Triage-Gateway",
      recipient: "Pediatric Craniofacial Surgical On-Call",
      message: `🚨 URGENT CLINICAL ALERT: CleftGuard AI detected potential alveolar bone graft resorption on Scan ID #${data.job_id}. Bone Density Index: ${data.bone_density_index.toFixed(4)} (Confidence: ${(data.confidence_score*100).toFixed(1)}%). Secondary surgical review recommended.`
    };
    webhookPayloadCode.textContent = JSON.stringify(webhookPayload, null, 2);
  } else {
    webhookBanner.classList.remove('visible');
  }

  // Reveal results container
  resultsSection.classList.add('visible');
}

// ---------------------------------------------------------------------------
// Radiograph Viewer Controls & Split Slider
// ---------------------------------------------------------------------------
function setupSplitSlider() {
  const onMove = (e) => {
    if (!state.isDraggingSplit) return;
    const rect = splitViewer.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (!clientX) return;

    let pos = ((clientX - rect.left) / rect.width) * 100;
    pos = Math.max(5, Math.min(95, pos));
    
    state.splitPosition = pos;
    heatmapLayer.style.width = `${pos}%`;
    splitHandle.style.left = `${pos}%`;
  };

  const startDrag = (e) => {
    state.isDraggingSplit = true;
    splitViewer.style.cursor = 'ew-resize';
  };

  const stopDrag = () => {
    state.isDraggingSplit = false;
    splitViewer.style.cursor = 'default';
  };

  splitHandle.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', stopDrag);

  // Touch Support
  splitHandle.addEventListener('touchstart', startDrag, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('touchend', stopDrag);
}

function setViewMode(mode) {
  state.currentViewMode = mode;
  ['modeSplit', 'modeSide', 'modeHeatmap', 'modeOriginal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });

  const activeBtn = document.getElementById(`mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
  if (activeBtn) activeBtn.classList.add('active');

  if (mode === 'split') {
    splitViewer.classList.add('active');
    sideViewer.classList.remove('active');
    heatmapLayer.style.width = `${state.splitPosition}%`;
    splitHandle.style.display = 'block';
    heatmapLayer.style.display = 'flex';
  } else if (mode === 'side') {
    splitViewer.classList.remove('active');
    sideViewer.classList.add('active');
  } else if (mode === 'heatmap') {
    splitViewer.classList.add('active');
    sideViewer.classList.remove('active');
    heatmapLayer.style.width = '100%';
    splitHandle.style.display = 'none';
    heatmapLayer.style.display = 'flex';
  } else if (mode === 'original') {
    splitViewer.classList.add('active');
    sideViewer.classList.remove('active');
    heatmapLayer.style.display = 'none';
    splitHandle.style.display = 'none';
  }
}

function updateHeatmapOpacity(val) {
  opacityDisplay.textContent = `${val}%`;
  const alpha = val / 100.0;
  imgHeatmapSplit.style.opacity = alpha;
  imgHeatmapSide.style.opacity = alpha;
}

// ---------------------------------------------------------------------------
// 1-Click Clinical PDF Report Download
// ---------------------------------------------------------------------------
async function downloadPdfReport() {
  if (!state.currentAnalysis) {
    alert('Please run a clinical scan analysis first.');
    return;
  }

  const btn = document.getElementById('btnDownloadReport');
  const originalText = btn.innerHTML;
  btn.innerHTML = `<span>⏳ Rendering Medical PDF Report...</span>`;
  btn.disabled = true;

  const patientId = patientIdInput.value.trim() || 'PT-UNKNOWN';
  const payload = {
    patient_id: patientId,
    status: state.currentAnalysis.status,
    recommendation: state.currentAnalysis.recommendation,
    confidence_score: state.currentAnalysis.confidence_score,
    bone_density_index: state.currentAnalysis.bone_density_index,
    job_id: state.currentAnalysis.job_id,
  };

  try {
    const response = await fetch('/api/v1/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`PDF generation failed (${response.status})`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `CleftGuard_${patientId}_Triage_Report.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);

  } catch (error) {
    console.error('PDF Report Download Error:', error);
    alert(`Failed to download report: ${error.message}`);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// ---------------------------------------------------------------------------
// Emergency Webhook Modal
// ---------------------------------------------------------------------------
function openWebhookModal() {
  webhookModal.classList.add('open');
}

function closeWebhookModal() {
  webhookModal.classList.remove('open');
}

// ---------------------------------------------------------------------------
// HIPAA Compliance Audit Trail Feed
// ---------------------------------------------------------------------------
async function refreshAuditLogs() {
  try {
    const response = await fetch('/api/v1/audit-logs?limit=8');
    if (!response.ok) return;

    const data = await response.json();
    if (!data.logs || data.logs.length === 0) {
      auditTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim);">No audit records found.</td></tr>`;
      return;
    }

    auditTableBody.innerHTML = data.logs.map(log => {
      const isSuccess = log.status === 'SUCCESS';
      const shortHash = log.file_hash ? `${log.file_hash.substring(0, 10)}...${log.file_hash.substring(log.file_hash.length - 6)}` : 'N/A';
      const formattedDate = new Date(log.timestamp).toLocaleTimeString() + ' (' + new Date(log.timestamp).toISOString().split('T')[0] + ')';
      
      return `
        <tr>
          <td>${formattedDate}</td>
          <td><span class="hash-badge">${log.job_id}</span></td>
          <td title="${log.file_hash}"><span class="hash-badge">${shortHash}</span></td>
          <td>${log.event_type || 'SCAN_INFERENCE'}</td>
          <td><span class="status-tag ${isSuccess ? 'success' : 'review'}">${log.status}</span></td>
          <td style="font-size: 11px; color: var(--text-dim);">${log.compliance_tag || '45 CFR § 164.312(b)'}</td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Failed to fetch audit logs:', err);
  }
}

// ---------------------------------------------------------------------------
// System Metrics Telemetry
// ---------------------------------------------------------------------------
async function fetchMetrics() {
  try {
    const response = await fetch('/metrics');
    if (!response.ok) return;

    const data = await response.json();
    if (data.scans_today !== undefined) {
      document.getElementById('metricScans').textContent = `${data.scans_today}`;
    }
    if (data.avg_inference_time_ms !== undefined) {
      document.getElementById('metricLatency').textContent = `${(data.avg_inference_time_ms / 1000).toFixed(2)}s`;
    }
    if (data.urgent_referrals !== undefined) {
      document.getElementById('metricUrgent').textContent = `${data.urgent_referrals}`;
    }
    if (data.uptime_seconds !== undefined) {
      const uptimeMin = (data.uptime_seconds / 60).toFixed(1);
      document.getElementById('metricUptime').textContent = `${uptimeMin} min`;
    }
  } catch (err) {
    console.warn('Metrics polling error:', err);
  }
}
