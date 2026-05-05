import enum
import cv2
import numpy as np
import webcolors

RED = [175, 85, 75]
GREY = [125, 135, 135] #[105, 115, 115] #[97, 107, 107] #[80, 89, 89]

class Color(enum.Enum):
    RED = 'red'
    ORANGE = 'orange'
    YELLOW = 'yellow'
    GREEN = 'green'
    BLUE = 'blue'
    PURPLE = 'purple'
    GREY = 'grey'
    LIGHT_YELLOW = 'yellow' #rgb(255, 255, 102)
    PINK = 'pink' #rgb(255, 0, 102)
    AQUA = 'aqua' #rgb(0, 255, 255)
    Lime = 'lime' #rgb(60, 115,100) 
    LIGHT_BLUE = 'sky' #rgb(102, 255, 255)
    LIGHT_TEAL = 'emerald' #rgb(102, 255, 153) 
    LIGHT_PURPLE = 'violet'
    TEAL = 'teal' #rgb(0, 255, 204)

    def __str__(self):
        return self.value


def closest_color(requested_color):
    #requested_color = (r#, g#, b#)
    min_colors = {}
    hex_colors = [
        ('#FF0000', 'red'),
        ('#FFA500', 'orange'),
        ('#FFFF00', 'yellow'),
        ('#00FF00', 'green'),
        ('#0000FF', 'blue'),
        ('#6F4685', 'purple'),
        ('#424949', 'grey'), #rgb(85, 94, 94)
        #808080 424949
    ]
    for key, name in hex_colors:
        r_c, g_c, b_c = webcolors.hex_to_rgb(key)
        rd = (requested_color[2] - r_c) ** 2
        gd = (requested_color[1] - g_c) ** 2
        bd = (requested_color[0] - b_c) ** 2
        distance = rd + gd + bd
        min_colors[distance] = name
    return min_colors[min(min_colors.keys())], min(min_colors.keys())

def get_color(pixel) -> Color:
    pixel = tuple(map(lambda x: int(x), pixel))
    color, confidence = closest_color(pixel)
    if color == 'red':
        return Color.RED
    elif color == 'orange':
        return Color.ORANGE
    elif color == 'yellow':
        return Color.YELLOW
    elif color == 'green':
        return Color.GREEN
    elif color == 'blue':
        return Color.BLUE
    elif color == 'purple':
        return Color.PURPLE
    elif color == 'grey':
        return Color.GREY
    else:
        return Color.GREY



