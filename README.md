# 🛡️ CyberRank AI
### Intelligent Cybersecurity Incident Prioritization Engine

CyberRank AI is an AI-powered cybersecurity incident prioritization platform designed to help security teams identify, analyze, and prioritize security incidents based on their potential business impact and risk level.

It combines **rule-based risk scoring, Machine Learning predictions, and hybrid intelligence** to provide explainable incident prioritization and investigation support.

---

## 🎯 Problem Statement

Security teams often receive multiple cybersecurity alerts simultaneously. Manually analyzing and prioritizing every incident can be time-consuming and inefficient.

CyberRank AI addresses this challenge by evaluating multiple risk factors, calculating a hybrid risk score, and ranking incidents according to their priority.

## ✨ Key Features

- **AI-Based Risk Assessment:** Evaluates cybersecurity incidents using multiple risk factors.
- **Hybrid Intelligence Engine:** Combines rule-based scoring with Machine Learning predictions.
- **Incident Prioritization:** Classifies incidents into Critical, High, Medium, and Low priorities.
- **Incident Management:** Supports incident assignment, status updates, and investigation notes.
- **Risk Analysis:** Provides individual incident analysis with risk factor contributions.
- **Security Recommendations:** Provides recommendations based on incident characteristics.
- **Interactive Dashboard:** Displays incident statistics and priority distribution.
- **Incident Filtering:** Search and filter incidents by priority and status.
- **Report Generation:** Export incident data as CSV and generate PDF reports.
- **Database Persistence:** Stores incident information using SQLite.

## 🧠 How It Works

CyberRank AI uses a hybrid approach:

**1. Incident Input**

The system receives incident information, including:

- Incident type
- Severity
- Data sensitivity
- Asset importance
- Attack confidence
- Number of affected users
- Business impact

**2. Rule-Based Risk Scoring**

Each risk factor is normalized and evaluated using predefined weights.

| Risk Factor | Weight |
|---|---:|
| Severity | 20% |
| Data Sensitivity | 15% |
| Asset Importance | 15% |
| Attack Confidence | 20% |
| Affected Users | 10% |
| Business Impact | 20% |

**3. Machine Learning Prediction**

A Random Forest classifier analyzes incident characteristics and produces an attack prediction score.

**4. Hybrid Risk Calculation**

The final score combines rule-based scoring and the ML model output:

`Final Score = (0.70 × Rule Score) + (0.30 × ML Score)`

**5. Priority Classification**

| Final Score | Priority |
|---|---|
| 85–100 | CRITICAL |
| 65–84.99 | HIGH |
| 40–64.99 | MEDIUM |
| Below 40 | LOW |

The dashboard displays ranked incidents and their associated analysis.

## 🏗️ System Architecture

```text
             CYBERRANK AI
                   |
          React Frontend
                   |
             FastAPI Backend
                   |
          Hybrid Intelligence
              /         \
             /           \
     Rule-Based          Machine
       Scoring           Learning
             \           /
              \         /
           Final Risk Score
                   |
          Priority Classification
                   |
          SQLite Database
                   |
          Dashboard & Reports
```

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Styling | Tailwind CSS, CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Python, FastAPI |
| Machine Learning | Scikit-learn, Random Forest |
| Data Processing | Pandas |
| Database | SQLite, SQLAlchemy |
| Model Storage | Joblib |
| API Testing | Swagger UI |

## 📂 Project Structure

```text
CyberRank-AI/
│
├── backend/
│   ├── main.py
│   ├── scoring.py
│   ├── models.py
│   ├── database.py
│   ├── db_models.py
│   └── migrate_incidents.py
│
├── dataset/
│   ├── generate_dataset.py
│   └── sample_incidents.csv
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── ml/
│   ├── train.py
│   ├── predict.py
│   ├── hybrid.py
│   └── model.pkl
│
├── requirements.txt
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

- Python 3.10 or later
- Node.js and npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/madhansanjay14-arc/CyberRank-AI.git
```

Navigate into the project:

```bash
cd CyberRank-AI
```

### 2. Backend Setup

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
python -m uvicorn backend.main:app --reload --port 8001
```

Backend URL:

`http://127.0.0.1:8001`

API documentation:

`http://127.0.0.1:8001/docs`

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

`http://localhost:5173`

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Backend health check |
| POST | `/incidents` | Submit a new incident |
| POST | `/incidents/bulk` | Submit multiple incidents |
| GET | `/incidents/ranked` | Retrieve ranked incidents |
| GET | `/incidents/{incident_id}` | Retrieve incident details |
| GET | `/incidents/{incident_id}/analysis` | Get incident risk analysis |
| GET | `/statistics` | Retrieve dashboard statistics |
| PATCH | `/incidents/{incident_id}/assign` | Assign an incident |
| PATCH | `/incidents/{incident_id}/status` | Update incident status |
| PATCH | `/incidents/{incident_id}/notes` | Update investigation notes |

## 🤖 Machine Learning Model

CyberRank AI currently uses a Random Forest classifier trained on a synthetic cybersecurity incident dataset.

The model is integrated into the hybrid scoring engine to supplement rule-based risk assessment.

**Important:** The current dataset and target labels are synthetic and rule-generated. Model predictions are experimental and should not be interpreted as validated real-world attack probabilities. Further training and evaluation on representative real-world cybersecurity data are required.

## 🚀 Future Enhancements

- Real-time security alert integration.
- Integration with SIEM platforms.
- Advanced anomaly detection.
- Explainable AI visualizations.
- Email and notification-based alerts.
- Advanced threat intelligence integration.
- Deployment to cloud infrastructure.
- Training and validation using real-world cybersecurity datasets.

## 👨‍💻 Developer

**Madhan Sanjay S**

BE Computer Science and Engineering

Sri Krishna College of Engineering and Technology

## 📌 Project Information

**Project Name:** CyberRank AI

**Category:** Artificial Intelligence | Cybersecurity | Machine Learning

**Type:** Full-Stack Web Application

**Status:** Working Prototype / Ongoing Development

## 📜 License

This project is currently available for educational and demonstration purposes.
