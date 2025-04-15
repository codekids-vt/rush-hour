import cv2
import numpy as np
import pygame
import sys
import asyncio
import cv2
import websockets
from fastapi import FastAPI, WebSocket

from cam_to_cars import get_and_process_frame, adjust_colors, get_cars_from_grid, get_cars_from_dict, get_level_rep_socket, convert_car_to_color, get_level_rep_existing, check_is_grey

app = FastAPI(title='WebSocket Example')


SCREEN_WIDTH = 1000
SCREEN_HEIGHT = 600
WIDTH = 600
HEIGHT = 600
WHITE = (255, 255, 255)
# store the starting board as list of cars
START_CAR_POSITIONS = [
    [[0, 0], [0, 1]],
    [[2, 0], [3, 0]],
    [[5, 0], [5, 1]],
    [[0, 2], [1, 2]],
]

WANTED_CAR_POSITIONS = []
CAR_POSITIONS = []

adjusted_color_values = np.zeros((6,6,3))
avg_values = np.zeros((6,6,3))
starting_level_rep = {'cars': [{'x': 1, 'y': 2, 'vertical': False, 'length': 2, 'color': 'red'}], 
                    'is_legal_board': True}

def draw_grid(screen, avg_values, adj_color_values):
    greys_grid = np.full((6, 6), False)
    colors = np.zeros((6, 6, 3))

    grid_size = avg_values.shape[0]
    for i in range(grid_size):
        for j in range(grid_size):
            c = np.round(avg_values[i][j][::-1]).astype(int)  # Convert color enum to Pygame-compatible value
            #print(c, adj_color_values[i][j])
            acv = np.round(adj_color_values[i][j][::-1]).astype(int)
            color = (
                max(0, min(255, c[0] + acv[0])),
                max(0, min(255, c[1] + acv[1])),
                max(0, min(255, c[2] + acv[2]))
            )
            greys_grid[i][j] = check_is_grey(color)
            colors[i][j] = color

            #draw colored rect
            pygame.draw.rect(screen, color, (j * WIDTH / grid_size,
                                 i * HEIGHT / grid_size, WIDTH / grid_size, HEIGHT / grid_size))
            #draw the black grid outline
            pygame.draw.rect(screen, (0, 0, 0), (j * WIDTH / grid_size, i *
                                 HEIGHT / grid_size, WIDTH / grid_size, HEIGHT / grid_size), 1)
            # Display the text at the top-left corner of the rectangle
            font = pygame.font.SysFont('Arial', 12)  # Choose font and size
            #color_text = font.render(f'{color} {convert_car_to_color(color)}', True, (0, 0, 0))  # Render the color tuple
            color_text = font.render(f'{color} {check_is_grey(color)}', True, (0, 0, 0))  # Render the color tuple
            screen.blit(color_text, (j * WIDTH / grid_size + 2, i * HEIGHT / grid_size + 2))  # Offset for the color

def draw_message(screen, message):
    font = pygame.font.SysFont('Arial', 20)
    text = font.render(message, True, (0, 0, 0))
    screen.blit(text, (WIDTH + 50, 150))

def alter_adjusted_values(new_value):
    global adjusted_color_values 
    adjusted_color_values = new_value

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global adjusted_color_values, avg_values, starting_level_rep
    

    await websocket.accept()
    print('websocket connection accepted')
    while True:
        # Check if a message is waiting from frontend
        try:
            message = await asyncio.wait_for(websocket.receive_json(), timeout=1.4)
            event_type = message.get("event", "")
            print("event type is:", event_type)
            
            if event_type == "request_level_rep":
                print("level requested from frontend")
                level_rep = get_level_rep_socket(avg_values, adjusted_color_values)
                level_rep_json = {"cars": level_rep, "is_legal_board": True}
                starting_level_rep = level_rep_json
                print("Starting level rep:", starting_level_rep)
                await websocket.send_json(level_rep_json)
        except asyncio.TimeoutError:
            # No message received from frontend after 1 second, continue to background sending
            pass

        #await asyncio.sleep(1.5)
        print("sending pre-made board")
        try:
            level_rep, is_legal_rep = get_level_rep_existing(avg_values, adjusted_color_values, starting_level_rep) 
            level_rep_json = {"cars": level_rep, "is_legal_board" : is_legal_rep}
            await websocket.send_json(level_rep_json)
        except Exception as e:
            print("Error occured:", e)        
        await asyncio.sleep(0.1)

        
        print('Bye..')


async def run_programs_concurrently():
    import uvicorn
    loop = asyncio.get_event_loop()

    config = uvicorn.Config(app, host="0.0.0.0", port=8000, loop="asyncio")
    server = uvicorn.Server(config)
    
    await asyncio.gather(
        loop.run_in_executor(None, main),
        server.serve()
        # Run both main() and test_websocket() concurrently
        #uvicorn.run(app, host='0.0.0.0', port=8000)
    )

def main():
    adj_color_values = np.zeros((6, 6, 3))
    vid = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    pygame.init()
    # allow windowed fullscreen mode
    screen = pygame.display.set_mode(
        (SCREEN_WIDTH, SCREEN_HEIGHT), pygame.RESIZABLE)

    pygame.display.set_caption("Rush Hour Board")

    clock = pygame.time.Clock()
    message = ""
    while (True):
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        global avg_values
        color_map, display_frame, avg_values = get_and_process_frame(vid)
        #print(color_map)
        #print(avg_values.shape) #6, 6, 3
        #current_cars = convert_color_map_to_cars(color_map)
        #print(current_cars)
        cv2.imshow('frame', display_frame)

        # pygame stuff
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

            # Handle space bar press to call adjust function
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:  # Check if space bar is pressed
                    #print("Space bar pressed")
                    adj_color_values = adjust_colors(avg_values)
                    alter_adjusted_values(adj_color_values)
                    #print("new adj colors are: ", adj_color_values)
                elif event.key == pygame.K_LSHIFT:  # Check if left shift is pressed
                    level_rep = get_level_rep_socket(avg_values, adj_color_values)
                    print("Level rep:\n", level_rep)


        screen.fill(WHITE)
        draw_grid(screen, avg_values, adj_color_values)
        draw_message(screen, message)
        pygame.display.flip()
        clock.tick(60)

    vid.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    #main()
    #asyncio.run(test_websocket()) 
    asyncio.run(run_programs_concurrently())
