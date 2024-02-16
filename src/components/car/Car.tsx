type Props = {
  car: Car;
  attemptMove: (car: Car) => void;
};

export default function Car({ car, attemptMove }: Props) {
  // for now a form to move car for testing
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        let newCar = { ...car };
        attemptMove(newCar);
      }}
    >
      <input type="number" name="x" />
      <input type="number" name="y" />
      {/* actually call the fn */}

      <button type="submit">Move</button>
    </form>
  );
}
