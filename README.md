# Momentum

A modern productivity and focus application designed to help you maintain streaks, complete tasks, and focus in a collaborative environment.

## 🚀 Features

- **Personal Task Management**: Track assignments and tasks with ease.
- **Streak System**: Gamified productivity with badges and daily streaks.
- **Focus Timer**: Dedicated focus sessions with automatic streak updates.
- **Collaborative Rooms**: Real-time WebSocket-powered rooms for communal focus.
- **Security First**: Authentication and data isolation.

## 🛠️ Project Structure

This project is a monorepo consisting of:
- **`backend/`**: A FastAPI service (Python) handles data persistence, authentication, and WebSocket management.
- **`frontend/`**: A React application (TypeScript + Vite) providing a premium, interactive user experience.

## 🚦 Getting Started

### Backend
1. `cd backend`
2. Create and activate a virtual environment: `python3 -m venv venv && source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Set up environment variables in `.env`.
5. Run the server: `uvicorn main:app --reload`

### Frontend
1. `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Build for production: `npm run build`

## 🛡️ License

Private. All rights reserved.
