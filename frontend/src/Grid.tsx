
export interface IGridProps {
  grid: string[][];
}

export function Grid(props: IGridProps) {
  // tailwind 6x6 grid
  // each of the items are either 'red' or 'blue' or 'white'
  return (
    <div className="grid grid-cols-6 grid-rows-6 gap-1 bg-black p-1">
      {props.grid.map((row, i) => (
        row.map((cell, j) => (
          <div
            key={`${i}-${j}`}
            // to handle white, we need to add a bg-white class
            className={`bg-${cell}-500 bg-${cell}`}
          />
        ))
      ))}
    </div>

  );
}
