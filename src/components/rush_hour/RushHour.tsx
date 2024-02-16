import React, { useState } from "react";
import { Graph } from "../graph";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable"; // The default
import { isLegalMove } from "../../isLegalMove";

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
  { x: 0, y: 2, vertical: true, length: 3, color: "red" },
  { x: 4, y: 3, vertical: false, length: 2, color: "blue" },
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

  let grid: string[][] = [];
  for (let i = 0; i < 6; i++) {
    grid.push([]);
    for (let j = 0; j < 6; j++) {
      grid[i].push("white");
    }
  }

  const cellWidth = 63.333;

  function handleDragStop(e: DraggableEvent, data: DraggableData) {
    // console.log(data);
    let oldCar = JSON.parse(data.node.id);
    // console.log(oldCar);
    const x = Math.round(data.x / cellWidth);
    const y = Math.round(data.y / cellWidth);
    let newCar = { ...oldCar, x, y };
    // console.log(newCar);
    // console.log("legal move", isLegalMove(cars, oldCar, newCar));
    if (isLegalMove(cars, oldCar, newCar)) {
      let newCars = cars.map((car) =>
        car.x === oldCar.x && car.y === oldCar.y ? newCar : car,
      );
      setNewCarsState(newCars);
    } else {
      // trigger a rerender so the draggable goes back to the original position
      setCars([...cars]);
    }
  }

  console.log("cars in state", cars);

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
        <div className="relative grid grid-cols-6 aspect-square w-96 h-96 grid-rows-6 justify-between gap-1 bg-black p-1">
          {grid.map((row, i) =>
            row.map((_, j) => (
              <div key={`${i}-${j}`} className={`bg-white aspect-square`}>
                {/* {j},{i} */}
              </div>
            )),
          )}
          {cars.map((car, i) => {
            const inset = 4;
            const carWidth =
              (car.vertical ? cellWidth : cellWidth * car.length) - inset * 2;
            const carHeight =
              (car.vertical ? cellWidth * car.length : cellWidth) - inset * 2;

            const carUnitWidth = car.vertical ? 1 : car.length;
            const carUnitHeight = car.vertical ? car.length : 1;

            // console.log(car, carUnitWidth, carUnitHeight);

            return (
              <Draggable
                key={i}
                axis={car.vertical ? "y" : "x"}
                handle=".handle"
                grid={[cellWidth, cellWidth]}
                scale={1}
                position={{ x: car.x * cellWidth, y: car.y * cellWidth }}
                bounds={{
                  left: 0,
                  top: 0,
                  right: cellWidth * (6 - carUnitWidth),
                  bottom: cellWidth * (6 - carUnitHeight),
                }}
                onStop={handleDragStop}
              >
                <div
                  className={`absolute bg-${car.color}-500 handle rounded-xl`}
                  style={{
                    width: carWidth,
                    height: carHeight,
                    top: 2 + inset,
                    left: 2 + inset,
                  }}
                  id={JSON.stringify(car)}
                ></div>
              </Draggable>
            );
          })}
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
