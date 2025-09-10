import { useState , useEffect, useRef} from "react";
import { Graph } from "../graph";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable"; // The default
import { isLegalMove, canPlaceCustom, isLegalCustomMove } from "../../isLegalMove";
import { custom_level, levels } from "./RushHourLevels";
import React from "react";
import { addCustomCar } from "./CustomLevel";

// function to take a cars list and convert it to a id using a hash
function carsToId(cars: Car[]): string {
  // create string based on all cars sorted by x then y always
  return cars
    .map((car) => `${car.x}-${car.y}-${car.vertical ? "v" : "h"}-${car.length}`)
    .sort()
    .join(",");
}

enum gameState {
    attemptingLevel,
    levelComplete,
    settingCustomLevel,
    selectingLevel
}

enum carColors {
  red = "red", 
  green = "green", 
  blue = "blue", 
  orange = "orange", 
  yellow = "yellow",
  purple = "purple",
  pink = "pink",
  teal = "teal",
  cyan = "cyan",
  lime = "lime",
  amber = "amber",
  sky = "sky",
  emerald = "emerald",
}

const initialCars: Car[] = [
  { x: 0, y: 2, vertical: false, length: 2, color: "red" },
  { x: 4, y: 1, vertical: true, length: 3, color: "blue" },
  { x: 2, y: 2, vertical: true, length: 2, color: "green" },
];

const initialStates = { [carsToId(initialCars)]: initialCars };
let previousState : Car[] = initialCars;
let currentLevel : number = 0;

