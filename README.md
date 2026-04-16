# Momentum

> **Overall Champion + Best Practicality** — Cal State LA Hackathon 2026

An AI-powered anti-procrastination web app that transforms overwhelming assignments into immediate, actionable micro-tasks. Built for students who know what’s due, but struggle to start.

---

<!-- Replace with your GIF once uploaded -->
<!-- ![Momentum Demo](./demo.gif) -->

---

## The Problem

Students don't fail because they're lazy. They fail because "Write a 5-page essay" is too big to start. To-do lists don't fix this. Calendars don't fix this. Momentum does.

---

## Features

- **AI Task Breakdown** — Paste any assignment and get a step-by-step micro-task plan instantly, each task under 30 minutes and immediately actionable
- **Procrastination Risk Prediction** — Per-task risk scoring weighted by deadline proximity and task complexity, with a "Start This First" recommendation
- **Focus Sprint Timer** — Timestamp-anchored Pomodoro timer that stays accurate even when switching tabs
- **Live Accountability Rooms** — Real-time WebSocket rooms showing other students currently in focus sprints
- **Visual Chaos vs. Focus World** — A grid of blocks that transforms from chaotic to organized as you complete tasks
- **Urgency Dashboard** — Assignments grouped into Urgent, Do Today, and On Track based on deadline pressure and procrastination risk
- **Streak System** — Daily streaks, total focus time, and badges that persist across sessions
- **Smart Notifications** — Browser push notifications for deadline reminders and high-risk untouched assignments
- **File Upload** — PDF and image upload with text extraction (PDF.js + Groq vision model)
- **Auth** — JWT authentication with per-user data isolation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS, Vite |
| Backend | FastAPI (Python) |
| AI | Groq API (Llama 3.3 70B + Llama 3.2 90B Vision) |
| Database | PostgreSQL (Neon) |
| Real-time | WebSockets |
| Auth | JWT |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- A [Groq API key](https://console.groq.com) (free)
- A [Neon](https://neon.tech) PostgreSQL database (free)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```
DATABASE_URL=your_neon_postgres_url
SECRET_KEY=your_jwt_secret_key
```

Start the server:
```bash
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file in `frontend/`:
```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws/room
```

Frontend runs at `http://localhost:5173`

---

## Project Structure

```
momentum/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AssignmentInput.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── FocusMode.tsx
│   │   │   ├── VisualWorld.tsx
│   │   │   ├── LivePanel.tsx
│   │   │   ├── UrgencyDashboard.tsx
│   │   │   ├── StatsBar.tsx
│   │   │   └── BadgeRow.tsx
│   │   ├── hooks/
│   │   │   ├── useRoom.ts
│   │   │   ├── useStreak.ts
│   │   │   └── useNotifications.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── extractText.ts
│   │   │   └── notifications.ts
│   │   └── App.tsx
├── backend/
│   ├── main.py
│   ├── routes/
│   │   ├── tasks.py
│   │   ├── users.py
│   │   └── rooms.py
│   ├── models/
│   ├── db.py
│   └── requirements.txt
```

---

## License

Private. All rights reserved.
