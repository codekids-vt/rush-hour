import { useState } from "react";
import { Graph } from "../graph";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable"; // The default
import { isLegalMove } from "../../isLegalMove";
import { levels } from "./RushHourLevels";

// function to take a cars list and convert it to a id using a hash
function carsToId(cars: Car[]): string {
  // create string based on all cars sorted by x then y always
  return cars
    .map((car) => `${car.x}-${car.y}-${car.vertical ? "v" : "h"}-${car.length}`)
    .sort()
    .join(",");
}

const initialCars: Car[] = [
  { x: 0, y: 2, vertical: false, length: 2, color: "red" },
  { x: 4, y: 1, vertical: true, length: 3, color: "blue" },
  { x: 2, y: 2, vertical: true, length: 2, color: "green" },
];

const initialStates = { [carsToId(initialCars)]: initialCars };
let previousState : Car[] = initialCars;
let levelComplete : boolean = false;
let selecting_level : boolean = false;
let currentLevel : number = 0;

export default function RushHour() {
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [states, setStates] = useState<Record<stateId, Car[]>>(initialStates);
  const [stateTransitions, setStateTransitions] = useState<
    [stateId, stateId][]
  >([]);
  const [message, _] = useState<string | null>(null);
  const [transitionsEdges, setTransitionsEdges] = useState<
    Record<stateIdPair, [stateId, stateId]>
  >({});

  function setNewCarsState(newCars: Car[]) {
    // utility to update cars, states, and stateTransitions at the same time
    const lastState = carsToId(cars);
    const newState = carsToId(newCars);
    previousState = cars;
    setStates((states) => {
      return { ...states, [newState]: newCars };
    });
    setStateTransitions((transitions) => {
      return [...transitions, [lastState, newState]];
    });
    setTransitionsEdges((edges) => {
      return { ...edges, [`${lastState}-${newState}`]: [lastState, newState] };
    });
    setCars(newCars);
  }

  //currently only undoes last move
  function undo_last_move() {
    //console.log("Last State:", carsToId(previousState));
    setNewCarsState(previousState);
  }

  /* 
  restarting the level
  */
  function restart_level() {
    //console.log("Current level is: " + currentLevel);
    setCars(levels[currentLevel]);
  }

  function resetGraph(levelNum : number) {
    // Reset the states, transitions, and edges
    setStates({ [carsToId(levels[levelNum])]: levels[levelNum] });
    setStateTransitions([]);
    setTransitionsEdges({});
  }
    
  function load_new_level(levelNum : number) {
    //need to clear graph and stuff
    levelComplete = false;
    setCars(levels[levelNum]);
    resetGraph(levelNum);
    previousState = levels[levelNum];
    currentLevel = levelNum;
    selecting_level = true;
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

  function handleDragStop(_: DraggableEvent, data: DraggableData) {
    let oldCar = JSON.parse(data.node.id);
    const x = Math.round(data.x / cellWidth);
    const y = Math.round(data.y / cellWidth);
    let newCar = { ...oldCar, x, y };
    // if the same do nothing
    if (oldCar.x === newCar.x && oldCar.y === newCar.y) {
      return;
    }
    if (isLegalMove(cars, oldCar, newCar)) {
      let newCars = cars.map((car) =>
        car.x === oldCar.x && car.y === oldCar.y ? newCar : car,
      );
      setNewCarsState(newCars);

      // Check if the red car is at the exit
      const redCar = newCars[0];
      if (redCar.x === 4 && redCar.y === 2 && !redCar.vertical) {
        levelComplete = true;
        selecting_level = false;
        //console.log("Congratulations! You've reached the exit!");
      }
    } else {
      // trigger a rerender so the draggable goes back to the original position
      setCars([...cars]);
    }
  }

  console.log("cars", cars);
  console.log("state", state);
  console.log("states", states);
  console.log("stateTransitions", stateTransitions);

  return (
    <div className="flex flex-row flex-1 items-center px-2 gap-4 h-full w-full">
      {/* column of buttons for options */}
      <div className="flex flex-col items-center rounded-2xl h-full bg-white border-2 border-gray-400">
        <div className="flex flex-col p-4 gap-4">
          <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
            onClick={undo_last_move}
          >
            Undo
          </button>
          <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
            onClick={restart_level}
          >
            Restart
          </button>
        </div>
      </div>
      {/* grid holding game and graph*/}
      <div className="grid grid-cols-2 h-full w-full">
        {/*outside/border*/}
        <div className="relative flex items-center justify-center bg-gray-300 p-2 border-4 border-gray-700 max-w-[408px] min-w-[408px] max-h-[408px] min-h-[408px]">
          {/*right border*/}
          <div className="absolute top-[33.65%] right-0 w-[24px] h-[16.66%] bg-white border-4 border-gray-700 border-r-0"></div>
          {/*grid/board*/}
          <div className="relative grid grid-cols-6 aspect-square w-96 h-96 grid-rows-6 justify-between gap-1 bg-black p-1">
            {grid.map((row, i) =>
              row.map((_, j) => {
                const isExitGap = j === 5 && i === 2 ? "border-r-transparent" : "";

                return (
                <div key={`${i}-${j}`} className={`bg-white aspect-square ${isExitGap}`}>
                  {/* {j},{i} */}
                </div>
              );
              })
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
        </div>
         
        <div className="flex flex-col items-center bg-white">
          <div className="text-2xl text-center h-12">{message}</div>
          {!levelComplete && !selecting_level && 
          <Graph
            state={state}
            states={states}
            stateTransitions={transitionsEdges}
          />
          }
          {levelComplete && !selecting_level &&
          <div className="flex flex-col gap-2 p-4">   
            <h1 className="text-3xl text-center my-4">Congrats! You have completed the level</h1>
            <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
            onClick={() => load_new_level(0)}
          >
            Introdcution
          </button>
            <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
            onClick={() => load_new_level(1)}
          >
            Beginner
          </button>
          <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-yellow-400"
            onClick={() => load_new_level(2)}
          >
            Intermediate 
          </button>
          <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-blue-400"
            onClick={() => load_new_level(3)}
          >
            Advanced
          </button>
          <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-red-400"
            onClick={() => load_new_level(4)}
          >
            Expert {/*32*/}
          </button>
          </div>}
          {/* make this actually read what is happening from the sensors once we get that working 
          graph automatically reappears after first move once start button is pressed, once working 
          change to once the expected board and matches up with the actual board*/}
          {selecting_level && 
          <div className="flex flex-col gap-2 p-4">   
            <h1 className="text-3xl text-center my-4">This is what your board looks like right now</h1>
            {/*outside/border*/}
            <div className="relative flex items-center justify-center bg-gray-300 p-2 border-4 border-gray-700 max-w-[408px] min-w-[408px]">
              {/*right border*/}
              <div className="absolute top-[33.65%] right-0 w-[24px] h-[16.66%] bg-white border-4 border-gray-700 border-r-0"></div>
              {/*grid/board*/}
              <div className="relative grid grid-cols-6 aspect-square w-96 h-96 grid-rows-6 justify-between gap-1 bg-black p-1">
                {grid.map((row, i) =>
                  row.map((_, j) => {
                    const isExitGap = j === 5 && i === 2 ? "border-r-transparent" : "";

                    return (
                    <div key={`${i}-${j}`} className={`bg-white aspect-square ${isExitGap}`}>
                      {/* {j},{i} */}
                    </div>
                  );
                  })
                )}
              </div>
            </div>
            <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
            onClick={() => {
              levelComplete = false;
              selecting_level = false;
            }}
          >
            Start
          </button>
            
          </div>}
        </div>
      </div>
    </div>
  );
}
