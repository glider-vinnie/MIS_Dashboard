# NGO MIS Dashboard

A comprehensive Management Information System (MIS) Dashboard for NGOs to track operations, training & learning, financial data, field activities, and generated reports.

The project consists of a FastAPI backend to serve data and a React (Vite) frontend for an interactive user interface.

## Prerequisites

Before running the project locally, ensure you have the following installed:
- **Node.js** (v16+ recommended) & **npm** (for the frontend)
- **Python** (v3.9+ recommended) & **pip** (for the backend)
- **Git** (optional, for cloning)

---

## 🚀🚀 Quick Start Guide

### 1. Backend Setup (FastAPI)

The backend serves API endpoints and loads metric data from a CSV file.

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create a `.env` file in the `backend/` directory with the following variables:
   ```env
   CSV_PATH=path/to/your/data.csv
   JWT_SECRET=your_secret_key_here
   # Include any tracking/firebase keys if applicable
   # FIREBASE_CREDENTIALS_JSON=...
   ```
   *(Note: Ensure your source `data.csv` is correctly placed at the `CSV_PATH`)*

5. **Start the backend server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The backend API will run at: `http://localhost:8000`
   You can view the interactive API docs at: `http://localhost:8000/docs`

---

### 2. Frontend Setup (React + Vite)

The frontend is a modern React application utilizing TailwindCSS, Zustand, and Recharts.

1. **Navigate to the frontend directory:**
   *(In a new terminal window)*
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the `frontend/` directory (if not using the default API base URL):
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   The frontend UI will run at: `http://localhost:5173`

---

## 🖥️ Usage

1. Open your browser and navigate to `http://localhost:5173`.
2. Click **Enter Demo Mode** on the login screen to access the full dashboard.
3. Use the sidebar to navigate between different modules: Overview, Operations, Training & Learning, Financial, Field Activities, and Reports.
4. Use the global top filters to slice data by **Zone** and **Month**.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Zustand (State Management), Recharts (Data Visualization), Framer Motion (Animations).
- **Backend:** Python, FastAPI, Pandas, Uvicorn, PyJWT.

