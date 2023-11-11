import asyncio
import cv2
from fastapi import FastAPI, WebSocket
import random

from cam_to_cars import convert_color_map_to_cars, get_and_process_frame

app = FastAPI(title='WebSocket Example')

sample_cars_lists = [
    {
        "red": [[4, 4], [3, 4], [2, 4]],
        "blue": [[5, 3], [5, 4], [5, 5]],
        "green": [[2, 2], [2, 3]],
    },
    {
        "red": [[4, 4], [3, 4], [2, 4]],
        "blue": [[5, 2], [5, 3], [5, 4]],
        "green": [[2, 2], [2, 3]],
    },
    {
        "red": [[3, 4], [2, 4], [1, 4]],
        "blue": [[5, 2], [5, 3], [5, 4]],
        "green": [[2, 2], [2, 3]],
    },
    {
        "red": [[3, 4], [2, 4], [1, 4]],
        "blue": [[5, 2], [5, 3], [5, 4]],
        "green": [[2, 3], [2, 4]],
    },
]

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print('a new websocket to create.')
    vid = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    await websocket.accept()
    # i = 0
    # increasing = True
    while True:
        try:
            color_map, display_frame = get_and_process_frame(vid)
            current_cars = convert_color_map_to_cars(color_map)
                
            # set current cars to walk up and down the options we have
            # current_cars = sample_cars_lists[i]
            
            # if increasing:
            #     i += 1
            # else:
            #     i -= 1
            
            # if i == len(sample_cars_lists) - 1:
            #     increasing = False
            # elif i == 0:
            #     increasing = True
            
            print(current_cars)
            await websocket.send_json({"cars": current_cars})
            await asyncio.sleep(0.5)

        except Exception as e:
            print('error:', e)
            break
    vid.release()
    cv2.destroyAllWindows()
    print('Bye..')

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)