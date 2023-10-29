import enum
import cv2
import numpy as np


class Color(enum.Enum):
    RED = 'red'
    BLUE = 'blue'
    WHITE = 'white'


def get_color(pixel) -> Color:
    b, g, r = pixel
    if r > 1.2 * g and r > 1.2 * b:
        return Color.RED
    elif b > 1.2 * g and b > 1.2 * r:
        return Color.BLUE
    else:
        return Color.WHITE


def get_and_process_frame(vid):
    ret, frame = vid.read()
    # cut out the middle square of the frame
    height, width, _ = frame.shape
    board_size = min(height, width)
    top_left_x = (width - board_size) // 2
    top_left_y = (height - board_size) // 2
    board = frame[top_left_y:top_left_y+board_size,
                  top_left_x:top_left_x+board_size]

    # divide the frame into nxn parts
    frame = board
    height, width, _ = frame.shape
    grid_size = 6
    frame_area = height * width
    frame_part_height = height // grid_size
    frame_part_width = width // grid_size
    frame_part_area = frame_part_height * frame_part_width

    #  and get average rgb values of that part
    # get average rgb values of each part
    avg_values = np.zeros((grid_size, grid_size, 3))
    color_map = [[0 for i in range(grid_size)] for j in range(grid_size)]
    for i in range(0, grid_size):
        for j in range(0, grid_size):

            left_index = j * frame_part_width
            right_index = (j + 1) * frame_part_width
            top_index = i * frame_part_height
            bottom_index = (i + 1) * frame_part_height
            frame_part = frame[top_index:bottom_index, left_index:right_index]

            frame_part_avg = cv2.mean(frame_part)
            avg_values[i][j] = frame_part_avg[0:3]

            # put in the color for the color map part
            color_map[i][j] = get_color(frame_part_avg[0:3])

    display_frame = frame.copy()

    # draw grid lines
    for i in range(1, grid_size+1):
        display_frame = cv2.line(display_frame, (i * frame_part_width, 0),
                                 (i * frame_part_width, height), (0, 0, 0), 2)
        display_frame = cv2.line(display_frame, (0, i * frame_part_height),
                                 (width, i * frame_part_height), (0, 0, 0), 2)

    # display a small square of the average color of each part
    for i in range(0, grid_size):
        for j in range(0, grid_size):
            # draw a small square of the average color of each part
            display_frame = cv2.rectangle(display_frame, (j * frame_part_width, i * frame_part_height), (int((j + 0.1) * frame_part_width), int((i + 0.1) * frame_part_height)), tuple(
                map(lambda x: int(x), avg_values[i][j])), -1)

            # display the color from the color map
            display_frame = cv2.putText(display_frame, str(color_map[i][j]), (
                j * frame_part_width, (i + 1) * frame_part_height), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    return color_map, display_frame


def convert_color_map_to_cars(color_map: list[list]) -> list[list[list]]:
    # color_map is a 2d array of Color enums
    # returns a list of cars, where each car is a list of 2 points
    cars = []
    for color in Color:
        if color == Color.WHITE:
            continue

        # find first point of car
        car_point_1 = None
        for i in range(len(color_map)):
            found = False
            for j in range(len(color_map[i])):
                if color_map[i][j] == color:
                    car_point_1 = [i, j]
                    found = True
                    break
            if found:
                break

        if not car_point_1:
            continue

        # find second point of car either to the right or below
        car_point_2 = None
        if car_point_1[1] < len(color_map[car_point_1[0]]) - 1 and color_map[car_point_1[0]][car_point_1[1] + 1] == color:
            car_point_2 = [car_point_1[0], car_point_1[1] + 1]
        elif car_point_1[0] < len(color_map) - 1 and color_map[car_point_1[0] + 1][car_point_1[1]] == color:
            car_point_2 = [car_point_1[0] + 1, car_point_1[1]]

        if car_point_1 and car_point_2:
            cars.append([car_point_1, car_point_2])

    return cars
