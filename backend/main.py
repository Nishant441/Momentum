import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from routes.rooms import websocket_room
from routes.auth import router as auth_router
from routes.data import router as data_router
from db import init_db

app = FastAPI(title="Momentum API")


init_db()

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://momentum-puce-delta.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(data_router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.websocket("/ws/room")
async def ws_room(websocket: WebSocket) -> None:
    await websocket_room(websocket)
