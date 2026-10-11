# Machine Learning-Based Driver Performance Analysis Using Formula 1 Telemetry Data

> **Academic Machine Learning Laboratory Mini-Project**  
> *Undergraduate B.Tech / Academic Project Scope*

---

## 1. Project Overview & Problem Statement

In modern Formula 1, vehicles produce over **1.1 million telemetry data points per second**, tracking throttle commitment, braking deceleration, transmission behavior, engine RPM, and speed trap velocity. 

This project implements an end-to-end Machine Learning pipeline that:
1. Programmatically acquires official Formula 1 timing and telemetry data using **FastF1**.
2. Preprocesses and cleans raw lap records (filtering pit in/out laps, non-representative laps, and safety car periods).
3. Engineers physical lap-level performance features from high-frequency time-series telemetry.
4. Performs **Regression** to predict lap times using *Linear Regression*, *Decision Tree Regressor*, and *Support Vector Regressor (SVR)*.
5. Performs **Binary Classification** to classify high-performance vs. low-performance laps using *Logistic Regression*, *Decision Tree Classifier*, and *Support Vector Machine (SVC)*.
6. Applies unsupervised **K-Means Clustering** with 2D **Principal Component Analysis (PCA)** to uncover distinct driving styles and tyre conservation stints.
7. Ranks telemetry feature importance to identify which driver inputs most dictate competitive lap times.
8. Presents findings through a high-performance **interactive Dark Motorsport Web Dashboard** (FastAPI + Vite/React + Tailwind + Recharts).

---

## 2. Theoretical Course Integration (Weeks 1–10)

| Course Module | Concepts | Project Implementation |
|---|---|---|
| **Week 1** | NumPy & Array Mathematics | Continuous speed vector statistics, min/max clipping, Euclidean distances |
| **Week 2** | Pandas & Data Visualization | Telemetry tabular alignment, filtering, and Recharts/Matplotlib charting |
| **Week 3** | Data Preprocessing | In/out lap filtering, sensor imputation, outlier detection, z-score/IQR |
| **Week 3/4** | Linear Regression | Lap time prediction via Ordinary Least Squares |
| **Week 4** | Parametric Evaluation Metrics | Regression evaluation: MAE, RMSE, and $R^2$ Score |
| **Week 5** | Logistic Regression | Binary lap performance probability modeling (sigmoid activation) |
| **Week 6** | Cost Functions & Loss Surfaces | Minimizing Mean Squared Error (MSE) and Log Loss |
| **Week 8/9** | Decision Trees (CART) | Non-linear recursive feature partitioning & Gini/MSE feature importances |
| **Week 9** | Support Vector Machines (SVM) | Maximal margin hyperplane classification (SVC) and $\epsilon$-insensitive tube regression (SVR) |
| **Week 10**| Data Clustering ($K$-Means) | Unsupervised partitioning of driver stint profiles with 2D PCA projection |

---

## 3. System Architecture & Pipeline

```text
┌────────────────────────┐      ┌───────────────────────────┐      ┌─────────────────────────┐
│     FastF1 API         │ ───► │  Data Preprocessing       │ ───► │  Feature Engineering    │
│  - 2023/2024 Sessions  │      │  - Drop in/out pit laps   │      │  - avg/max/min speed    │
│  - Speed, Throttle,    │      │  - Filter SC/outliers     │      │  - full throttle %      │
│    Brake, Gear, RPM    │      │  - Forward-fill sensor    │      │  - brake % & intensity  │
└────────────────────────┘      └───────────────────────────┘      │  - RPM, shifts, DRS     │
                                                                   └────────────┬────────────┘
                                                                                │
                                ┌───────────────────────────────────────────────┴───────────────────────────────┐
                                ▼                                               ▼                               ▼
                     ┌──────────────────────┐                       ┌──────────────────────┐        ┌──────────────────────┐
                     │  Regression Engine   │                       │Classification Engine │        │  Clustering Engine   │
                     │  - Linear Regression │                       │  - Logistic Reg.     │        │  - K-Means (K=3)     │
                     │  - Decision Tree     │                       │  - Decision Tree     │        │  - 2D PCA Projection │
                     │  - SVR (RBF Kernel)  │                       │  - SVC (RBF Kernel)  │        │  - Dynamic Profiles  │
                     └──────────┬───────────┘                       └──────────┬───────────┘        └──────────┬───────────┘
                                │                                               │                               │
                                └───────────────────────────────────────┬───────┴───────────────────────────────┘
                                                                        ▼
                                                   ┌───────────────────────────────────────────┐
                                                   │          FastAPI REST Backend             │
                                                   │        http://127.0.0.1:8000/api          │
                                                   └────────────────────┬──────────────────────┘
                                                                        ▼
                                                   ┌───────────────────────────────────────────┐
                                                   │    Vite + React Motorsport Dashboard      │
                                                   │          http://localhost:5173            │
                                                   └───────────────────────────────────────────┘
```

---

## 4. Engineered Telemetry Features

From raw millisecond-level telemetry streams, the pipeline computes per-lap aggregations:

- `avg_speed`: Lap mean velocity (km/h)
- `max_speed`: Peak velocity achieved before braking zones (km/h)
- `min_speed`: Minimum apex speed through the slowest hairpin/chicane (km/h)
- `speed_std`: Standard deviation of speed (cornering contrast)
- `avg_throttle`: Mean accelerator percentage
- `full_throttle_pct`: Fraction of lap spent at $\ge 95\%$ throttle
- `brake_pct`: Fraction of lap with brake pressure $> 0$
- `braking_intensity_avg`: Mean deceleration pressure during braking phases
- `avg_rpm`, `max_rpm`: Engine operating frequencies
- `avg_gear`, `gear_shifts_count`: Shifting activity throughout the lap
- `drs_usage_pct`: Proportion of track distance traversed with DRS open
- `tyre_age`: Cumulative completed racing laps on the current tyre set
- Target: `lap_time` (Continuous seconds) & `is_high_performance` ($\le \text{Median}$)

