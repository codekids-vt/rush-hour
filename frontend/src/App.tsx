import React from "react";
import { Graph } from "./Graph";
import { Grid } from "./Grid";

function carsToGrid(cars: number[][][]): string[][] {
  let grid: string[][] = []

  for (let i = 0; i < 6; i++) {
    grid.push([])
    for (let j = 0; j < 6; j++) {
      grid[i].push('white')
    }
  }

  if (cars.length === 0) {
    return grid
  }

  for (let car of cars) {
    for (let coord of car) {
      grid[coord[0]][coord[1]] = 'red'
    }
  }

  return grid
}

// function to take a cars list and convert it to a id using a hash
function carsToId(cars: number[][][]): number {
  let id = 0;

  for (let i = 0; i < cars.length; i++) {
    let car = cars[i];
    for (let coord of car) {
      // Convert x and y coordinates into a unique single number
      let singleValue = coord[0] * 100 + coord[1];

      // Use powers of a large prime number to make sure each car has a unique influence on the hash
      id += singleValue * Math.pow(9973, i);
    }
  }

  return id;
}

function App() {
  const ws = React.useRef<WebSocket | null>(null);
  const cars = React.useRef<number[][][]>([]);
  // const [states, setStates] = React.useState<number[]>([])
  const states = React.useRef<number[]>([])
  // const [stateTransitions, setStateTransitions] = React.useState<[number, number][]>([])
  const stateTransitions = React.useRef<[number, number][]>([])
  const [render, setRender] = React.useState<boolean>(false)

  React.useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/ws');

    ws.current.onmessage = (message) => {
      let data = JSON.parse(message.data);
      let oldCarsId = carsToId(cars.current);
      let newCarsId = carsToId(data.cars);

      // Update states
      // if it is a new state
      if (!states.current.includes(newCarsId)) {
        // check if a new transition is needed
        states.current.push(newCarsId)
        // very first time, we don't have a old state
        if (oldCarsId !== 0) {
          stateTransitions.current.push([oldCarsId, newCarsId])
        }
      } else if (oldCarsId !== newCarsId) {
        // if it is not a new state, check if a new transition is needed by checking if we have been here before
        if (!states.current.includes(oldCarsId)) {
          states.current.push(oldCarsId)
        }
      }

      cars.current = data.cars;

      setRender(render => !render);
    };

    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ event: 'connected' }));
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  console.log(cars.current)

  let state = carsToId(cars.current)
  let grid = carsToGrid(cars.current)


  return (
    // tailwind that splits the screen into 2 columns
    <div>
      <div className="grid grid-cols-2 min-h-screen">
        <Grid grid={grid} />
        <Graph state={state} states={states.current} stateTransitions={stateTransitions.current} />
      </div >
    </div>
  );
}

export default App;