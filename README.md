# 🦷 CleftGuard AI — Clinical Dental Radiograph AI Triage & Assessment

A production-grade clinical AI microservice and interactive diagnostic workstation engineered for **pediatric alveolar cleft bone graft evaluation**.

Featuring **PyTorch Convolutional Neural Networks (ResNet-18 / DenseNet-121)** with **Grad-CAM Explainable AI (XAI)**, bone mineral density (BMD) calculations, interactive before/after split radiograph visualization, automated HIPAA Security Rule audit logging, real-time emergency webhook dispatches, and medical-grade PDF diagnostic report generation.

---

## 🌟 Key Features

1. **🧠 Real PyTorch Deep Learning & Grad-CAM**:
   - Trained Convolutional Neural Network classifying radiographs (`Normal Bone Consolidation` vs. `Cleft Resorption Defect`).
   - Authentic **Grad-CAM saliency heatmaps** generated on the final convolutional layers.

2. **Interactive Radiograph Diagnostic Workspace**:
   - Draggable Before/After split comparison slider (Raw dental X-ray vs. AI Grad-CAM Heatmap overlay with HUD bounding box).
   - Real-time overlay opacity controls, side-by-side mode, and 1-click clinical presets (**Sample A: Normal Graft** vs. **Sample B: Resorption Defect**).

3. **Explainable AI (XAI) & Clinical Metrics**:
   - **Bone Density Index (BDI)**: Normalized radiopacity score ($0.0 - 1.0$) with a clinical decision threshold at $0.43$.
   - **Model Confidence Score**: Real softmax output certainty ($0 - 100\%$).
   - **ROI Defect Bounding Box**: Anatomical coordinates ($X, Y, W, H$).
   - **Clinical Recommendation & Protocol**: Actionable post-op surgical guidance.

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
git clone https://github.com/jjforgit/cleftgaud-ai.git
cd cleftgaud-ai
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
Open **`http://localhost:8000`** in your browser.

---

## 🏋️‍♂️ Training & Fine-Tuning the AI Model

### Step 1: Generate or Load Clinical Radiographs
To generate an initial augmented dataset (360 sample radiographs across Train, Val, and Test sets):
```bash
python generate_dataset.py --train 120 --val 30 --test 30
```

*(To use real patient X-rays, simply drop your images into `dataset/train/normal/` and `dataset/train/defect/`)*.

### Step 2: Train the Deep Learning Model
Run the PyTorch training pipeline with GPU acceleration (Apple Silicon MPS or NVIDIA CUDA):
```bash
# Train ResNet-18 (Default)
python train.py --arch resnet18 --epochs 8 --batch-size 16

# Or train DenseNet-121 (Medical Radiology Standard)
python train.py --arch densenet121 --epochs 8 --batch-size 16
```

The script will:
- Apply medical data augmentations (rotation, jitter, flipping).
- Track Training/Validation Loss, Accuracy, Sensitivity (Recall), and F1-Score.
- Save the best model checkpoint to `models/cleftguard_model.pth`.
- Save metrics history to `models/training_metrics.json`.

The FastAPI server and web dashboard will automatically load and use the newly trained weights!

---

## 📁 Project Structure

```
cleftgaud-ai/
├── main.py                    # FastAPI application, lifecycle, middlewares, & routing
├── train.py                   # PyTorch deep learning training & evaluation pipeline
├── generate_dataset.py        # Synthetic dental radiograph dataset generator
├── schemas.py                 # Pydantic data validation schemas
├── requirements.txt           # Python dependencies (FastAPI, PyTorch, TorchVision, OpenCV)
├── audit_log.jsonl            # Immutable HIPAA compliance audit trail
├── notifications_log.json     # Logged emergency webhook payloads
├── dataset/                   # Partitioned radiograph dataset (train, val, test)
├── models/                    # Saved PyTorch model checkpoints (.pth) & training metrics
├── services/
│   ├── ai_service.py          # PyTorch inference, Grad-CAM heatmap engine & ROI extraction
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
| `POST` | `/api/v1/analyze` | Dental X-ray PyTorch inference & Grad-CAM |
| `POST` | `/api/v1/generate-report`| Medical PDF report generation |
| `GET` | `/api/v1/audit-logs` | HIPAA immutable audit trail |
| `GET` | `/api/v1/notifications` | Dispatched emergency webhook logs |
| `GET` | `/docs` | OpenAPI / Swagger documentation |

---

## 👥 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit your changes: `git commit -m "feat: add new capability"`
3. Push to the branch: `git push origin feature/my-feature`
4. Open a Pull Request!