---

## 5. Machine Learning Evaluation Results

Experimental evaluation on the **2023 Italian Grand Prix (Monza)**:

### A. Lap Time Regression ($y = \text{LapTime}$)
| Algorithm | MAE (s) | RMSE (s) | $R^2$ Test | Status |
|---|---|---|---|---|
| **Linear Regression** | **0.2991s** | **0.3864s** | **0.7143** | **Optimal** |
| **Support Vector Regressor (SVR)** | 0.3162s | 0.4019s | 0.6910 | Benchmark |
| **Decision Tree Regressor** | 0.3724s | 0.4607s | 0.5939 | Non-linear baseline |

### B. Lap Performance Binary Classification
| Algorithm | Accuracy | Precision | Recall | F1-Score |
|---|---|---|---|---|
| **Decision Tree Classifier** | **87.5%** | **87.5%** | **87.5%** | **0.8750** |
| **Support Vector Machine (SVC)** | 85.4% | 81.5% | 91.7% | 0.8627 |
| **Logistic Regression** | 83.3% | 80.8% | 87.5% | 0.8400 |

### C. Unsupervised $K$-Means Driving Profile Clusters ($K=3$)
- **Cluster 1 (Aggressive Push Lap)**: Highest average speed ($240.8\text{ km/h}$), high throttle commitment ($74.2\%$).
- **Cluster 2 (Consistent Race Stint)**: Moderate speed ($238.6\text{ km/h}$), controlled tyre degradation.
- **Cluster 3 (High Tyre Degradation / Fuel Saving)**: Lower average speed ($237.9\text{ km/h}$), early coasting into braking zones.

---

## 6. Project Directory Structure

```text
ML_MINI_PROJECT/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI application & CORS
│   │   ├── config.py                  # Cache & directory settings
│   │   ├── api/
│   │   │   ├── routes_data.py         # Session listing, loading, preprocessing
│   │   │   ├── routes_models.py       # Regression, classification, clustering routes
│   │   │   └── routes_telemetry.py    # High-frequency distance trace comparison
│   │   ├── services/
│   │   │   ├── fastf1_service.py      # FastF1 fetcher + offline fallback
│   │   │   ├── preprocessing.py       # Lap cleaning & outlier filtering
│   │   │   └── feature_engineering.py # Lap feature extraction engine
│   │   ├── ml/
│   │   │   ├── regression.py          # LR, DT, SVR implementation
│   │   │   ├── classification.py      # Logistic Regression, DT, SVC
│   │   │   └── clustering.py          # K-Means + 2D PCA projection
│   │   └── utils/
│   │       └── serialization.py       # JSON sanitation helper
│   ├── data/
│   │   ├── fastf1_cache/              # Cached telemetry streams
│   │   └── processed/                 # Extracted CSV datasets
│   └── tests/
│       └── test_pipeline.py           # Verification test suite
├── frontend/                          # Vite + React + Tailwind + Recharts
│   ├── src/
│   │   ├── App.tsx                    # Main interactive dashboard
│   │   ├── components/                # Modular telemetry & ML cards
│   │   ├── services/api.ts            # Client HTTP API connector
│   │   └── types/index.ts             # TypeScript definitions
│   └── package.json
├── notebooks/                         # 6 Academic Viva Notebooks
│   ├── 01_data_acquisition.ipynb
│   ├── 02_data_preprocessing.ipynb
│   ├── 03_eda.ipynb
│   ├── 04_regression.ipynb
│   ├── 05_classification.ipynb
│   └── 06_clustering.ipynb
├── requirements.txt
├── run.py                             # One-click dual server launcher
└── README.md
```

---

## 7. Installation & Quick Start

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ (tested on Node v22)

### 1. Backend Setup
```bash
# Install Python dependencies
py -m pip install -r requirements.txt
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cd ..
```

### 3. Launching the Application

You can start both the FastAPI backend and React frontend with a single command:

```bash
py run.py
```

Or run them individually in separate terminals:

**Terminal 1 (Backend):**
```bash
py -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API Swagger Documentation*: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*Dashboard*: [http://localhost:5173](http://localhost:5173)

---

## 8. Running Academic Demonstration Notebooks

Launch Jupyter Notebook or VS Code to run the lab demonstration notebooks:

```bash
py -m pip install jupyter
jupyter notebook notebooks/
```

- **Notebook 01**: FastF1 data loading and disk caching.
- **Notebook 02**: Data cleaning and outlier filtering.
- **Notebook 03**: EDA, trace comparisons, and correlation heatmaps.
- **Notebook 04**: Regression models (Linear Regression, Decision Tree, SVR).
- **Notebook 05**: Classification models and confusion matrix breakdown.
- **Notebook 06**: Unsupervised $K$-Means clustering and 2D PCA plots.

---

## 9. Academic Scope & Integrity

- **Dynamic Computation**: All metrics ($R^2$, MAE, accuracy, confusion matrix cells) are calculated dynamically from actual session data. No values are hard-coded.
- **Reproducibility**: All random operations enforce `random_state=42` to produce consistent splits.
- **Disclaimer**: This is a laboratory-scale academic analysis using publicly accessible telemetry from Formula 1 timing. It demonstrates undergraduate machine learning principles and does not claim equivalence to proprietary internal team simulations.
