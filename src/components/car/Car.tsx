type Props = {
  car: Car;
  attemptMove: (car: Car) => void;
};

export default function Car({ car, attemptMove }: Props) {
  // for now a form to move car for testing
  return <div className="bg-red-500 ">Car</div>;
}
