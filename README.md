# 🦷 CleftGuard AI — Clinical Dental Radiograph AI Triage & Assessment

A production-grade clinical AI microservice and interactive diagnostic workstation engineered for **pediatric alveolar cleft bone graft evaluation**.

Featuring simulated GPU inference latency, explainable AI (XAI) bone mineral density (BMD) calculations, interactive before/after split radiograph visualization, automated HIPAA Security Rule audit logging, real-time emergency webhook dispatches, and medical-grade PDF diagnostic report generation.

---

## 🌟 Key Features

1. **Interactive Radiograph Diagnostic Workspace**:
   - Draggable Before/After split comparison slider (Raw dental X-ray vs. AI JET Colormap Heatmap overlay with HUD bounding box).
   - Real-time overlay opacity controls, side-by-side mode, and 1-click clinical presets (**Sample A: Normal Graft Consolidation** vs. **Sample B: Cleft Resorption Defect**).

2. **Explainable AI (XAI) & Clinical Metrics**:
   - **Bone Density Index (BDI)**: Normalized radiopacity score ($0.0 - 1.0$) with a clinical decision threshold at $0.43$.
   - **Inference Confidence Gauge**: Computer-vision certainty score ($0 - 100\%$).
   - **ROI Defect Bounding Box**: Anatomical coordinates ($X, Y, W, H$).
   - **Clinical Recommendation & Protocol**: Actionable post-op surgical guidance.

3. **Live 6-Stage AI Inference Pipeline**:
   - Real-time multi-stage visual progress tracker during the 2.5s simulated GPU inference window.

4. **1-Click Clinical PDF Triage Report**:
   - Generates official multi-section diagnostic reports formatted with hospital headers, quantitative metrics, recommendations, and physician signature lines.

5. **🛡️ HIPAA Security Rule Compliance Ledger**:
   - SHA-256 cryptographic payload hashing and immutable JSONL access audit trail adhering to **45 CFR § 164.312(b)**.

6. **🚨 Emergency Webhook Gateway**:
   - Dispatches simulated high-urgency alerts via WhatsApp / SMS / Hospital Pager whenever a scan triggers `REVIEW REQUIRED`.

---

## 🚀 Quick Start Guide for Teammates

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/cleftguard-ai.git
cd cleftguard-ai
```

### 2. Set Up a Python Virtual Environment
```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
# On macOS / Linux:
source .venv/bin/activate
# On Windows:
# .venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
uvicorn main:app --reload --port 8000
```

### 5. Open the Web Application
Open your browser and navigate to:
👉 **`http://localhost:8000`**

---

## 📁 Project Structure

```
cleftguard-ai/
├── main.py                    # FastAPI application, lifecycle, middlewares, & routing
├── schemas.py                 # Pydantic data validation schemas
├── requirements.txt           # Python dependencies
├── audit_log.jsonl            # Immutable HIPAA compliance audit trail
├── notifications_log.json     # Logged emergency webhook payloads
├── services/
│   ├── ai_service.py          # Computer vision processing, ROI extraction & heatmap overlay
│   ├── notification_service.py# Urgent clinical webhook dispatcher (WhatsApp/SMS)
│   └── report_service.py      # Medical-grade clinical PDF triage report generator (fpdf2)
├── static/
│   ├── index.html             # Interactive clinical triage workstation
│   ├── css/style.css          # Clinical glassmorphic dark theme stylesheet
│   ├── js/app.js              # Interactive UI controller & split slider logic
│   └── samples/               # 1-click clinical test radiographs (Healthy vs Defect)
└── utils/
    └── audit_logger.py        # SHA-256 hashing & HIPAA audit logger
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves Interactive Clinical Dashboard |
| `GET` | `/health` | Microservice readiness and GPU status |
| `GET` | `/metrics` | Daily scan volume, latency, and uptime |
| `POST` | `/api/v1/analyze` | Dental X-ray computer-vision analysis |
| `POST` | `/api/v1/generate-report`| Medical PDF report generation |
| `GET` | `/api/v1/audit-logs` | HIPAA immutable audit trail |
| `GET` | `/api/v1/notifications` | Dispatched emergency webhook logs |
| `GET` | `/docs` | OpenAPI / Swagger documentation |

---

## 👥 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit your changes: `git commit -m "Add new feature"`
3. Push to the branch: `git push origin feature/my-feature`
4. Open a Pull Request!
