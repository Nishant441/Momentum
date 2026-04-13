from fastapi import WebSocket, WebSocketDisconnect
from typing import Any


class ConnectionManager:
    def __init__(self) -> None:
        self._sockets: list[WebSocket] = []
        self._sprinters: dict[str, dict[str, Any]] = {}
        self._ws_to_id: dict[int, str] = {}

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self._sockets.append(ws)

        await ws.send_json({
            "event": "room_update",
            "sprinters": list(self._sprinters.values()),
        })

    def disconnect(self, ws: WebSocket) -> None:
        self._sockets.remove(ws)
        sprinter_id = self._ws_to_id.pop(id(ws), None)
        if sprinter_id:
            self._sprinters.pop(sprinter_id, None)

    async def broadcast(self, payload: dict[str, Any]) -> None:
        dead: list[WebSocket] = []
        for ws in self._sockets:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            if ws in self._sockets:
                self._sockets.remove(ws)

    async def handle_message(self, ws: WebSocket, data: dict[str, Any]) -> None:
        event = data.get("event")

        if event == "join_sprint":
            sid = data.get("id", "")
            self._ws_to_id[id(ws)] = sid
            self._sprinters[sid] = {
                "id": sid,
                "user": data.get("user", "Anonymous"),
                "task": data.get("task", ""),
                "minutesLeft": data.get("minutesLeft", 0),
            }
            await self._broadcast_room()

        elif event == "tick":
            sid = data.get("id", "")
            if sid in self._sprinters:
                self._sprinters[sid]["minutesLeft"] = data.get("minutesLeft", 0)
                await self._broadcast_room()

        elif event == "leave_sprint":
            sid = data.get("id", "")
            self._sprinters.pop(sid, None)
            self._ws_to_id.pop(id(ws), None)
            await self._broadcast_room()

    async def _broadcast_room(self) -> None:
        await self.broadcast({
            "event": "room_update",
            "sprinters": list(self._sprinters.values()),
        })


manager = ConnectionManager()


async def websocket_room(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.handle_message(websocket, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager._broadcast_room()
    except Exception:
        manager.disconnect(websocket)
        await manager._broadcast_room()
