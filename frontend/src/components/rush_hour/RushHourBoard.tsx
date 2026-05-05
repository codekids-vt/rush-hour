import { RushHourLevel, Car, cellWidth } from "../../../../shared/types";
import { useState } from "react";
import { DraggableData, DraggableEvent } from "react-draggable"; // The default
import { checkIsLegalMove, isLegalMove } from "../../isLegalMove";
import React from "react";

export default function RushHourBoard({
  level,
  isHovering,
  canMove,
  levelCompleted,
  setNewCarsState,
  gridRef,
}: {
  level: RushHourLevel;
  isHovering: boolean;
  canMove: boolean;
  levelCompleted: () => void;
  setNewCarsState: (newCars: Car[]) => void;
  gridRef: React.RefObject<HTMLDivElement>;
}) {
  const [cars, setCars] = useState<Car[]>(level.startingPositions);

  const rows = 6;
  const cols = 6;

  let squaresWithCars: (Car | null)[][] = Array.from({ length: rows }).map(
    (_) => Array.from({ length: cols }).map((_) => null),
  );
  cars.map((c) => {
    squaresWithCars[c.y][c.x] = c;

    Array.from({ length: c.length }).map((_, i: number) => {
      if (c.vertical) {
        squaresWithCars[c.y + i][c.x] = c;
      } else {
        squaresWithCars[c.y][c.x + i] = c;
      }
    });
  });

  /*------------------------------------------------
    Handles cars being dragged on frontend board 
  ------------------------------------------------*/
  function handleDragStop(_: DraggableEvent, data: DraggableData) {
    let oldCar = JSON.parse(data.node.id);
    const x = Math.round(data.x / cellWidth);
    const y = Math.round(data.y / cellWidth);
    let newCar = { ...oldCar, x, y };

    console.log(canMove, isHovering);
    console.log(oldCar);
    console.log(newCar);

    // if the same do nothing
    if (oldCar.x === newCar.x && oldCar.y === newCar.y) {
      return;
    }
    if (canMove && isLegalMove(cars, oldCar, newCar)) {
      let newCars = cars.map((car) =>
        car.x === oldCar.x && car.y === oldCar.y ? newCar : car,
      );
      setNewCarsState(newCars);

      // Check if the red car is at the exit
      const redCar = newCars[0];
      if (redCar.x === 4 && redCar.y === 2 && !redCar.vertical) {
        levelCompleted();
      }
    } else {
      /*
    else if (
      currentGameState === gameState.settingCustomLevel &&
      isLegalCustomMove(cars, oldCar, newCar)
    ) {
      let newCars = cars.map((car) =>
        car.x === oldCar.x && car.y === oldCar.y ? newCar : car,
      );
      setNewCarsState(newCars);
    }
    */
      // trigger a rerender so the draggable goes back to the original position
      setCars([...cars]);
    }
  }

  return (
    <div
      ref={gridRef}
      className="relative border-2  h-full w-full overflow-hidden flex flex-col min-h-0"
    >
      <BoardGrid
        rows={6}
        cols={6}
        carsBoard={squaresWithCars}
        handleCarMove={function (car: Car, newPosition): void {
          if (!canMove) {
            console.log(`Can't move right now`);
            return;
          }
          const newCar = { ...car, x: newPosition.x, y: newPosition.y };
          const isLegal = checkIsLegalMove(cars, newCar);
          console.log(
            `Move from (${car.x}, ${car.y}) to (${
              newPosition.x
            }, ${newPosition.y}) is ${isLegal ? "" : "il"}legal`,
          );

          if (isLegal) {
            //check if level is complete
            if (newCar.carID == 5 && newCar.x >= 4) {
              levelCompleted();
            }

            const newCars = cars.map((c: Car) => {
              if (c.carID == car.carID) {
                return newCar;
              }
              return c;
            });

            setCars(newCars);
            setNewCarsState(newCars);
          }
        }}
      />

      {/* previews the car positions stored in the node being hovered */}
      {isHovering &&
        cars.map((car) => {
          const inset = 4; // Match your existing car inset
          const cellWidth = 63.333; // Match your existing cellWidth

          return (
            <div
              //key={`preview-${idx}`}
              className={`absolute bg-${car.color}-500 opacity-40 rounded-xl`}
              style={{
                width:
                  (car.vertical ? cellWidth : cellWidth * car.length) -
                  inset * 2,
                height:
                  (car.vertical ? cellWidth * car.length : cellWidth) -
                  inset * 2,
                top: 6 + car.y * cellWidth,
                left: 6 + car.x * cellWidth,
                pointerEvents: "none",
              }}
            />
          );
        })}

      {/* Showing cars on regular board */}
      {!isHovering &&
        cars.map((car, i) => <CarUI key={i} car={car} cellWidth={cellWidth} />)}
    </div>
  );
}

