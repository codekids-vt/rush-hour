import cv2
import numpy as np
import pygame
import sys

from cam_to_cars import car_lists_equal, convert_color_map_to_cars, get_and_process_frame

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

def get_red_sections(car_positions):
    red_sections = np.zeros((6, 6))
    for car in car_positions:
        red_sections[car[0][0]][car[0][1]] = 1
        red_sections[car[1][0]][car[1][1]] = 1
    return red_sections

def draw_grid(screen, red_sections):
    grid_size = red_sections.shape[0]
    for i in range(grid_size):
        for j in range(grid_size):
            if red_sections[i][j] == 1:
                pygame.draw.rect(screen, (255, 0, 0), (j * WIDTH / grid_size,
                                 i * HEIGHT / grid_size, WIDTH / grid_size, HEIGHT / grid_size))
            else:
                pygame.draw.rect(screen, (0, 0, 0), (j * WIDTH / grid_size, i *
                                 HEIGHT / grid_size, WIDTH / grid_size, HEIGHT / grid_size), 1)


def draw_next_button(screen):
    pygame.draw.rect(screen, (255, 200, 255), (WIDTH + 50, 50, 100, 50), 1, 20)
    font = pygame.font.SysFont('Arial', 20)
    text = font.render('Next', True, (0, 0, 0))
    screen.blit(text, (WIDTH + 50 + 25, 50 + 15))

def handle_next_button_click(current_cars):
    # if board looks like the wanted board, then add one car from the start board to the wanted board
    message = ""
    if car_lists_equal(current_cars, WANTED_CAR_POSITIONS):
        if len(START_CAR_POSITIONS) > 0:
            WANTED_CAR_POSITIONS.append(START_CAR_POSITIONS.pop(0))
            CAR_POSITIONS.append(WANTED_CAR_POSITIONS[-1])
        else:
            message = "No more cars left!"
    else:
        message = "Board does not look like the wanted board, try again!"
    return message


def draw_message(screen, message):
    font = pygame.font.SysFont('Arial', 20)
    text = font.render(message, True, (0, 0, 0))
    screen.blit(text, (WIDTH + 50, 150))
    
def main():
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
        color_map, display_frame = get_and_process_frame(vid)
        # print(color_map)
        current_cars = convert_color_map_to_cars(color_map)
        print(current_cars)
        cv2.imshow('frame', display_frame)

        # pygame stuff
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.MOUSEBUTTONUP:
                pos = pygame.mouse.get_pos()
                if pos[0] > WIDTH + 50 and pos[0] < WIDTH + 150 and pos[1] > 50 and pos[1] < 100:
                    message = handle_next_button_click(current_cars)

        screen.fill(WHITE)
        draw_next_button(screen)
        draw_grid(screen, get_red_sections(CAR_POSITIONS))
        draw_message(screen, message)
        pygame.display.flip()
        clock.tick(60)

    vid.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
