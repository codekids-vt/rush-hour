function carsOverlap(car1: Car, car2: Car): boolean {
    let carCells1 = Array.from({ length: car1.length }, (_, i) => {
        return car1.vertical ? { x: car1.x, y: car1.y + i } : { x: car1.x + i, y: car1.y };
    });
    let carCells2 = Array.from({ length: car2.length }, (_, i) => {
        return car2.vertical ? { x: car2.x, y: car2.y + i } : { x: car2.x + i, y: car2.y };
    });
    const overlapping = carCells1.some((cell) => carCells2.some((otherCell) => cell.x === otherCell.x && cell.y === otherCell.y));
    return overlapping;
}

//change so that it can handle going down to up and right to left
function carsOnPath(otherCars: Car[], pathTaken: number[]) { //pathTaken = [startX, endX, startY, endY]
    const movedHorizontal = (pathTaken[2] == pathTaken[3]);
    
    for (const car of otherCars) {
        if (movedHorizontal) {
            let movedCarY = pathTaken[2];
            var leftX = pathTaken[0];
            var rightX = pathTaken[1];

            //swap left and right X if the car was moved from right to left
            if (rightX < leftX) {
                var temp = rightX;
                rightX = leftX;
                leftX = temp;
            }

            //console.log(leftX);
            //console.log(rightX);

            if (car.x < rightX && car.x > leftX) { //other car is located between x coords
                if (car.y == movedCarY) { //if other car's Y is located along path (covers all horizontal)
                    return true;
                }

                //if other car is vertical and located along the path
                if (car.vertical && car.y < movedCarY && (car.y + car.length) >= movedCarY) {
                    return true;
                }
            }
        } else { //car moved vertically
            let movedCarX = pathTaken[0];
            let bottomY = pathTaken[3];
            let topY = pathTaken[2];

            if (car.x < bottomY && car.x > topY) { //other car is located between y coords
                if (car.x == movedCarX) { //if other car's X is located along path (covers all vertical)
                    return true;
                }

                //if other car is horizontal and located along the path
                if (!car.vertical && car.x < movedCarX && (car.x + car.length) >= movedCarX) {
                    return true;
                }
            }
        }
    }

    return false;
}

export function isLegalMove(cars: Car[], car: Car, newCar: Car): boolean {
    // get all cars but the car being moved
    const otherCars = cars.filter((otherCar) => otherCar.x !== car.x || otherCar.y !== car.y);
    // check that the cars are not overlapping with the newCar

    if (otherCars.some((otherCar) => carsOverlap(newCar, otherCar))) {
        return false;
    }

    // check that the car is not going off the board
    let newCarCells = Array.from({ length: newCar.length }, (_, i) => {
        return newCar.vertical ? { x: newCar.x, y: newCar.y + i } : { x: newCar.x + i, y: newCar.y };
    });

    if (newCarCells.some((cell) => cell.x < 0 || cell.x >= 6 || cell.y < 0 || cell.y >= 6)) {
        return false;
    }

    // check the car only moved in the direction it is facing
    if (car.vertical) {
        if (newCar.x !== car.x) {
            return false;
        }
    } else {
        if (newCar.y !== car.y) {
            return false;
        }
    }


    //check if there were any moved cars along the path that the moved on went through
    let pathTaken = [car.x, newCar.x, car.y, newCar.y];
    if (carsOnPath(otherCars, pathTaken)) {
        return false;
    }


    return true;
}