export default function RushHour() {
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [states, setStates] = useState<Record<stateId, Car[]>>(initialStates);
  const [stateTransitions, setStateTransitions] = useState<[stateId, stateId][]>([]);
  const [message, _] = useState<string | null>(null);
  const [transitionsEdges, setTransitionsEdges] = useState<Record<stateIdPair, [stateId, stateId]>>({});
  const [levelDifficulty, setLevelDifficulty] = useState(-1);
  const [currentGameState, setNewGameState] = useState<gameState>(gameState.selectingLevel);
  
  //for adding custom car
  const [smallCustomCarVisible, setSmallCustomCarVisible] = useState(false);
  const [largeCustomCarVisible, setLargeCustomCarVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [customCarPlaced, setCustomCarPlaced] = useState(false);
  const [customCarRotation, setCustomCarRotation] = useState(0);
  const [customCarColor, setCustomCarColor] = useState(carColors.green);
  //Reference to the 6x6 rush-hour grid.
  const gridRef = useRef<HTMLDivElement>(null);
  const [customCarX, customCarY] = handleCustomCarOnGridMovement();

  //Handles hovering mouse over node
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  //reading socket from camera
  const ws = React.useRef<WebSocket | null>(null);
  const [usingCam, setUsingCam] = useState(true);
  const usingCamRef = useRef(usingCam);
  const [camCars, setCamCars] = useState<Car[]>([]);
  const prevCarsRef = useRef<Car[]>(cars);

  function setNewCarsState(newCars: Car[]) {
    // utility to update cars, states, and stateTransitions at the same time
    const lastState = carsToId(prevCarsRef.current);
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
    prevCarsRef.current = newCars;
  }

  /* ---------------------------------
    Left Column Buttons Functionality
  ----------------------------------*/
  function undo_last_move() {
    setNewCarsState(previousState);
  }

  function restart_level() {
    setCars(levels[currentLevel]);

    if (currentGameState === gameState.settingCustomLevel) {
      resetGraph(currentLevel);
      setNewGameState(gameState.attemptingLevel);
    }  
  }

  function resetGraph(levelNum : number) {
    setStates({ [carsToId(levels[levelNum])]: levels[levelNum] });
    setStateTransitions([]);
    setTransitionsEdges({});
  }
    
  function load_new_level(levelNum : number) {
    setCars(levels[levelNum]);
    resetGraph(levelNum);
    previousState = levels[levelNum];
    currentLevel = levelNum;
    setNewGameState(gameState.selectingLevel);

    if (usingCam) {
      console.log("trying to send");
      ws.current?.send(JSON.stringify({
        event: "level_loaded",
        level_rep: levels[levelNum]
      }));
    }
  }

  function numToDifficulty(num : number) {
    if (num == 3) {
      return ["Expert", "red"];
    } else if (num == 2) {
      return ["Advanced", "blue"];
    } else if (num == 1) {
      return ["Intermediate", "yellow"];
    } else if (num == 0) {
      return ["Beginner", "green"];
    } else {
      return ["**NO DIFFICULTY SELECTED**", "red"];
    }
  }

  /*--------------------------------
    Handles making a custom board
  --------------------------------*/
  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      if (!customCarPlaced) {
        setMousePosition({ x: event.clientX, y: event.clientY });
      }
    }

    if (smallCustomCarVisible || largeCustomCarVisible) {
      window.addEventListener("mousemove", handleMouseMove);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
    }

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [smallCustomCarVisible, largeCustomCarVisible]);

  const handleMouseClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.detail > 0 && mousePosition.x >= 225 && mousePosition.y >= 30
      && mousePosition.x <= 610 && mousePosition.y <= 415
    ) { //mouse over grid
      if (smallCustomCarVisible) {      
        setCustomCarPlaced(true);
        if (canPlaceCustom(cars, Math.floor((mousePosition.x - 230) / 63), Math.floor((mousePosition.y - 30) / 64), 2, (customCarRotation / 90) % 2 === 0)) {
          setCars([...cars, ...addCustomCar(2, customCarRotation, mousePosition, customCarColor)]);
        }
        setSmallCustomCarVisible(false);
      } else if (largeCustomCarVisible) {
        setCustomCarPlaced(true);
        if (canPlaceCustom(cars, Math.floor((mousePosition.x - 230) / 63), Math.floor((mousePosition.y - 30) / 64), 3, (customCarRotation / 90) % 2 === 0)) {
          setCars([...cars, ...addCustomCar(3, customCarRotation, mousePosition, customCarColor)]);
        }
        setLargeCustomCarVisible(false);
      }
    }
  };

  function handleAddSmallCar() {
    setSmallCustomCarVisible(true);
    setLargeCustomCarVisible(false);
    setCustomCarPlaced(false);
  }

  function handleAddLargeCar() {
    setSmallCustomCarVisible(false);
    setLargeCustomCarVisible(true);
    setCustomCarPlaced(false);
  }

  function handleCustomCarOnGridMovement() {
    if (!gridRef.current) return [mousePosition.x, mousePosition.y];
  
    const gridRect = gridRef.current.getBoundingClientRect();
    const gridLeft = gridRect.left;
    const gridRight = gridRect.right;
    const gridTop = gridRect.top;
    const gridBottom = gridRect.bottom;

    // More reliable boundary check
    if (
      mousePosition.x >= gridLeft && 
      mousePosition.x <= gridRight &&
      mousePosition.y >= gridTop && 
      mousePosition.y <= gridBottom
    ) {
      const cellSize = gridRect.width / 6;
      const x = Math.floor((mousePosition.x - gridLeft) / cellSize);
      const y = Math.floor((mousePosition.y - gridTop) / cellSize);
      
      // Calculate position adjustments based on car size and orientation
      if (smallCustomCarVisible) {
        if (((customCarRotation / 90) % 2 !== 0)) {
          // Vertical car (length 2)
          return [
            gridLeft + cellSize * x + cellSize * 0.5,  // Center in cell
            gridTop + cellSize * y + cellSize          // Offset by 1 cell height
          ];
        } else {
          // Horizontal car (length 2)
          return [
            gridLeft + cellSize * x + cellSize,        // Offset by 1 cell width
            gridTop + cellSize * y + cellSize * 0.5    // Center in cell
          ];
        }
      } else if (largeCustomCarVisible) {
        if (((customCarRotation / 90) % 2 !== 0)) {
          // Vertical car (length 3)
          return [
            gridLeft + cellSize * x + cellSize * 0.5,  // Center in cell
            gridTop + cellSize * y + cellSize * 1.5    // Offset by 1.5 cell height
          ];
        } else {
          // Horizontal car (length 3)
          return [
            gridLeft + cellSize * x + cellSize * 1.5, // Offset by 1.5 cell width
            gridTop + cellSize * y + cellSize * 0.5    // Center in cell
          ];
        }
      }
    }

    return [mousePosition.x, mousePosition.y];
  }

  function clearCustomLevel() {
    custom_level.length = 0;
    custom_level.push({ x: 0, y: 2, vertical: false, length: 2, color: "red" });
    setCars([{ x: 0, y: 2, vertical: false, length: 2, color: "red" }]);
  }

  /*---------------------------------------------------------------
    Handles all of the web socket stuff with the camera backend
  ---------------------------------------------------------------*/
  useEffect(() => {
    usingCamRef.current = usingCam;
  }, [usingCam]);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/ws');

    console.log("Connected at least")

    ws.current.onmessage = (message: { data: string; }) => {
      let data = JSON.parse(message.data);  
      let cars_arr : Car[]  = data["cars"]; 
      let is_legal_board = data["is_legal_board"]

      //console.log("Level representation: ", data);
      if (is_legal_board) {
        setCamCars(cars_arr);

        if (usingCamRef.current && currentGameState !== gameState.selectingLevel) {
          setNewCarsState(cars_arr);
        }
      }
    };

    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ event: 'connected' }));
    };

    ws.current.onerror = (error: any) => {
      console.error("WebSocket Error:", error);
    };    

    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === "Space") {
        setCustomCarRotation((prevRotation) => prevRotation + 90); // Rotate by 90 degrees
      } /*else if (event.code === "ShiftLeft") { //only use this to request the initial level representation
        console.log("Left Shift Key Pressed - Requesting level rep");
        ws.current?.send(JSON.stringify({ event: "request_level_rep" }));
      }*/
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      ws.current?.close();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  let state = carsToId(cars);
  let grid: string[][] = [];
  for (let i = 0; i < 6; i++) {
    grid.push([]);
    for (let j = 0; j < 6; j++) {
      grid[i].push("white");
    }
  }

  const cellWidth = 63.333;

  /*------------------------------------------------
    Handles cars being dragged on frontend board 
  ------------------------------------------------*/
  function handleDragStop(_: DraggableEvent, data: DraggableData) {
    let oldCar = JSON.parse(data.node.id);
    const x = Math.round(data.x / cellWidth);
    const y = Math.round(data.y / cellWidth);
    let newCar = { ...oldCar, x, y };
    // if the same do nothing
    if (oldCar.x === newCar.x && oldCar.y === newCar.y) {
      return;
    }
    if (currentGameState !== gameState.settingCustomLevel && isLegalMove(cars, oldCar, newCar)) {
      let newCars = cars.map((car) =>
        car.x === oldCar.x && car.y === oldCar.y ? newCar : car,
      );
      setNewCarsState(newCars);

      // Check if the red car is at the exit
      const redCar = newCars[0];
      if (redCar.x === 4 && redCar.y === 2 && !redCar.vertical) {
        setNewGameState(gameState.levelComplete);
      }
    } else if (currentGameState === gameState.settingCustomLevel && isLegalCustomMove(cars, oldCar, newCar)) {
      let newCars = cars.map((car) =>
        car.x === oldCar.x && car.y === oldCar.y ? newCar : car,
      );
      setNewCarsState(newCars);

    } else {
      // trigger a rerender so the draggable goes back to the original position
      setCars([...cars]);
    }
  }

  /***********************
        GUI Component
  ***********************/
  return (
    <div className="flex flex-row flex-1 items-center px-2 gap-4 h-full w-full" onClick={handleMouseClick}>
      {/* column of buttons for options */}
      <div className="flex flex-col items-center rounded-2xl h-full bg-white border-2 border-gray-400">
        <div className="flex flex-col p-4 gap-4">
          <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
            onClick={undo_last_move}
          >
            Undo Last Move
          </button>
          <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
            onClick={restart_level}
          >
            Restart
          </button>
          <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
            onClick={() => {
              setNewGameState(gameState.levelComplete);
              setLevelDifficulty(-1);
            }}
          >
            Select different level
          </button>
          <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
            onClick={() => {
              setNewGameState(gameState.settingCustomLevel);          
              setCars(custom_level);
              resetGraph(0);
            }}
          >
            Set custom board
          </button>
          <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
            onClick={() => setUsingCam((prev) => {
              const updated = !prev;
              console.log("Toggled usingCam to", updated);
              return updated;
            })}
          >
            {usingCam ? "Turn Camera Off" : "Turn Camera On"}
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
          <div ref={gridRef} className="relative grid grid-cols-6 aspect-square w-96 h-96 grid-rows-6 justify-between gap-1 bg-black p-1">
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

            {/* previews the car positions stored in the node being hovered */}
            {hoveredNodeId && states[hoveredNodeId].map((car) => {
              const inset = 4; // Match your existing car inset
              const cellWidth = 63.333; // Match your existing cellWidth
              
              return (
                <div
                  //key={`preview-${idx}`}
                  className={`absolute bg-${car.color}-500 opacity-40 rounded-xl`}
                  style={{
                    width: (car.vertical ? cellWidth : cellWidth * car.length) - inset * 2,
                    height: (car.vertical ? cellWidth * car.length : cellWidth) - inset * 2,
                    top: 6 + car.y * cellWidth,
                    left: 6 + car.x * cellWidth,
                    pointerEvents: 'none'
                  }}
                />
              );
            })}

            {!hoveredNodeId && cars.map((car, i) => {
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
          {currentGameState === gameState.attemptingLevel &&
          <Graph
            state={state}
            states={states}
            stateTransitions={transitionsEdges}
            onNodeHover={setHoveredNodeId}
          />
          }
          {currentGameState === gameState.levelComplete &&
          levelDifficulty == -1 &&
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
            onClick={() => setLevelDifficulty(0)}
          >
            Beginner {/*1*/}
          </button>
          <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-yellow-400"
            onClick={() => setLevelDifficulty(1)}
          >
            Intermediate {/*11*/}
          </button>
          <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-blue-400"
            onClick={() => setLevelDifficulty(2)}
          >
            Advanced {/*21*/}
          </button>
          <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-red-400"
            onClick={() => setLevelDifficulty(3)}
          >
            Expert {/*32*/}
          </button>
          </div>}
          {currentGameState === gameState.levelComplete &&
          levelDifficulty != -1 && <div className="flex flex-col gap-2 p-4">   
          <h1 className="text-3xl text-center my-4">Congrats! Select from the {numToDifficulty(levelDifficulty)[0]} levels</h1>
          
          <div className="grid grid-cols-5 gap-3">
          {[...Array(10).keys()].map((i) => (
        <button
          key={i}
          className={`aspect-square w-16 bg-${numToDifficulty(levelDifficulty)[1]}-400 text-white rounded-lg text-lg font-semibold hover:bg-${numToDifficulty(levelDifficulty)[1]}-500 transition`}
          onClick={() => load_new_level(1 + i + levelDifficulty * 10)}
        >
          {1 + i + levelDifficulty * 10}
        </button>
      ))}
      </div>
          </div>}
          {/* selecting a new level */}
          {currentGameState === gameState.selectingLevel &&
          <div className="flex flex-col gap-2 p-4">   
            {usingCam && <h3 className="text-3xl text-center my-4">This is what your board looks like right now</h3>}
            {/*outside/border*/}
            {usingCam && <div className="relative flex items-center justify-center bg-gray-300 p-2 border-4 border-gray-700 max-w-[408px] min-w-[408px]">
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
                {camCars.map((car, i) => {
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
            </div>}
            <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
            onClick={() => {
              setNewGameState(gameState.attemptingLevel);
              setLevelDifficulty(-1);
            }}
          >
            Start
          </button>
            
          </div>}
          {/* Setting a custom level */}
          {currentGameState === gameState.settingCustomLevel &&
            <div
            className="relative flex flex-col items-center justify-center bg-gray-300 p-2 border-4 border-gray-700 max-w-[408px] min-w-[408px] min-h-[410px]"
            >
            <h5 className="text-3xl text-center my-4">Press space to rotate the car</h5>
            <button
              className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400 mb-5"
              onClick={handleAddSmallCar}
            >
              Add Small Car
            </button>
            <button
              className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400 mb-5"
              onClick={handleAddLargeCar}
            >
              Add Large Car
            </button>
            <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400 mb-5"
            onClick={() => {
              setNewGameState(gameState.attemptingLevel);
              //do some stuff to reset the graph here
            }}
          >
            Start
          </button>

          <button
            className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400 mb-5"
            onClick={() => {
              clearCustomLevel();
            }}
          >
            Clear
          </button>

          {//custom car color selection
          }
          <div className="grid grid-flow-col grid-rows-2 gap-4">
            {Object.values(carColors).filter(color => color !== carColors.red).map((car_color) => 
            (
              <button
                className={`px-4 py-4 bg-${car_color}-500 mb-5`}
                onClick={() => {
                  setCustomCarColor(car_color);
                }}
              >
              </button>
            ))}
          </div>

          {/*actual car being added*/}
            {smallCustomCarVisible && !largeCustomCarVisible && (
              <div
                className={`fixed w-32 h-16 bg-${customCarColor}-500 opacity-75 pointer-events-none`}
                style={{
                  top: `${customCarY}px`,
                  left: `${customCarX}px`,
                  transform: `translate(-50%, -50%) rotate(${customCarRotation}deg)`,
                  zIndex: 1000, // Ensures it stays above other elements
                }}
              />
            )}
            {largeCustomCarVisible && !smallCustomCarVisible && (
              <div
                className={`fixed w-32 h-16 bg-${customCarColor}-500 opacity-75 pointer-events-none`}
                style={{
                  top: `${customCarY}px`,
                  left: `${customCarX}px`,
                  width : `${64 * 3}px`,
                  height: `${64}px`,
                  transform: `translate(-50%, -50%) rotate(${customCarRotation}deg)`,
                  zIndex: 1000,
                }}
              />
            )}
          </div>}
        </div>
      </div>
    </div>
  );
}
