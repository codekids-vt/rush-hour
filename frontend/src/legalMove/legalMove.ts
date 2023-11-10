export function isLegalMove(cars1: Record<string, number[][]>, cars2: Record<string, number[][]>): boolean {
    // Assuming a 6x6 board
    const boardSize = 6;

    // Helper function to check if a car is within the bounds of the board
    const isWithinBounds = (car: number[][]): boolean => {
        return car.every(([x, y]) => x >= 0 && x < boardSize && y >= 0 && y < boardSize);
    };

    // Helper function to check if a car moved legally
    const carMovedLegally = (car1: number[][], car2: number[][]): boolean => {
        // get whether car1 is horizontal or vertical
        let isHorizontal = car1.every(position => position[0] === car1[0][0]);
        let isVertical = car1.every(position => position[1] === car1[0][1]);

        // Cars must move in one direction, and the length must be the same
        // horizontal car example [[0, 0], [0, 1]]
        // if all x values are the same, then car moved horizontally
        let movedHorizontally = true;
        let movedVertically = true;
        for (let i = 0; i < car1.length; i++) {
            if (car1[i][0] !== car2[i][0]) {
                movedHorizontally = false;
            }
            if (car1[i][1] !== car2[i][1]) {
                movedVertically = false;
            }
        }

        return (isHorizontal && movedHorizontally && !movedVertically) || (isVertical && !movedHorizontally && movedVertically);
    };

    if (Object.keys(cars1).length !== Object.keys(cars2).length) {
        return false; // Different number of cars means it's definitely an illegal move
    }

    // build a new map of cars2
    const cars2Map = new Map(Object.entries(cars2));

    let movedCar: number[][] | undefined = undefined;
    let correspondingCar: number[][] | null = null;

    // get the moved car and the corresponding car
    for (const [key, car] of Object.entries(cars1)) {
        if (!cars2Map.has(key)) {
            return false; // cars1 has a car that cars2 doesn't have, so the move is illegal
        }
        if (JSON.stringify(car) !== JSON.stringify(cars2Map.get(key))) {
            if (movedCar) {
                return false; // cars1 has more than one car that moved, so the move is illegal
            }
            movedCar = car
        } else {
            cars2Map.delete(key);
        }
    }

    if (!movedCar) {
        return true; // No car moved, so the move is legal
    }
    // first check if only one car left in map
    if (cars2Map.size !== 1) {
        return false;
    }
    // get corresponding car as last one in map
    for (const car of cars2Map.values()) {
        correspondingCar = car;
    }
    // check if corresponding car is null
    if (!correspondingCar) {
        return false;
    }

    // If the car didn't move legally (in one direction), the move is illegal
    if (!carMovedLegally(movedCar, correspondingCar)) {
        return false;
    }

    // Check if the car is still within bounds
    if (!isWithinBounds(correspondingCar)) {
        return false;
    }

    // At this point, we know that each car from cars1 has a corresponding car in cars2
    // Now check for overlap between correspondingCar and all other cars in cars2
    for (const car of Object.values(cars2)) {
        if (car === correspondingCar) {
            continue;
        }
        // Check if any of the positions in correspondingCar overlap with any of the positions in car
        const flattenedAllPositions = correspondingCar.flat();
        const flattenedCarPositions = car.flat();
        const overlap = flattenedAllPositions.some(position => flattenedCarPositions.includes(position));

        if (overlap) {
            return false;
        }
    }

    return true;
}
