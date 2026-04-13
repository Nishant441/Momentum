import asyncio
import websockets

async def test():
    try:

        async with websockets.connect(
            "ws://localhost:8000/ws/room",
            extra_headers={"Origin": "http://localhost:5173"}
        ) as ws:
            print("Connected with Origin: http://localhost:5173")
            await ws.close()
    except Exception as e:
        print(f"Error 1: {e}")

    try:

        async with websockets.connect(
            "ws://127.0.0.1:8000/ws/room",
            extra_headers={"Origin": "http://127.0.0.1:5173"}
        ) as ws:
            print("Connected with Origin: http://127.0.0.1:5173")
            await ws.close()
    except Exception as e:
        print(f"Error 2: {e}")

asyncio.run(test())
