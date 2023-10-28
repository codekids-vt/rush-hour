import pytest
from main import convert_color_map_to_cars, Color, car_lists_equal


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
    