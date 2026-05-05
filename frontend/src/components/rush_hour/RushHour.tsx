import { useState, useEffect, useRef } from "react";
import { Graph } from "../graph";
import React from "react";
import {
  Car,
  stateId,
  stateIdPair,
  gameState,
  RushHourLevel,
  AuthState,
} from "../../../../shared/types";
import SideBar from "./SideBar";
import SelectNewLevelUI from "./SelectNewLevel";
import { getGameLevels, markLevelComplete } from "./apiCalls";
import RushHourBoard from "./RushHourBoard";

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
let previousState: Car[] = initialCars;
let currentLevelIndex: number = 0;

export function RushHour(rh: AuthState) {
  const usingMockUser: boolean = rh.user != null;
  const [states, setStates] = useState<Record<stateId, Car[]>>({ "": [] });
  const [stateTransitions, setStateTransitions] = useState<
    [stateId, stateId][]
  >([]);
  const [transitionsEdges, setTransitionsEdges] = useState<
    Record<stateIdPair, [stateId, stateId]>
  >({});
  const [currentGameState, setNewGameState] = useState<gameState>(
    gameState.selectingLevel,
  );

  //Reference to the 6x6 rush-hour grid.
  const gridRef = useRef<HTMLDivElement>(null);
  const [restartingLevel, setRestartingLevel] = useState(false);

  //Handles hovering mouse over node
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  //reading socket from camera
  const ws = React.useRef<WebSocket | null>(null);
  const [usingCam, setUsingCam] = useState(false);
  const usingCamRef = useRef(usingCam);
  //const [camCars, setCamCars] = useState<Car[]>([]);
  const prevCarsRef = useRef<Car[]>([]); //cars);

  const [allGameLevels, setAllGameLevels] = useState<RushHourLevel[]>([]);
  const [state, setState] = useState<string>(
    carsToId(allGameLevels[currentLevelIndex]?.startingPositions ?? []),
  );

  /**
   * Updages graph after move
   *
   * @param newCars new cars position of node being added
   */
  function setNewCarsState(newCars: Car[]) {
    // utility to update cars, states, and stateTransitions at the same time
    const lastState = carsToId(prevCarsRef.current);
    const newState = carsToId(newCars);
    setState(newState);
    setStates((states) => {
      return { ...states, [newState]: newCars };
    });
    setStateTransitions((transitions) => {
      return [...transitions, [lastState, newState]];
    });
    setTransitionsEdges((edges) => {
      return { ...edges, [`${lastState}-${newState}`]: [lastState, newState] };
    });
    //setCars(newCars);
    prevCarsRef.current = newCars;
  }

  /* ---------------------------------
    Left Column Buttons Functionality
  ----------------------------------*/
  function undoLastMove() {
    setNewCarsState(previousState);
  }

  function restartLevel() {
    setRestartingLevel(true);

    //prevCarsRef.current = allGameLevels[currentLevelIndex].startingPositions;
    //setState(carsToId(allGameLevels[currentLevelIndex].startingPositions));
    //previousState = allGameLevels[currentLevelIndex].startingPositions;
    resetGraph(currentLevelIndex);
  }

  function resetGraph(levelIndex: number) {
    //console.log("Graph being reset");
    const newKey = carsToId(allGameLevels[levelIndex].startingPositions);

    setStates({
      [newKey]: allGameLevels[levelIndex].startingPositions,
    });
    setState(newKey);
    setStateTransitions([]);
    setTransitionsEdges({});
  }

  function loadNewLevel(levelNum: number) {
    //setCars(allGameLevels[levelNum].startingPositions);
    const levelIndex = levelNum - 1;
    resetGraph(levelIndex);

    prevCarsRef.current = allGameLevels[levelIndex].startingPositions;
    previousState = allGameLevels[levelIndex].startingPositions;
    currentLevelIndex = levelIndex;
    setNewGameState(gameState.settingLevelUp);

    if (usingCam) {
      console.log("trying to send");
      ws.current?.send(
        JSON.stringify({
          event: "level_loaded",
          level_rep: allGameLevels[levelNum],
        }),
      );
    }
  }

  function numToDifficulty(num: number) {
    if (num == 3) {
      return ["Expert", "#ef4444"];
    } else if (num == 2) {
      return ["Advanced", "#3b82f6"];
    } else if (num == 1) {
      return ["Intermediate", "#eab308"];
    } else if (num == 0) {
      return ["Beginner", "#22c55e"];
    } else {
      return ["**NO DIFFICULTY SELECTED**", "#ff0000"];
    }
  }

  useEffect(() => {
    (async () => {
      const res = await getGameLevels(rh?.token ?? "");
      setAllGameLevels(res);
    })();
  }, [usingMockUser]);

  useEffect(() => {
    if (!restartingLevel) {
      console.log("Level should restart", restartingLevel);
      setRestartingLevel(false);
    }
  }, [restartingLevel]);
  /*
  useEffect(() => {
    console.log(allGameLevels[currentLevelIndex]?.startingPositions ?? []);
  }, [currentGameState]);*/

  /*---------------------------------------------------------------
    Handles all of the web socket stuff with the camera backend
  ---------------------------------------------------------------*/
  useEffect(() => {
    usingCamRef.current = usingCam;
  }, [usingCam]);

  let grid: string[][] = [];
  for (let i = 0; i < 6; i++) {
    grid.push([]);
    for (let j = 0; j < 6; j++) {
      grid[i].push("white");
    }
  }

  /***********************
        GUI Component
  ***********************/
  return (
    <div
      className="flex flex-row flex-1 items-center px-2 gap-4 h-screen w-full border-2  box-border"
      //onClick={handleMouseClick}
    >
      <SideBar
        currentGameState={currentGameState}
        undoLastMove={undoLastMove}
        restartLevel={restartLevel}
        selectNewLevel={() => {
          setNewGameState(gameState.selectingLevel);
        }}
        createCustomLevel={() => {
          setNewGameState(gameState.settingCustomLevel);

          //setCars(custom_level);

          resetGraph(0);
        }}
        usingCam={usingCam}
        setUsingCam={() =>
          setUsingCam((prev) => {
            const updated = !prev;
            console.log("Toggled usingCam to", updated);
            return updated;
          })
        }
      />

      {/* grid holding game and graph*/}
      <div className="grid grid-cols-2 h-full w-full border-2 overflow-hidden">
        {/* Selecting level UI */}
        {currentGameState === gameState.selectingLevel && (
          <div className="col-span-2 h-full flex flex-col min-h-0">
            <SelectNewLevelUI
              gameLevels={allGameLevels}
              loadNewLevel={(levelNumber: number) => {
                loadNewLevel(levelNumber);
              }}
              numToDifficulty={(difficulty: number) =>
                numToDifficulty(difficulty)
              }
            />
          </div>
        )}
        {/* Playing level */}
        {currentGameState !== gameState.selectingLevel && (
          <>
            <div className="flex flex-col bg-white border-2 box-border h-full w-full min-h-0">
              <RushHourBoard
                level={
                  restartingLevel
                    ? {
                        levelID: -1,
                        levelName: "Loading",
                        startingPositions:
                          allGameLevels[currentLevelIndex].startingPositions,
                        isCustom: false,
                      }
                    : hoveredNodeId == null
                      ? allGameLevels[currentLevelIndex]
                      : {
                          ...allGameLevels[currentLevelIndex],
                          startingPositions: states[hoveredNodeId],
                        }
                }
                isHovering={hoveredNodeId != null}
                canMove={currentGameState === gameState.attemptingLevel}
                levelCompleted={function (): void {
                  setNewGameState(gameState.levelComplete);
                }}
                setNewCarsState={(newCars: Car[]) => {
                  setNewCarsState(newCars);
                }}
                gridRef={gridRef}
              />
            </div>
            {/* Right side */}
            <div className="flex flex-col items-center bg-white border-2 border-green-500 box-border">
              {/* Graph */}
              {currentGameState === gameState.attemptingLevel && (
                <Graph
                  state={state}
                  states={states}
                  stateTransitions={transitionsEdges}
                  onNodeHover={(newNodeID) => {
                    setHoveredNodeId(newNodeID);
                  }}
                />
              )}
              {/* Setting level up */}
              {currentGameState === gameState.settingLevelUp && (
                <div className="flex flex-col gap-2 p-4">
                  {usingCam && (
                    <h3 className="text-3xl text-center my-4">
                      This is what your board looks like right now
                    </h3>
                  )}
                  {/*outside/border*/}
                  {usingCam && (
                    <RushHourBoard
                      level={allGameLevels[currentLevelIndex]} //TODO: Change back to camCars
                      isHovering={false}
                      canMove={false}
                      levelCompleted={() => {}}
                      setNewCarsState={() => {}}
                      gridRef={gridRef}
                    />
                  )}
                  {/*camCars.map((car, i) => {
                    const inset = 4;
                    const carWidth =
                      (car.vertical
                        ? cellWidth
                        : cellWidth * car.length) -
                      inset * 2;
                    const carHeight =
                      (car.vertical
                        ? cellWidth * car.length
                        : cellWidth) -
                      inset * 2;

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
                        position={{
                          x: car.x * cellWidth,
                          y: car.y * cellWidth,
                        }}
                        bounds={{
                          left: 0,
                          top: 0,
                          right: cellWidth * (6 - carUnitWidth),
                          bottom: cellWidth * (6 - carUnitHeight),
                        }}
                        onStop={() => {
                          throw new Error("this isnt implemented yet");
                        }} //handleDragStop}
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
                  })*/}

                  <button
                    className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
                    onClick={() => {
                      setNewGameState(gameState.attemptingLevel);
                    }}
                  >
                    Start
                  </button>
                </div>
              )}

              {/* level complete */}
              {currentGameState === gameState.levelComplete && (
                <div className="flex flex-col gap-2 p-4">
                  <h3 className="text-3xl text-center my-4">
                    {`Congratulations you completed level ${allGameLevels[currentLevelIndex].levelName}`}
                  </h3>

                  <button
                    className="px-4 py-2 bg-primary-green rounded-full text-white bg-green-400"
                    onClick={async () => {
                      setNewGameState(gameState.selectingLevel);

                      await markLevelComplete(
                        rh.token ?? "",
                        allGameLevels[currentLevelIndex],
                      );
                      setAllGameLevels((prev) => {
                        const updated = [...prev];
                        updated[currentLevelIndex].isComplete = true;
                        return updated;
                      });
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
