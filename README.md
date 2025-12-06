# 🌫️ Air Quality Prediction

A full-stack web application that predicts the Air Quality Index (AQI) in real time. This repository includes:
- A Python/Flask backend that serves a pre-trained ML model.
- A React + Vite + Tailwind frontend for the UI.
- Jupyter notebooks used for data exploration and model training.

---

## Table of contents

- Tech stack
- Model details
- Prerequisites
- Installation & setup (Backend, Frontend)
- Running with Docker
- Usage
- Project structure
- Future enhancements
- Author

---

## Tech stack

- Backend: Python, Flask, scikit-learn, joblib, pandas
- Frontend: React.js, Vite, Tailwind CSS, react-router-dom
- Notebooks: Jupyter Notebook (data exploration & model training)
- Data source: OpenWeather API

---

## Model details

- Model file: Backend/aqi_model_8_features.pkl
- Model type: RandomForestRegressor (trained with 500 estimators)
- Features used: PM2.5, PM10, NO, NO2, NH3, CO, SO2, O3
- Notebook: See Jupyter notebooks (e.g., AirQuality.ipynb) for training workflow and data preprocessing

---

## Prerequisites

- Python 3.x (3.8+ recommended)
- Node.js (v18+ recommended) and npm/yarn
- An OpenWeather API key
- The trained model file: Backend/aqi_model_8_features.pkl 

---

## Installation & setup

This project runs two servers (backend and frontend) during development. The repository directories are named `Backend` and `Frontend` (case-sensitive).

Clone the repository:
```bash
git clone https://github.com/kireeti-ai/air-quality-prediction.git
cd air-quality-prediction
```

### Backend (Terminal 1)

1. Enter the backend directory:
```bash
cd Backend
```

2. Place your trained model:
- Put `aqi_model_8_features.pkl` in the `Backend/` directory.

3. Create and activate a virtual environment:
- macOS / Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```
- Windows (PowerShell):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Configure the OpenWeather API key:
- Recommended: set an environment variable (preferred over editing source files).
  - macOS / Linux:
    ```bash
    export OPENWEATHER_API_KEY="your_api_key_here"
    ```
  - Windows (PowerShell):
    ```powershell
    $env:OPENWEATHER_API_KEY="your_api_key_here"
    ```
- If the backend code expects a constant in `app.py`, consider updating `app.py` to read from the environment:
```python
import os
API_KEY = os.getenv("OPENWEATHER_API_KEY", "YOUR_API_KEY_HERE")
```

6. Run the backend:
```bash
python3 app.py
```
The backend will listen at http://127.0.0.1:5000 by default (confirm port in `app.py`).

### Frontend (Terminal 2)

1. Open a new terminal and go to the frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```
or
```bash
yarn
```

3. Start the dev server:
```bash
npm run dev
```
The frontend will be available at http://localhost:5173 (port may vary).

---

## Running with Docker / docker-compose

A docker-compose.yml exists at the repository root. You can build and run both services with Docker if you prefer containerized runs.

1. Ensure Docker and docker-compose are installed.
2. Copy or set your OpenWeather API key in an env file:
```bash
echo "OPENWEATHER_API_KEY=your_api_key_here" > .env
```
3. Run:
```bash
docker-compose up --build
```

Check docker-compose.yml for service names and port mappings and adjust the `.env` placement or docker-compose configuration if needed.

---


## Usage

1. Start the backend and frontend (or run docker-compose).
2. In the frontend UI, enter a city name or submit pollutant values.
3. The backend fetches weather/pollution data from OpenWeather (if needed), passes features to the ML model, and returns an AQI prediction.
4. Predictions and (optionally) pollutant breakdowns are displayed on the frontend.

---

## Project structure

```
air-quality-prediction/
├── Backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── aqi_model_8_features.pkl
│   └── ...
├── Frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── docker-compose.yml
└── README.md
```

Note: The repository contains Jupyter notebooks used to prepare and train the model (look for files like `AirQuality.ipynb`).

---

## Future enhancements

- Add AQI trend visualization (charts) in the frontend
- Support batch/historical queries and multiple cities
- Persist historical AQI data using PostgreSQL or MongoDB
- Add CI/CD and automated tests (Jenkinsfile present as a starting point)
- Provide a safer secrets-management approach (don't store API keys in source)

---

## Author

**Kireeti V**
📍 Amrita Vishwa Vidyapeetham
💼 GitHub: @kireeti-ai (https://github.com/kireeti-ai)