export function canPlaceCustom(cars : Car[], x : number, y : number, length : number, horizontal: boolean): boolean {
    const placedCar = { x: x, y: y, vertical: !horizontal, length: length, color: "green" };
    const overlaps = customOverlaps(cars, placedCar);
    console.log("Cars overlap:", overlaps);
    if (overlaps) {
        return false;
    }
    
    if (x >= 0 && x <= 3 && y >= 0 && y <= 3) { //in general
        return true;
    } else if (length === 2) {
        console.log("Length:", length, ", ", x, ", ", y, ", ", horizontal);
        if (horizontal) {
            if (x <= 4 && y >= 0 && y <= 5) {
                return true;
            }
        } else { //vertical
            if (y <= 4 && x >= 0 && x <= 5) {
                return true;
            }
        }
    } else if (length === 3) {
        console.log("Length:", length, ", ", x, ", ", y, ", ", horizontal);
        if (horizontal) {
            console.log("horizontal true");
            if (x <= 3 && y >= 0 && y <= 5) {
                console.log("return true");
                return true;
            }
        } else { //vertical
            if (y <= 3 && x >= 0 && x <= 5) {
                console.log("return true");
                return true;
            }
        }
    }

    return false;
}

function customOverlaps(cars: Car[], placedCar: Car): boolean {
    for (const carOnBoard of cars) {
        if(carOnBoard.vertical && placedCar.vertical) {
            const y1 = carOnBoard.y;
            const yl1 = carOnBoard.y + carOnBoard.length;
            const y2 = placedCar.y;
            const yl2 = placedCar.y + placedCar.length;
            
            //x's are equal and top or bottom y's aren't the same
            if (carOnBoard.x == placedCar.x && y1 != y2 && yl1 != yl2) {
                if (!(Math.min(yl1, yl2) > Math.max(y1, y2))) { //top of bottom car is higher up than bottom of top car (overlap) 
                    return true;
                }
            }
        } else if(carOnBoard.vertical && !placedCar.vertical) {
            const x_overlap = (carOnBoard.x >= placedCar.x && carOnBoard.x < placedCar.x + placedCar.length);
            const y_overlap = (placedCar.y >= carOnBoard.y && placedCar.y < carOnBoard.y + carOnBoard.length);

            //x's are equal and top or bottom y's aren't the same
            if (x_overlap && y_overlap) {
                return true;
            }
        } else if(!carOnBoard.vertical && placedCar.vertical) {
            const x_overlap = (placedCar.x >= carOnBoard.x && placedCar.x < carOnBoard.x + carOnBoard.length);
            const y_overlap = (carOnBoard.y >= placedCar.y && carOnBoard.y < placedCar.y + placedCar.length);
            console.log(placedCar.x + ", " + carOnBoard.x);
            console.log("X_overlap:", x_overlap);
            console.log("y_console:", y_overlap);

            //x's are equal and top or bottom y's aren't the same
            if (x_overlap && y_overlap) {
                return true;
            }
        } else {
            const x1 = carOnBoard.y;
            const xl1 = carOnBoard.y + carOnBoard.length;
            const x2 = placedCar.y;
            const xl2 = placedCar.y + placedCar.length;
            
            //x's are equal and top or bottom y's aren't the same
            if (carOnBoard.y == placedCar.y && x1 != x2 && xl1 != xl2) {
                if (!(Math.min(xl1, xl2) > Math.max(x1, x2))) { //top of bottom car is higher up than bottom of top car (overlap) 
                    return true;
                }
            }
        }
    }
    
    return false;
}

export function isLegalCustomMove(cars: Car[], car: Car, newCar: Car) : boolean {
    // get all cars but the car being moved
    const otherCars = cars.filter((otherCar) => otherCar.x !== car.x || otherCar.y !== car.y);
    // check that the cars are not overlapping with the newCar

    if (otherCars.some((otherCar) => carsOverlap(newCar, otherCar))) {
        return false;
    }

    // check that the car is not going off the board
    let newCarCells = Array.from({ length: newCar.length }, (_, i) => {
        return newCar.vertical ? { x: newCar.x, y: newCar.y + i } : { x: newCar.x + i, y: newCar.y };
    });

    if (newCarCells.some((cell) => cell.x < 0 || cell.x >= 6 || cell.y < 0 || cell.y >= 6)) {
        return false;
    }

    return true;
}