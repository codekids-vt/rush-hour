import pytest
import webcolors
from cam_to_cars import car_lists_equal, closest_color, convert_color_map_to_cars, Color


def test_closest_color():
    test_colors = [
        ("#ad180a", "red"),
        ("#3056d1", "blue"),
        ("#144d27", "green"),
    ]
    for color, expected in test_colors:
        assert closest_color(webcolors.hex_to_rgb(color))[0] == expected

def test_convert_color_map_to_cars():
    color_map = [
        [Color.RED, Color.RED, Color.WHITE, Color.WHITE, Color.WHITE, Color.WHITE],
        [Color.WHITE, Color.WHITE, Color.WHITE, Color.WHITE, Color.WHITE, Color.WHITE],
        [Color.BLUE, Color.WHITE, Color.WHITE, Color.WHITE, Color.WHITE, Color.WHITE],
        [Color.BLUE, Color.WHITE, Color.WHITE, Color.WHITE, Color.WHITE, Color.WHITE],
        [Color.WHITE, Color.WHITE, Color.WHITE, Color.WHITE, Color.WHITE, Color.WHITE],
        [Color.WHITE, Color.WHITE, Color.WHITE, Color.WHITE, Color.WHITE, Color.WHITE],
    ]
    cars = convert_color_map_to_cars(color_map)
    print(cars)
    assert cars == [[[0, 0], [0, 1]], [[2, 0], [3, 0]]]
    
    
def test_car_lists_equal():
    car_list1 = [[[0, 0], [0, 1]], [[2, 0], [3, 0]]]
    car_list2 = [[[0, 0], [0, 1]], [[2, 0], [3, 0]]]
    assert car_lists_equal(car_list1, car_list2)
    
    car_list1 = [[[0, 1], [0, 0]], [[2, 0], [3, 0]]]
    car_list2 = [[[0, 0], [0, 1]], [[2, 0], [3, 0]]]
    assert car_lists_equal(car_list1, car_list2)
    
    car_list1 = [[[0, 0], [0, 1]], [[2, 0], [3, 0]]]
    car_list2 = [[[0, 0], [0, 1]], [[2, 0], [3, 1]]]
    assert not car_lists_equal(car_list1, car_list2)
    
    car_list1 = [[[0, 0], [0, 1]], [[2, 0], [3, 0]]]
    car_list2 = [[[0, 0], [0, 1]], [[2, 0], [3, 0]], [[4, 0], [4, 1]]]
    assert not car_lists_equal(car_list1, car_list2)
    
    car_list1 = [[[0, 0], [0, 1]], [[2, 0], [3, 0]]]
    car_list2 = [[[0, 0], [0, 1]], [[2, 0], [3, 0]], [[4, 0], [4, 1]]]
    assert not car_lists_equal(car_list1, car_list2)
    
    car_list1 = [[[0, 0], [0, 1]], [[2, 0], [3, 0]]]
    car_list2 = [[[0, 0], [0, 1]], [[2, 0], [3, 0]], [[4, 0], [4, 1]]]
    assert not car_lists_equal(car_list1, car_list2)
    
    car_list1 = [[[0, 0], [0, 1]], [[2, 0], [3, 0]]]
    car_list2 = [[[0, 0], [0, 1]], [[2, 0], [3, 0]], [[4, 0], [4, 1]]]
    assert not car_lists_equal(car_list1, car_list2)
    