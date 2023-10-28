import asyncio
import time
from fastapi import FastAPI, WebSocket
import random

# Create application
app = FastAPI(title='WebSocket Example')

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print('a new websocket to create.')
    await websocket.accept()
    while True:
        try:
            resp = {'value': random.uniform(0, 1)}
            await websocket.send_json({"value": resp})
            await asyncio.sleep(0.1)

        except Exception as e:
            print('error:', e)
            break
    print('Bye..')
    
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)