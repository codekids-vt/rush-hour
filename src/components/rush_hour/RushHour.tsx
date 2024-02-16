import React, { useState } from "react";
import { Grid } from "../grid";
import { Graph } from "../graph";
import { Car as CarComponent } from "../car";

function carsToGrid(cars: Car[]): string[][] {
  let grid: string[][] = [];

  for (let i = 0; i < 6; i++) {
    grid.push([]);
    for (let j = 0; j < 6; j++) {
      grid[i].push("white");
    }
  }

  for (let car of cars) {
    if (car.vertical) {
      for (let i = 0; i < car.length; i++) {
        grid[car.x][car.y + i] = car.color;
      }
    } else {
      for (let i = 0; i < car.length; i++) {
        grid[car.x + i][car.y] = car.color;
      }
    }
  }

  return grid;
}

// function to take a cars list and convert it to a id using a hash
function carsToId(cars: Car[]): string {
  let id = 0;
  for (let car in cars) {
    // convert json of car to a number through converting it to base16
    let carString = JSON.stringify(cars[car]);
    let bytes = [];
    for (let i = 0; i < carString.length; ++i) {
      bytes.push(carString.charCodeAt(i));
    }
    let carId = parseInt(bytes.join(""), 16);
    // add the carId to the id
    id += carId;
  }
  return id.toString();
}

const initialCars: Car[] = [
  { x: 4, y: 4, vertical: true, length: 2, color: "red" },
  { x: 5, y: 3, vertical: true, length: 2, color: "blue" },
  { x: 2, y: 2, vertical: true, length: 2, color: "green" },
];

const initialStates = { [carsToId(initialCars)]: initialCars };

export default function RushHour() {
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [states, setStates] = useState<Record<stateId, Car[]>>(initialStates);
  const [stateTransitions, setStateTransitions] = useState<
    [stateId, stateId][]
  >([]);
  const [message, _] = React.useState<string | null>(null);

  function setNewCarsState(newCars: Car[]) {
    // utility to update cars, states, and stateTransitions at the same time
    setStates((states) => {
      const id = carsToId(newCars);
      return { ...states, [id]: newCars };
    });
    setStateTransitions((transitions) => {
      const lastState = carsToId(cars);
      return [...transitions, [lastState, carsToId(newCars)]];
    });
    setCars(newCars);
  }

  let state = carsToId(cars);
  let grid = carsToGrid(cars);

  if (false) {
    setNewCarsState(cars);
  }

  function attemptMove(car: Car) {
    return true;
  }

  return (
    <div className="flex flex-row flex-1 items-center px-2 gap-4 h-full w-full">
      {/* column of buttons for options */}
      <div className="flex flex-col items-center rounded-2xl h-full bg-white border-2 border-gray-400">
        <div className="flex flex-col p-4 gap-4">
          <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
            onClick={() => {}}
          >
            Undo
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 h-full w-full">
        <div className="grid grid-cols-6 aspect-square grid-rows-6 justify-between gap-1 bg-black p-1">
          {grid.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                // to handle white, we need to add a bg-white class
                className={`bg-white aspect-square`}
              />
            )),
          )}

          {cars.map((car, i) => (
            <CarComponent key={i} car={car} attemptMove={attemptMove} />
          ))}
        </div>
        <div className="flex flex-col items-center bg-white">
          <div className="text-2xl text-center h-12">{message}</div>

          <Graph
            state={state}
            states={states}
            stateTransitions={stateTransitions}
          />
        </div>
      </div>
    </div>
  );
}
