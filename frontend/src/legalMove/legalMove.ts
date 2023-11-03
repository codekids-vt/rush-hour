export function isLegalMove(cars1: number[][][], cars2: number[][][]): boolean {
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

        // car2 must not be spread out all cells one space apart max
        if (isHorizontal) {
            const yValues = car2.map(position => position[1]);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
            if (maxY - minY > 1) {
                return false;
            }
        }
        if (isVertical) {
            const xValues = car2.map(position => position[0]);
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            if (maxX - minX > 1) {
                return false;
            }
        }


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

    if (cars1.length !== cars2.length) {
        return false; // Different number of cars means it's definitely an illegal move
    }

    // Create a map of car2's positions for quick lookup
    const cars2PositionsMap = new Map<string, number[][]>();
    cars2.forEach(car => cars2PositionsMap.set(car.map(position => position.join(',')).join(';'), car));

    let movedCar: number[][] | null = null;
    for (const car1 of cars1) {
        const car1Key = car1.map(position => position.join(',')).join(';');
        const correspondingCar2 = cars2PositionsMap.get(car1Key);

        if (!correspondingCar2) {
            if (!movedCar) {
                movedCar = car1;
                continue;
            } else {
                return false; // More than one car moved
            }

        }
        // Remove the found car from the map to ensure no two cars from cars1 map to the same car in cars2
        cars2PositionsMap.delete(car1Key);
    }
    let correspondingCar: number[][] | null = null;
    if (!movedCar) {
        return true; // No car moved, so the move is legal
    }
    // first check if only one car left in map
    if (cars2PositionsMap.size !== 1) {
        return false;
    }
    // get corresponding car as last one in map
    for (const car of cars2PositionsMap.values()) {
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
    for (const car of cars2) {
        if (car === correspondingCar) {
            continue;
        }
        // Check if any of the positions in correspondingCar overlap with any of the positions in car
        const overlap = correspondingCar.some(position1 => car.some(position2 => position1[0] === position2[0] && position1[1] === position2[1]));
        if (overlap) {
            return false;
        }
    }

    return true;
}
