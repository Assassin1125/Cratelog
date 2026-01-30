# CrateLog - Intelligent ELD Route Planner

**CrateLog** is a modern, professional Electronic Logging Device (ELD) route planning application. It automates the complex task of trip planning for truck drivers by calculating optimal routes, inserting mandatory Department of Transportation (DOT) hours-of-service (HOS) breaks, and generating compliant daily log sheets.

![CrateLog UI](https://placehold.co/1200x600/0f172a/ffffff?text=CrateLog+Application+Preview)

## 🚀 Features

*   **Smart Route Calculation**: Uses OSRM (Open Source Routing Machine) to find the most efficient trucking routes.
*   **Automatic Compliance**: Automatically inserts:
    *   **30-Minute Breaks**: After 8 consecutive hours of driving.
    *   **10-Hour Daily Resets**: Limit of 11 hours driving / 14 hours on-duty per day.
    *   **Fuel Stops**: Smartly scheduled based on distance (approx. every 1000 miles) or combined with breaks.
*   **Visual Trip Timeline**: A sequential, vertical timeline of every event (Drive, On-Duty, Sleeper Berth, Off-Duty) from start to finish.
*   **Interactive Map**: Visualizes the entire route with color-coded segments for driving, breaks, and resets.
*   **Digital Log Sheets**: Generates standardized grid-style daily logs that are print-ready for DOT inspections.
*   **Premium UI**: A "RunCrate" inspired dark-mode aesthetic with glassmorphism, gradients, and vector animations.

---

## 🛠️ Tech Stack

### Frontend
*   **React (Vite)**: Fast, modern UI framework.
*   **Tailwind CSS**: Utility-first styling for the custom dark theme.
*   **Leaflet / React-Leaflet**: Interactive mapping engine.
*   **Framer Motion**: Smooth animations for transitions and timeline elements.
*   **Lucide React**: Crisp, vector SVG icons.

### Backend
*   **Django / Django REST Framework**: robust API for handling logic.
*   **OSRM (Open Source Routing Machine)**: External API used for turn-by-turn routing and distance calculation.
*   **Nominatim**: Geocoding service (Address -> Coordinates).
*   **Pillow (PIL)**: Used for server-side image manipulations (optional/legacy utils).
*   **Whitenoise**: Static file serving for production.

---

## 🔄 How It Works (End-to-End)

1.  **Input**: The driver enters their **Start Location**, **Pickup**, **Dropoff**, and current **Hours Used**.
2.  **Routing (Leg 1 & 2)**: The system calculates two distinct route legs:
    *   *Leg 1*: Start → Pickup (Empty move / Deadhead).
    *   *Leg 2*: Pickup → Dropoff (Loaded move).
3.  **Simulation Engine**: The backend runs a tick-based simulation of the drive:
    *   It tracks "Drive Time", "Shift Time", and "Fuel Range".
    *   If the driver approaches the 8-hour limit, a **30-min break** is inserted at the nearest coordinate.
    *   If the driver hits the 11/14-hour daily limit, a **10-hr Sleeper Berth** reset is triggered.
    *   Events are prioritized: A Fuel stop can satisfy a Break requirement if aligned.
4.  **Visualization**:
    *   Accurate **Triangle Markers** show Start (Green), Pickup (Blue), and Dropoff (Red) points.
    *   Small color-coded dots indicate where breaks and fuel stops occur along the route.
5.  **Output**: The user receives a downloadable/printable set of **Daily Log Sheets**, perfectly formatted for compliance.

---

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)

### 1. Backend Setup
Navigate to the backend directory and set up the Python environment.

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Run the Django server:

```bash
python manage.py runserver
# Server will start at http://localhost:8000
```

### 2. Frontend Setup
Open a new terminal and navigate to the frontend directory.

```bash
cd frontend
npm install
npm run dev
# App will launch at http://localhost:5173
```

---

## 🚢 Deployment

The project is configured for cloud deployment (Render, Railway, Heroku).

1.  **Backend**:
    *   `settings.py` is configured to use `dj-database-url` for Postgres and `Whitenoise` for static files.
    *   Ensure you set environment variables: `SECRET_KEY`, `allowed_hosts`, and `DEBUG=False` in production.
2.  **Frontend**:
    *   Run `npm run build` to create a production bundle.
    *   Serve the `dist/` folder via a static site host (Vercel, Netlify) or serve it through Django.

---

## 📄 License
Internal proprietary tool.