def get_and_process_frame(vid: cv2.VideoCapture):
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
            #avg #prints out rgb in reverse for some reason
            #99, 111, 176 => 176, 111, 99

            # draw a small square of the average color of each part
            display_frame = cv2.rectangle(display_frame, (j * frame_part_width, i * frame_part_height), (int((j + 0.1) * frame_part_width), int((i + 0.1) * frame_part_height)), 
                                tuple(map(lambda x: int(x), avg_values[i][j])), -1)

            # display the color from the color map
            display_frame = cv2.putText(display_frame, str(color_map[i][j]), (
                j * frame_part_width, (i + 1) * frame_part_height), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    return color_map, display_frame, avg_values

'''
GENERAL HELPER FUNCTIONS
'''
'''
Parameters:
  *  key (possible values are top, bottom, left, or right), represents direction we are looking in
  * i and j - coordinates in the grid representation
Returns:
  *  di and dj - coordinates of spot one over in the given direction on the grid represnation 
coordinates 
'''
def get_dir_coords(key, i, j):
    if key == "top":
        di = i-1
        dj = j
    elif key == "bottom":
        di = i+1
        dj = j
    elif key == "left":
        di = i
        dj = j-1
    else: #"right"
        di = i
        dj = j+1
    
    return di, dj

'''
Calculates the distance between two colors
color1 and color2 should be arr of length 3 and represend a rgb value
'''
def calculate_color_distance(color1, color2):
    rd = (color1[2] - color2[2]) ** 2
    gd = (color1[1] - color2[1]) ** 2
    bd = (color1[0] - color2[0]) ** 2
    distance = rd + gd + bd
    return distance

def calculate_color_distance_rgb_str(color1, color_str):
    color2 = convert_color_str_to_rgb(color_str)
    return calculate_color_distance(color1, color2)

def convert_color_str_to_rgb(color_str):
    conversion_dict = {'orange': [230, 150, 95], 'yellow': [240, 232, 128], 
                       'green': [78, 165, 130], 'blue': [80, 125, 190], 
                       'purple': [120, 125, 180],  'teal': [95, 200, 190],
                       'pink': [190, 110, 150], 'aqua': [0, 255, 255], 
                       'lime': [180, 215, 127], 'sky': [140, 195, 127],
                       'emerald': [102, 255, 153]} 
    
    return conversion_dict[color_str]

'''
Checks if the given color is a grey square on the board
'''
def check_is_grey(color, add_val=25):
    if len(color) < 3:
        return False
    color_req = color[0] <= 155 and color[1] <= 140 and color[2] <= 120
    #color[0] <= GREY[0] + add_val and color[1] <= GREY[1] + add_val and color[2] <= GREY[2] + add_val
    dist_req = color[0] + color[1] > 2.05 * color[2]
    return color_req and dist_req

'''
Checks if two keys are opposites (top and bottom or left and right pairing)
'''
def keys_opposite(key1, key2):
    return (key1 == "top" and key2 == "bottom") or (key2 == "top" and key1 == "bottom") or (key1 == "left" and key2 == "right") or (key2 == "left" and key1 == "right")

'''
Adjusts the board when space bar is pressed in pygame

Parameter:
  *  avg_values - a rgb representation of the board without anything on it (all grey squares)
Returns:
  *  adj_color_values - the rgb value that each square on the board should be adjusted by
'''
def adjust_colors(avg_values):
    shape = avg_values.shape
    adj_color_values = []
    for i in range(shape[0]):
        adj_color_values.append([])  # Add a new row to the list

        for j in range(shape[1]):
            color = avg_values[i][j]
            adj_color = [GREY[0] - color[0], GREY[1] - color[1], GREY[2] - color[2]]
            adj_color_values[i].append(adj_color)
    return adj_color_values

'''
Helper function to get the rgb values of the adjacent board squares

Parameters:
  *  grid and color representation
  *  i and j - coordinates of square we're getting values around
Returns:
  *  dictionary of each direction and the rgb value of the adjacent board sqaure in that direction
'''
def get_adjacency(cars_on_grid, colors, i, j):
    adjacency_dict = {"left" : [0,0,0],
                    "right" : [0,0,0],
                    "top" : [0,0,0],
                    "bottom" : [0,0,0] }
    
    if j > 0 and cars_on_grid[i][j-1] != 0:
        adjacency_dict["left"] = [rbg_val for rbg_val in colors[i][j-1]]
    if j + 1 < colors.shape[1] and cars_on_grid[i][j+1] != 0:
        adjacency_dict["right"] = [rbg_val for rbg_val in colors[i][j+1]]
    if i > 0 and cars_on_grid[i - 1][j] != 0:
        adjacency_dict["top"] = [rbg_val for rbg_val in colors[i - 1][j]]
    if i + 1 < colors.shape[0] and cars_on_grid[i+1][j] != 0:
        adjacency_dict["bottom"] = [rbg_val for rbg_val in colors[i + 1][j]]

    return adjacency_dict

'''
Helper function that returns a dictionary showing how close the requested color is to each color
'''
def get_color_distance_dict(requested_color):
    min_colors = {}
    hex_colors = [
        ('#e6965f', 'orange'), #rgb(230, 150, 95) <= rgb(205, 125, 75), cd7d4b
        ('#f0e880', 'yellow'), #rgb(240, 232, 128) <= rgb(220, 215, 160), dcd7a0
        ('#4ea582', 'green'), #rgb(78, 165, 130) <= rgb(60, 115,100), 3c7364 
        ('#507dbe', 'blue'), #rgb(80, 125, 190) <= rgb(70, 105, 130)
        ('#787db4', 'purple'), #rgb(120, 125, 180) <= rgb(90, 80, 105), 5a5069 6F4685
        ('#ffff66', 'light-yellow'), #rgb() <= rgb(255, 255, 102), ffff66
        ('#be6e96', 'pink'), #rgb(190, 110, 150) <= rgb(255, 0, 102), ff0066
        ('#00ffff', 'aqua'), #rgb() <= rgb(0, 255, 255)
        ('#b4d77f', 'lime'), #rgb(180, 215, 127) <= rgb(60, 115,100), 3c7364 
        ('#8cc37f', 'light-blue'), #rgb(140, 195, 127) <= rgb(102, 255, 255), 66ffff
        ('#66ff99', 'light-teal'), #rgb(102, 255, 153) 
        ('#5fc8be', 'teal'), #rgb(95, 200, 190) <= rgb(0, 255, 204), 00ffcc
    ]
    for key, name in hex_colors:
        r_c, g_c, b_c = webcolors.hex_to_rgb(key)
        bd = (requested_color[2] - b_c) ** 2
        gd = (requested_color[1] - g_c) ** 2
        rd = (requested_color[0] - r_c) ** 2
        distance = rd + gd + bd
        min_colors[distance] = name
    
    return min_colors

'''
Helper function that converts a car's rgb value to a color enum
'''
def convert_car_to_color(requested_color):
    min_colors = get_color_distance_dict(requested_color)
    color = min_colors[min(min_colors.keys())]
    if color == 'red':
        return Color.RED
    elif color == 'orange':
        return Color.ORANGE
    elif color == 'yellow':
        return Color.YELLOW
    elif color == 'green':
        return Color.GREEN
    elif color == 'blue':
        return Color.BLUE
    elif color == 'purple':
        return Color.PURPLE
    elif color == "pink":
        return Color.PINK
    elif color == "light-blue":
        return Color.LIGHT_BLUE
    elif color == "lime":
        return Color.Lime
    elif color == "light-purple":
        return Color.LIGHT_PURPLE
    else:
        return Color.TEAL


'''
CREATING FINAL GRID REPRESENTATION OF THE BOARD
'''
'''
Takes in greys grid and rgb color rep of board
Returns first attempt at the final grid 
'''
def get_cars_from_grid(colors):
    cars_on_grid = np.array([[0 if check_is_grey(rgb_val) else -1 for rgb_val in row] for row in colors]) 
    car_num = 1

    ##print("After get lone cars:\n", cars_on_grid)
    partial_cars_on_grid, new_car_num  = get_single_adjacent(cars_on_grid, colors, car_num)
    
    ##print("After get single adjacent cars:\n", partial_cars_on_grid)
    final_cars_on_grid, new_car_num = match_unassigned_squares(partial_cars_on_grid, colors, new_car_num)
    
    return final_cars_on_grid


def get_cars_from_grid_grey(greys_grid, colors):
    ##print("Greys grid:\n", greys_grid)
    #might be able to get rid of this logic
    cars_on_grid, car_num = get_lone_cars(greys_grid)
    
    ##print("After get lone cars:\n", cars_on_grid)
    partial_cars_on_grid, new_car_num  = get_single_adjacent(cars_on_grid, colors, car_num)
    
    ##print("After get single adjacent cars:\n", partial_cars_on_grid)
    final_cars_on_grid, new_car_num = match_unassigned_squares(partial_cars_on_grid, colors, new_car_num)
    if -1 in np.array(final_cars_on_grid):
        ##print("final has -1 in it:\n", final_cars_on_grid)
        final_cars_on_grid = fix_adjacent_not_read(final_cars_on_grid, new_car_num)
    ##print("final:\n", final_cars_on_grid)
    
    car_coords_dict, car_colors = get_car_coords_color_dict(final_cars_on_grid, colors)
    ##print("coords dict:\n", car_coords_dict)
    ##print("colors dict:\n", car_colors)
    return car_coords_dict, car_colors, final_cars_on_grid

def get_lone_cars(greys_grid):
    grid_shape = greys_grid.shape
    cars_on_grid = np.where(greys_grid, 0, -1)
    ##print("Shape:", grid_shape, "\n", cars_on_grid)
    car_num_placed = 1
    for i in range(grid_shape[0]):
        for j in range(grid_shape[1]):
            #check horizontal
            prev_sum = np.sum(~greys_grid[i][j - 1])
            if (np.sum(~greys_grid[i][j:j + 3]) == 3 and (j == 0 or prev_sum < 1) and
                (i == 0 or np.sum(~greys_grid[i - 1][j:j+3]) < 1) and
                (i + 1 >= grid_shape[0] and np.sum(~greys_grid[(i + 1) % grid_shape[0]][j:j+3]) < 1) and
                (j + 3 >= grid_shape[1] or np.sum(~greys_grid[i][j+3:j + 4]) < 1)):
                cars_on_grid[i][j:j+3] = car_num_placed
                car_num_placed += 1
            elif (np.sum(~greys_grid[i][j:j + 2]) == 2 and (j == 0 or prev_sum < 1) and
                (i == 0 or np.sum(~greys_grid[i - 1][j:j+2]) < 1) and 
                (i + 1 >= grid_shape[0] or np.sum(~greys_grid[(i + 1) % grid_shape[0]][j:j+2]) < 1) and
                (j + 2 >= grid_shape[1] or np.sum(~greys_grid[i][j+2:j + 3]) < 1)):
                cars_on_grid[i][j:j+2] = car_num_placed
                car_num_placed += 1 
                ##print("found 2 horizontal", i, j, np.sum(~greys_grid[i - 1][j:j+2]), np.sum(~greys_grid[(i + 1)  % grid_shape[0]][j:j+2]), np.sum(~greys_grid[i][j+2:j + 3]), j + 2 >= grid_shape[1])


            flipped_grey_grid = greys_grid.T
            #check vertical
            prev_sum = np.sum(~flipped_grey_grid[i][j - 1])
            if (np.sum(~flipped_grey_grid[i][j:j + 3]) == 3 and (j == 0 or prev_sum < 1) and
                (i == 0 or np.sum(~flipped_grey_grid[i - 1][j:j+3]) < 1) and
                (i + 1 >= grid_shape[0] and np.sum(~flipped_grey_grid[(i + 1) % grid_shape[0]][j:j+3]) < 1) and
                (j + 3 >= grid_shape[1] or np.sum(~flipped_grey_grid[i][j+3:j + 4]) < 1)):
                cars_on_grid[j:j+3, i] = car_num_placed
                car_num_placed += 1
            elif (np.sum(~flipped_grey_grid[i][j:j + 2]) == 2 and (j == 0 or prev_sum < 1) and
                (i == 0 or np.sum(~flipped_grey_grid[i - 1][j:j+2]) < 1) and 
                (i + 1 >= grid_shape[0] and np.sum(~flipped_grey_grid[(i + 1) % grid_shape[0]][j:j+2]) < 1) and
                (j + 2 >= grid_shape[1] or np.sum(~flipped_grey_grid[i][j+2:j + 3]) < 1)):
                cars_on_grid[j:j+2, i] = car_num_placed
                car_num_placed += 1 
                ##print("found 2 vertical", i, j, np.sum(~flipped_grey_grid[i - 1][j:j+2]), np.sum(~flipped_grey_grid[(i + 1) % grid_shape[0]][j:j+2]), np.sum(~flipped_grey_grid[i][j+2:j + 3]), j + 2 >= grid_shape[1])

    ##print("Cars on grid:\n", cars_on_grid)
    return cars_on_grid, car_num_placed + 1

'''
Helper function that groups all of the cars with only one adjacent sqaure (and therefore
only one option to pair with and make a car) together with the adjacent square to make a car
'''
def get_single_adjacent(cars_on_grid, colors, car_num):
    grid_shape = cars_on_grid.shape
    ##print("Cars on grid:\n", cars_on_grid)
    
    for i in range(grid_shape[0]):
        for j in range(grid_shape[1]):
            if cars_on_grid[i][j] == -1:
                adjacency_dict = get_adjacency(cars_on_grid, colors, i, j)
                ##print(i, j, adjacency_dict)
                #check if only 1 option or 0 (error)
                num_adjacent_boxes = 4 - sum(1 for value in adjacency_dict.values() if value == [0, 0, 0])
                ##print(i, j, num_adjacent_boxes)

                '''if num_adjacent_boxes == 0:
                    #print("ERROR, no adjacent boxes")
                el'''
                if num_adjacent_boxes == 1: #only one option for pairing
                    #handle pairing logic
                    ##print(i,j,cars_on_grid[i][j], adjacency_dict)
                    for key, value in adjacency_dict.items():
                        if value != [0, 0, 0]:
                            ##print(i,j, key)
                            if key == "top" and cars_on_grid[i - 1][j] == -1:
                                cars_on_grid[i][j] = car_num
                                cars_on_grid[i - 1][j] = car_num
                                car_num += 1
                            elif key == "bottom" and cars_on_grid[i + 1][j] == -1:
                                cars_on_grid[i][j] = car_num
                                cars_on_grid[i + 1][j] = car_num
                                car_num += 1
                            elif key == "left" and cars_on_grid[i][j - 1] == -1:
                                cars_on_grid[i][j] = car_num
                                cars_on_grid[i][j - 1] = car_num
                                car_num += 1
                            elif key == "right" and cars_on_grid[i][j + 1] == -1:
                                cars_on_grid[i][j] = car_num
                                cars_on_grid[i][j + 1] = car_num
                                car_num += 1

    ##print(cars_on_grid)
    return cars_on_grid, car_num

'''
Helper function that matches all of the unassigned squares
with the square it's closest with to make the final board rep
'''
def match_unassigned_squares(partial_cars_on_grid, colors, car_num):
    ##print("partial cars on grid:\n", partial_cars_on_grid)
    directions_grid = np.full((6, 6), "None", dtype='<U6')
    grid_shape = partial_cars_on_grid.shape
    for i in range(grid_shape[0]):
        for j in range(grid_shape[1]):
            #still unassigned car that needs to be matched
            if partial_cars_on_grid[i][j] == -1:
                adjacency_dict = get_adjacency(partial_cars_on_grid, colors, i, j)
                c = colors[i][j]
                ##print(i,j,c)

                best_dir = "left"
                shortest_dist = 65000
                for key, value in adjacency_dict.items():
                    if value != [0, 0, 0]:
                        dc = np.zeros(3)
                        di, dj = get_dir_coords(key, i, j)
                        dc = colors[di][dj]
                        #calcualte distance
                        bd = (c[2] - dc[2]) ** 2
                        gd = (c[1] - dc[1]) ** 2
                        rd = (c[0] - dc[0]) ** 2
                        distance = rd + gd + bd
                        
                        #updates shortest distance
                        if distance < shortest_dist:
                            shortest_dist = distance
                            best_dir = key
                        ##print(key, dc, distance)

                directions_grid[i][j] = best_dir
                #partial_cars_on_grid[i][j] = car_num
                #di, dj = get_dir_coords(best_dir, i, j)
                #change this so that I can handle 3 in middle
                #partial_cars_on_grid[i][j] = car_num
                
    ##print(cars_on_grid)
    ##print("Directions\n", directions_grid)

    for i in range(grid_shape[0]):
        for j in range(grid_shape[1]):
            key = directions_grid[i][j]
            if key != "None" and partial_cars_on_grid[i][j] == -1:
                ##print(key, i, j)
                di, dj = get_dir_coords(key, i, j)
                dkey = directions_grid[di][dj]
                if (keys_opposite(key, dkey)): #matching pair (top & bottom) or (left & right)
                    #add something here to check if 
                    partial_cars_on_grid[i][j] = car_num
                    partial_cars_on_grid[di][dj] = car_num
                    car_num += 1
                else: #checks if its a possible 3
                    ##print("possible 3", i, j)
                    #check next two blocks are a match
                    ddi, ddj = get_dir_coords(key, di, dj)
                    if ((di >= 0 and di < grid_shape[0]) and (ddi >= 0 and ddi < grid_shape[0]) and
                        (dj >= 0 and dj < grid_shape[1]) and (ddj >= 0 and ddj < grid_shape[1]) and
                        (partial_cars_on_grid[di][dj] == partial_cars_on_grid[ddi][ddj])):
                        ##print("found 3")
                        if partial_cars_on_grid[di][dj] != -1:
                            partial_cars_on_grid[i][j] = partial_cars_on_grid[di][dj]
                        else:
                            partial_cars_on_grid[i][j] = car_num
                            partial_cars_on_grid[di][dj] = car_num
                            partial_cars_on_grid[ddi][ddj] = car_num
                            car_num += 1


    return partial_cars_on_grid, car_num

'''
Fixes when two adjacent sqaures that are supposed to make a car haven't been properly read
'''
def fix_adjacent_not_read(final_cars_on_grid, car_num):
    grid = np.array(final_cars_on_grid)
    positions = np.where(grid == -1)
    
    points = list(zip(positions[0], positions[1])) 
    for i in range(len(points)):
        for j in range(i + 1, len(points)):  # Avoid repeating pairs
            x1, y1 = points[i]
            x2, y2 = points[j]
            # Check for horizontal or vertical adjacency
            if (abs(x1 - x2) == 1 and y1 == y2) or (x1 == x2 and abs(y1 - y2) == 1):
                # if they are adjacent
                final_cars_on_grid[x1, y1] = car_num
                final_cars_on_grid[x2, y2] = car_num
                car_num += 1
    return final_cars_on_grid

'''
fixes the error where there are cars of length 4

Can occur when creating a 3 car
both sides of the concrete pair think they should be added to make the car of length 3
Happens when 1 side's rgb distance is closer to car of length 3 than what should be the match
'''
def fix_four_error(x, y, vertical, grid, colors):
    ##print("Fixing at", x, y, grid[x][y])
    ##print("Start Grid:\n", grid)
    if vertical:
        bottom_adj = get_adjacency(grid, colors, x, y)
        shortest_bottom = 65000
        bottom_dir = "bottom"
        for key, value in bottom_adj.items():
            if key != "top" and value != [0,0,0]:
                rd = (value[2] - colors[x][y][2]) ** 2
                gd = (value[1] - colors[x][y][1]) ** 2
                bd = (value[0] - colors[x][y][0]) ** 2
                distance = rd + gd + bd
                ##print("left", key, "distance:", distance)
                if distance < shortest_bottom:
                    shortest_bottom = distance
                    bottom_dir = key

        top_adj = get_adjacency(grid, colors, x+3, y)
        shortest_top = 65000
        top_dir = "top"
        for key, value in top_adj.items():
            if key != "bottom" and value != [0,0,0]:
                rd = (value[2] - colors[x+3][y][2]) ** 2
                gd = (value[1] - colors[x+3][y][1]) ** 2
                bd = (value[0] - colors[x+3][y][0]) ** 2
                distance = rd + gd + bd
                ##print("right", key, "distance:", distance)
                if distance < shortest_top:
                    shortest_top = distance
                    top_dir = key

        if shortest_bottom > shortest_top:
            i, j = get_dir_coords(top_dir, x+3, y)
            grid[x+3][y] = grid[i][j]
        else:
            i, j = get_dir_coords(bottom_dir, x, y)
            grid[x][y] = grid[i][j]
    else:
        left_adj = get_adjacency(grid, colors, x, y)
        shortest_left = 65000
        left_dir = "left"
        for key, value in left_adj.items():
            if key != "right" and value != [0,0,0]:
                rd = (value[2] - colors[x][y][2]) ** 2
                gd = (value[1] - colors[x][y][1]) ** 2
                bd = (value[0] - colors[x][y][0]) ** 2
                distance = rd + gd + bd
                ##print("left", key, "distance:", distance)
                if distance < shortest_left:
                    shortest_left = distance
                    left_dir = key

        right_adj = get_adjacency(grid, colors, x, y + 3)
        shortest_right = 65000
        right_dir = "right"
        for key, value in right_adj.items():
            if key != "left" and value != [0,0,0]:
                rd = (value[2] - colors[x][y+3][2]) ** 2
                gd = (value[1] - colors[x][y+3][1]) ** 2
                bd = (value[0] - colors[x][y+3][0]) ** 2
                distance = rd + gd + bd
                ##print("right", key, "distance:", distance)
                if distance < shortest_right:
                    shortest_right = distance
                    right_dir = key

        if shortest_left > shortest_right: #right is closer and more likely to be wrong
            i, j = get_dir_coords(right_dir, x, y+3)
            grid[x][y+3] = grid[i][j]
        else: #left is more likely to be wrong
            i, j = get_dir_coords(left_dir, x, y)
            grid[x][y] = grid[i][j]

    ##print("end grid:\n", grid)
    pos_dict, color_dict = get_car_coords_color_dict(grid, colors)
    level_rep = get_cars_from_dict(pos_dict, color_dict)
    sorted_level_rep = sorted(level_rep, key=lambda car: car['color'] != 'red')
    return sorted_level_rep 

'''
Attempts to fix all the errors that occur when the final grid rep has a -1 in it
'''
def fix(final_grid, starting_level_rep, colors):
    #calculates the sum of tiles used in the starting rep and grid rep
    ##print("Given final grid:\n", final_grid)
    ##print("Starting level rep", starting_level_rep)
    s = 0
    for car in starting_level_rep:
        s += car["length"]
    
    g = final_grid > 0
    gs = sum(sum(g))
    #print("car[] rep - grid rep =", s - gs)
    
    if s - gs == 2: #likely car pair that didn't match
        fixCarNum = np.max(final_grid) + 1
        ##print("trying to fix adjacent not read", fixCarNum)
        final_grid = fix_adjacent_not_read(final_grid, fixCarNum)
    elif s-gs == 1: #likey end of 3 wrongly matched with part of 2, -1 is leftover unmatched part of 2
        #print("fixing using starting rep")
        final_grid = fix_using_start_rep(final_grid, colors, starting_level_rep)
    elif s-gs < 0:
        #too many grey's being read
        print("need to implement grey removal in fix function")
        #calculate the distance between grey and each sqaure that isn't 0
        #remove closest ones to being grey


    #throwing error if problem couldn't be solved
    g = final_grid > 0
    gs = sum(sum(g))
    if gs - s != 0: #changes to -1 bc that will throw error
        final_grid[0][0] = -1
    
    return final_grid

'''
Uses the starting representation to match cars to the final grid representation if there's an error
'''
#TODO finish this function
def fix_using_start_rep(initial_final_grid, colors, initial_starting_level_rep):
    #find all of the created cars that are likely placed correctly
    final_grid = initial_final_grid.copy()
    new_car_num = final_grid.max() + 1
    #print("new car num is:", new_car_num)
    starting_level_rep = initial_starting_level_rep.copy()
    #print("initial final grid is:\n", initial_final_grid)

    #remove all found cars from the final rep
    not_found_cars = []
    for car in starting_level_rep:
        if car["vertical"]:
            car_nums_in_column = {}
            car_y = 5 - car["x"]
            column = final_grid[:, car_y]
            print(column)
            ##print("column is", column)
            #get all the car nums on the grid
            for i, num in enumerate(column):
                if num != 0:
                    if num in car_nums_in_column:
                        car_nums_in_column[num].append(i)
                    else:
                        car_nums_in_column[num] = [i]

            #match the car with its grid rep if it is found
            ##print(car_nums_in_column)
            car_len = car["length"]
        
            found_car = False
            for value in car_nums_in_column.values():
                if len(value) == car_len and not found_car:
                    ##print("found car at", value[0], car_y)
                    for v in value:
                        final_grid[v][car_y] = 0 #set to 0 so other car's can't read it atm
                    #starting_level_rep.remove(car)
                    found_car = True
            if not found_car:
                not_found_cars.append(car)

        else:
            car_nums_in_row = {}
            car_x = 5 - car["y"]
            row = final_grid[car_x]
            #get all the car nums on the grid
            for i, num in enumerate(row):
                if num != 0:
                    if num in car_nums_in_row:
                        car_nums_in_row[num].append(i)
                    else:
                        car_nums_in_row[num] = [i]

            #match the car with its grid rep if it is found
            ##print(car_nums_in_row)
            car_len = car["length"]
            found_car = False
            for value in car_nums_in_row.values():
                if len(value) == car_len and not found_car:
                    ##print("found car at", car_x, value[0])
                    for v in value:
                        final_grid[car_x][v] = 0
                    #starting_level_rep.remove(car)
                    found_car = True
            if not found_car:
                not_found_cars.append(car)
            
    #print("Cars left rep:\n", starting_level_rep, len(starting_level_rep))
    print("Not found:\n", not_found_cars)

    #loop through remaining cars and try to rearrange
    for car in not_found_cars:
        #print(car)
        if car["vertical"]:
            car_nums_in_column = {}
            car_y = 5 - car["x"]
            column = final_grid[:, car_y]

            #print(column)
            #get all the car nums on the column
            for i, num in enumerate(column):
                if num != 0:
                    if num in car_nums_in_column:
                        car_nums_in_column[num].append(i)
                    else:
                        car_nums_in_column[num] = [i]

            #match the car with its grid rep if it is found
            car_len = car["length"]
        
            ##print("missing car is", car)
            total_unassigned_squares = 0
            for value in car_nums_in_column.values():
                l = len(value)
                total_unassigned_squares += l

            #print(total_unassigned_squares, car_len)

            if total_unassigned_squares > car_len:
                print("need to implement, hasn't occured yet")
            elif total_unassigned_squares == car_len:
                for value in car_nums_in_column.values():
                    for v in value:
                        initial_final_grid[v][car_y] = new_car_num
                #print("assign all unassigned squares to same num")
            else:
                print("need to implement, hasn't occured yet")
    
            #for value in car_nums_in_column.values():
            
            '''    adjacent_squares = {}
                if len(value) == car_len - 1:
                    if car_len == 3:
                        ##print([[v, car_y] for v in value]) 
                        a = min(value)
                        b = max(value)
                        if a > 0:
                            ##print("color at", a-1, car_y, "is:", colors[a-1][car_y], colors[a][car_y], calculate_color_distance(colors[a][car_y], colors[a-1][car_y]))
                            adjacent_squares[calculate_color_distance(colors[a][car_y], colors[a-1][car_y])] = [a-1, final_grid[a][car_y]]
                        if b < 5:
                            ##print("color at", b+1, car_y, "is:", colors[b+1][car_y])
                            adjacent_squares[calculate_color_distance(colors[b][car_y], colors[b+1][car_y])] = [b+1, final_grid[b][car_y]]
                    

                        #change square that is most likely to be the wrong one
                        mv = adjacent_squares[min(adjacent_squares.keys())] #mv = [y_val_to_change, val_to_set_it_to]
                        ##print(mv)
                        final_grid[mv[0]][car_y] = mv[1]
                    else: #car length is 2
                        if (-1 in car_nums_in_column): #negative 1 needs to bind to closest in column
                            ##print("found -1")
                            index = car_nums_in_column[-1][0]

                            if index > 0:
                                ##print("color at", index-1, car_y, "is:", colors[index-1][car_y], colors[index][car_y], calculate_color_distance(colors[a][car_y], colors[a-1][car_y]))
                                adjacent_squares[calculate_color_distance(colors[index][car_y], colors[index-1][car_y])] = [index, final_grid[index-1][car_y]]
                            if index < 5:
                                ##print("color at", index+1, car_y, "is:", colors[index+1][car_y])
                                adjacent_squares[calculate_color_distance(colors[index][car_y], colors[index+1][car_y])] = [index, final_grid[index+1][car_y]]
                            
                            mv = adjacent_squares[min(adjacent_squares.keys())] #mv = [y_val_to_change, val_to_set_it_to]
                            ##print(mv)
                            final_grid[mv[0]][car_y] = mv[1]
                #TODO implement car logic for length 2 cars
        '''
        else:
            car_nums_in_row = {}
            car_x = 5 - car["y"]
            row = final_grid[car_x]
            #print(row)

            #get all the car nums on the grid
            for i, num in enumerate(row):
                if num != 0:
                    if num in car_nums_in_row:
                        car_nums_in_row[num].append(i)
                    else:
                        car_nums_in_row[num] = [i]

            #match the car with its grid rep if it is found
            #print(car_nums_in_row)
            car_len = car["length"]
        
            #print(car_nums_in_row)
            total_unassigned_squares = 0
            for value in car_nums_in_row.values():
                l = len(value)
                total_unassigned_squares += l

            #print(total_unassigned_squares, car_len)

            if total_unassigned_squares > car_len:
                print("need to implement, hasn't occured yet")
            elif total_unassigned_squares == car_len:
                for value in car_nums_in_row.values():
                    for v in value:
                        initial_final_grid[car_x][v] = new_car_num
                #print("assign all unassigned squares to same num")
            else:
                print("need to implement, hasn't occured yet")
    
    #print("revised final grid is:\n", initial_final_grid)
    return initial_final_grid

'''
Helper function for when 1 color square is read as a grey
'''
#TODO finish this function and fix it (rn 2 can read a 3 which will cause errors)
def find_missing_color(final_grid, starting_level_rep, colors):
    for car in starting_level_rep:
        if car["vertical"]:
            car_nums_in_column = {}
            car_y = 5 - car["x"]
            column = final_grid[:, car_y]
            ##print("column is", column)
            #get all the car nums on the grid
            for i, num in enumerate(column):
                if num != 0:
                    if num in car_nums_in_column:
                        car_nums_in_column[num].append(i)
                    else:
                        car_nums_in_column[num] = [i]

            #match the car with its grid rep if it is found
            ##print(car_nums_in_column)
            car_len = car["length"]
        
            found_car = False
            for value in car_nums_in_column.values():
                if len(value) == car_len and not found_car:
                    #print("found car at", value[0], car_y)
                    for v in value:
                        final_grid[v][car_y] = 0 #set to 0 so other car's can't read it atm
                    found_car = True

            if not found_car:
                print("missing car is", car, ". Need to implement logic")
                #missing car logic right here
                #TODO fill this out (use portion below)
        else:
            car_nums_in_row = {}
            car_x = 5 - car["y"]
            row = final_grid[car_x]
            #print("row is", row)
            #get all the car nums on the grid
            for i, num in enumerate(row):
                if num != 0:
                    if num in car_nums_in_row:
                        car_nums_in_row[num].append(i)
                    else:
                        car_nums_in_row[num] = [i]

            #match the car with its grid rep if it is found
            #print(car_nums_in_row)
            car_len = car["length"]
        
            found_car = False
            for value in car_nums_in_row.values():
                if len(value) == car_len and not found_car:
                    #print("found car at", car_x, value[0])
                    for v in value:
                        final_grid[car_x][v] = 0
                    found_car = True

            if not found_car:
                #print("missing car is", car)
                for value in car_nums_in_row.values():
                    adjacent_squares = {}
                    if len(value) == car_len - 1:
                        #print([[car_x, v] for v in value]) 
                        a = min(value)
                        b = max(value)
                        if a > 0 and final_grid[car_x][a-1] == 0:
                            #print("color at", car_x, a-1, "is:", colors[car_x][a-1], colors[car_x][a], calculate_color_distance(colors[car_x][a], colors[car_x][a-1]))
                            adjacent_squares[calculate_color_distance(colors[car_x][a], colors[car_x][a-1])] = [a-1, final_grid[car_x][a]]
                        if b < 5:
                            if final_grid[car_x][b+1] == 0:
                                print("color at", car_x, b+1, "is:", colors[car_x][b+1])
                            else:
                                print(colors[car_x][a-2], colors[car_x][a], calculate_color_distance(colors[car_x][a],  colors[car_x][a-2]))
                #missing car logic right here
                mv = adjacent_squares[min(adjacent_squares.keys())] #mv = [x_val_to_change, val_to_set_it_to]
                #print(mv)
                return [car_x] + mv

    return [0,0,0]


'''
CONVERTING GRID REPRESENTATION INTO CAR[] REPRESENTATION
'''
'''
Takes in the final grid representation and rgb colors of the grid
Returns the car coords dict and car colors dict
'''
def get_car_coords_color_dict(final_cars_on_grid, colors):
    grid_shape = final_cars_on_grid.shape
    car_coords_dict = {}
    for i in range(grid_shape[0]):
        for j in range(grid_shape[1]):
            n = final_cars_on_grid[i][j]
            if n != 0:
                if n in car_coords_dict:
                    car_coords_dict[n].append([i, j])
                else:
                    car_coords_dict[n] = [[i, j]]

    car_colors = {}
    for key, value in car_coords_dict.items():
        avg_color = np.zeros(3)
        for coord in value:
            i, j = coord
            avg_color += colors[i][j]
        car_colors[key] = avg_color / len(value)

    return car_coords_dict, car_colors

'''
Converts car coords dict and car colors dict to Car[] representation
'''
def get_cars_from_dict(cars_pos, cars_color_rgb):
    ##print(cars_pos, cars_color_rgb)
    cars_color = {}
    #set the red car
    red_car_num = get_red(cars_color_rgb)    
    ##print("Red car num\n", red_car_num)
    cars_color[red_car_num] = Color.RED
    #set the remaining cars
    for key, value in cars_color_rgb.items():
        if key != red_car_num:
            cars_color[key] = convert_car_to_color(value)
    
    ##print("Color\n", cars_color)
    level_rep_tsx = []
    for key, value in cars_pos.items():
        horizontal_coords = [coord[1] for coord in value]
        vertical_coords = [coord[0] for coord in value]
        ##print(horizontal_coords, min(horizontal_coords))
        x = 5 - max(horizontal_coords)
        y = 5 - max(vertical_coords)
        isVertical = (value[0][0] != value[1][0])
        length = len(value)
        car_color = cars_color[key]

        car_rep_dict = { "x": x, "y": y, "vertical": isVertical, "length": length, "color": car_color.value }
        level_rep_tsx.append(car_rep_dict)


    return level_rep_tsx

'''
Converts car coords dict and car colors dict to Car[] representation
'''
def get_cars_from_dicts_and_start_rep(cars_pos, cars_color_rgb, starting_level_rep):
    level_rep_tsx = []
    
    #set the red car
    red_car_num = get_red_using_pos(cars_pos, cars_color_rgb)    
    red_car_coords = cars_pos[red_car_num]
    rc_horizontal_coords = [coord[1] for coord in red_car_coords]
    rc_vertical_coords = [coord[0] for coord in red_car_coords]
    ##print(horizontal_coords, min(horizontal_coords))
    rc_x = 5 - max(rc_horizontal_coords)
    rc_y = 5 - max(rc_vertical_coords)
    rc_isVertical = (red_car_coords[0][0] != red_car_coords[1][0])
    rc_length = len(red_car_coords)
    level_rep_tsx.append({ "x": rc_x, "y": rc_y, "vertical": rc_isVertical, 
                          "length": rc_length, "color": "red"})
    del cars_pos[red_car_num] 

    #getting all the colors in the initial representation
    initial_rep_dict = {}
    for car in starting_level_rep:
        if car["color"] != "red": #bc we already handled the red car
            initial_rep_dict[(car["x"], car["y"], car["vertical"], car["length"])] = car["color"]
        
    #print("Color\n", cars_color)
    for key, value in cars_pos.items():
        horizontal_coords = [coord[1] for coord in value]
        vertical_coords = [coord[0] for coord in value]
        #print(horizontal_coords, min(horizontal_coords))
        x = 5 - max(horizontal_coords)
        y = 5 - max(vertical_coords)
        isVertical = (value[0][0] != value[1][0])
        length = len(value)
        car_color = cars_color_rgb[key]


        #print("current tsx rep is:", x, y, isVertical, length)
        possible_cars_color_distance = {}
        if isVertical:
            for ikey, ivalue in initial_rep_dict.items():
                if ikey[0] == x:
                    possible_cars_color_distance[calculate_color_distance_rgb_str(car_color, ivalue)] = ivalue    
        else: #is horizontal
            for ikey, ivalue in initial_rep_dict.items():
                if ikey[1] == y:
                    possible_cars_color_distance[calculate_color_distance_rgb_str(car_color, ivalue)] = ivalue
                    
        if possible_cars_color_distance: #if dictionary has values
            car_rep_dict = { "x": x, "y": y, "vertical": isVertical, "length": length, "color": possible_cars_color_distance[min(possible_cars_color_distance.keys())] }
            level_rep_tsx.append(car_rep_dict)
        else: #dictionary is empty, board is being read wrong and the car can't be found
            #print("Error: could not find correct car")
            return [{ "x": 0, "y": 2, "vertical": False, "length": 2, "color": "red" }]


    return level_rep_tsx



'''
Helper function to find the red car in the final grid rep
'''
def get_red(cars_color):
    red_dist = {}
    for key, value in cars_color.items():
        bd = (value[2] - RED[2]) ** 2
        gd = (value[1] - RED[1]) ** 2
        rd = (value[0] - RED[0]) ** 2
        distance = rd + gd + bd
        red_dist[distance] = key
    
    return red_dist[min(red_dist.keys())]

def get_red_using_pos(cars_pos, cars_color):
    red_dist = {}
    for key, value in cars_color.items():
        if all(row[0] == 3 for row in cars_pos[key]):
            bd = (value[2] - RED[2]) ** 2
            gd = (value[1] - RED[1]) ** 2
            rd = (value[0] - RED[0]) ** 2
            distance = rd + gd + bd
            red_dist[distance] = key
    
    return red_dist[min(red_dist.keys())]


'''
GETTING REPRESENTATIONS FOR THE SOCKET CONNECTION
'''
'''Gets level rep without knowing the starting level rep'''
def get_level_rep_socket(avg_values, adj_color_values):
    greys_grid = np.full((6, 6), False)
    colors = np.zeros((6, 6, 3))

    grid_size = avg_values.shape[0]
    for i in range(grid_size):
        for j in range(grid_size):
            c = np.round(avg_values[i][j][::-1]).astype(int)  # Convert color enum to Pygame-compatible value
            ##print(c, adj_color_values[i][j])
            acv = np.round(adj_color_values[i][j][::-1]).astype(int)
            color = (
                max(0, min(255, c[0] + acv[0])),
                max(0, min(255, c[1] + acv[1])),
                max(0, min(255, c[2] + acv[2]))
            )

            is_grey = check_is_grey(color) #(cc.value == 'grey')
            greys_grid[i][j] = is_grey
            colors[i][j] = color
    
    cars_pos, cars_color, final_cars_on_grid = get_cars_from_grid_grey(greys_grid, colors)
    ##print("Car pos:\n", cars_pos)
    ##print("Car color:\n", cars_color)

    #check if there was an error
    if -1 in cars_pos:
        #print("Error with the camera reading, here is the grid:\n", final_cars_on_grid)
        #print("grey's grid for error:\n", greys_grid)
        return [{"x":1, "y":2, "vertical": False, "length":2, "color":"red"}]
    
    ##print("Final grid:\n", final_cars_on_grid)
    level_rep = get_cars_from_dict(cars_pos, cars_color)
    sorted_level_rep = sorted(level_rep, key=lambda car: car['color'] != 'red')
    for car in sorted_level_rep:
        if car["length"] > 3:
            #run here to fix error, should only be 4 in a row max
            #print("Error car: ", car)
            a = 5 - car["y"]
            b = 5 - car["x"]
            v = car["vertical"]
            if v:
                a -= 3
            else:
                b -=3
            return fix_four_error(a, b, v, final_cars_on_grid, colors)
    #make sure level rep has the red car first
    ##print("Colors:\n", colors)
    return sorted_level_rep

'''
Gets level rep, needs to know starting level rep

Parameters:
  *  avg_values - rgb color representation of grid
  *  adj_color_values - how much each square's rgb representation should be adjusted by to try and account for shadows/bright spots
  *  starting_level_rep - car[] representation of level when it started
Returns
  *  sortedLevelRep - Car[] representation of level
  *  readCorrectly - boolean value representing if the cam read the board correctly 
                    or if there was an unaccounted error it couldn't handle
'''
def get_level_rep_existing(avg_values, adj_color_values, starting_level_rep):
    #creating and setting colors
    colors = np.zeros((6, 6, 3))
    grid_size = avg_values.shape[0]
    
    for i in range(grid_size):
        for j in range(grid_size):
            c = np.round(avg_values[i][j][::-1]).astype(int)  # Convert color enum to Pygame-compatible value
            ##print(c, adj_color_values[i][j])
            acv = np.round(adj_color_values[i][j][::-1]).astype(int)
            color = (
                max(0, min(255, c[0] + acv[0])),
                max(0, min(255, c[1] + acv[1])),
                max(0, min(255, c[2] + acv[2]))
            )

            colors[i][j] = color
    
    #get cars from camera grid
    final_cars_on_grid = get_cars_from_grid(colors)
    
    #check if there was an error and try to fix it if there was
    if np.any(final_cars_on_grid == -1):
        #print("Error with the camera reading, here is the rgb grid:\n", colors)
        #print("Error with the camera reading, here is the grid:\n", final_cars_on_grid)
        placeholder = True

    #actually going to just have fix return fixed version, same if nothing was wrong
    final_cars_on_grid = fix(final_cars_on_grid, starting_level_rep['cars'], colors)
    #print("New final grid:\n", final_cars_on_grid)
    

    #if the final grid still has a -1 return an error
    if np.any(final_cars_on_grid == -1):
        return [{'x': 1, 'y': 2, 'vertical': False, 'length': 2, 'color': 'red'}], False
    
    #if no error in the grid representation get the dict representation
    cars_pos, cars_color = get_car_coords_color_dict(final_cars_on_grid, colors)
    
    #get the final level rep
    level_rep = get_cars_from_dicts_and_start_rep(cars_pos, cars_color, starting_level_rep['cars'])
    
    #put the red car first in list
    sorted_level_rep = sorted(level_rep, key=lambda car: car['color'] != 'red')
    
    #check that none of the cars are length 4, fix if they are
    for car in sorted_level_rep:
        if car["length"] > 3:
            #run here to fix error, should only be 4 in a row max
            #print("Car of length 4 that caused error: ", car)
            a = 5 - car["y"]
            b = 5 - car["x"]
            v = car["vertical"]
            if v:
                a -= 3
            else:
                b -=3
            return fix_four_error(a, b, v, final_cars_on_grid, colors)
    
    return sorted_level_rep, True