type BoardSquareProps = {
  row: number;
  col: number;
  isActive: boolean;
  onActivate: (row: number, col: number) => void;
  isPressed: boolean;
  onPressChange: (newState: boolean, car?: Car) => void;
  car: Car | null;
  isSelectedCar: boolean;
};

type BoardGridProps = {
  rows: number;
  cols: number;
  carsBoard: (Car | null)[][];
  handleCarMove: (car: Car, newPosition: { x: number; y: number }) => void;
};

export function BoardGrid({
  rows,
  cols,
  carsBoard,
  handleCarMove,
}: BoardGridProps) {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);

  const [activeCell, setActiveCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  return (
    <div
      className="grid w-96 h-96"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
      onMouseLeave={() => {
        setIsMouseDown(false);
        setSelectedCar(null);
        setOffset(null);
      }}
    >
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <BoardSquare
            key={`${r}-${c}`}
            row={r}
            col={c}
            isActive={activeCell?.row === r && activeCell?.col === c}
            onActivate={(row, col) => setActiveCell({ row, col })}
            isPressed={isMouseDown}
            onPressChange={(newState: boolean, car?: Car) => {
              setIsMouseDown(newState);

              //mouse pressed, select new car

              if (newState) {
                console.log(r, c);
                console.log(car);
                if (car) {
                  setSelectedCar(car);
                  const newOffset = { x: c - car.x, y: r - car.y };
                  setOffset(newOffset);

                  console.log(newOffset);
                }
              }

              //car stopped/dragged to new position
              if (!newState) {
                if (selectedCar) {
                  handleCarMove(selectedCar, {
                    x: c - (offset?.x ?? 0),
                    y: r - (offset?.y ?? 0),
                  });
                }

                setSelectedCar(null);
                setOffset(null);
              }
            }}
            car={carsBoard[r][c]}
            isSelectedCar={carsBoard[r][c]?.carID == selectedCar?.carID}
          />
        )),
      )}
    </div>
  );
}

export function BoardSquare({
  row,
  col,
  isActive,
  onActivate,
  isPressed,
  onPressChange,
  car,
  isSelectedCar,
}: BoardSquareProps) {
  return (
    <div
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      className={`
        w-16 h-16
         
        border border-slate-700 
        transition-colors duration-150
        ${
          isActive
            ? isPressed
              ? "bg-green-500"
              : "bg-blue-400"
            : car && isSelectedCar
              ? "bg-white"
              : "bg-slate-900"
        }
        `}
      onMouseEnter={() => onActivate(row, col)}
      onMouseDown={() => onPressChange(true, car ?? undefined)}
      onMouseUp={() => onPressChange(false, car ?? undefined)}
    />
  );
}

export function CarUI({ car, cellWidth }: { car: Car; cellWidth: number }) {
  const inset = 4;

  const carWidth =
    (car.vertical ? cellWidth : cellWidth * car.length) - inset * 2;

  const carHeight =
    (car.vertical ? cellWidth * car.length : cellWidth) - inset * 2;

  return (
    <div
      className="absolute pointer-events-none rounded-xl"
      style={{
        width: carWidth,
        height: carHeight,
        top: car.y * cellWidth + inset + 2,
        left: car.x * cellWidth + inset + 2,
        backgroundColor: car.color,
      }}
    />
  );
}
/*
    <Draggable
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
      onStop={(e, data) => {
        handleDragStop(e, data);
      }}
    >
      <div
        className={`absolute handle rounded-xl pointer-events-none`}
        style={{
          width: carWidth,
          height: carHeight,
          top: 2 + inset,
          left: 2 + inset,
          backgroundColor: car.color,
        }}
        id={JSON.stringify(car)}
      />
    </Draggable>
  );
}*/
