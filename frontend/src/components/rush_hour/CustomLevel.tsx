import { Car } from "../../../../shared/types";

export function addCustomCar(
  length: number,
  carRotation: number,
  mousePosition: { x: number; y: number },
  carColor: string,
) {
  const custom_level: Car[] = [];
  var addedCar = {
    x: Math.floor((mousePosition.x - 230) / 63),
    y: Math.floor((mousePosition.y - 30) / 64),
    vertical: (carRotation / 90) % 2 !== 0,
    length: length,
    color: carColor,
  };
  custom_level.push(addedCar);
  //cars.push(addedCar);

  return custom_level;
}

/**
 * //for adding custom car
   const [smallCustomCarVisible, setSmallCustomCarVisible] = useState(false);
   const [largeCustomCarVisible, setLargeCustomCarVisible] = useState(false);
   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
   const [customCarPlaced, setCustomCarPlaced] = useState(false);
   const [customCarRotation, setCustomCarRotation] = useState(0);
   const [customCarColor, setCustomCarColor] = useState(carColors.green);
    const [customCarX, customCarY] = handleCustomCarOnGridMovement();
 */

/*--------------------------------
        Handles making a custom board
      --------------------------------*/
/*
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
    */
/*
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
            if ((customCarRotation / 90) % 2 !== 0) {
              // Vertical car (length 2)
              return [
                gridLeft + cellSize * x + cellSize * 0.5, // Center in cell
                gridTop + cellSize * y + cellSize, // Offset by 1 cell height
              ];
            } else {
              // Horizontal car (length 2)
              return [
                gridLeft + cellSize * x + cellSize, // Offset by 1 cell width
                gridTop + cellSize * y + cellSize * 0.5, // Center in cell
              ];
            }
          } else if (largeCustomCarVisible) {
            if ((customCarRotation / 90) % 2 !== 0) {
              // Vertical car (length 3)
              return [
                gridLeft + cellSize * x + cellSize * 0.5, // Center in cell
                gridTop + cellSize * y + cellSize * 1.5, // Offset by 1.5 cell height
              ];
            } else {
              // Horizontal car (length 3)
              return [
                gridLeft + cellSize * x + cellSize * 1.5, // Offset by 1.5 cell width
                gridTop + cellSize * y + cellSize * 0.5, // Center in cell
              ];
            }
          }
        }
    
        return [mousePosition.x, mousePosition.y];
      }
    
      function clearCustomLevel() {
        custom_level.length = 0;
        custom_level.push({ x: 0, y: 2, vertical: false, length: 2, color: "red" });
    
        //TODO: Actually figure out how to clear this
        //setCars([{ x: 0, y: 2, vertical: false, length: 2, color: "red" }]);
      }* /

        / *
        useEffect(() => {
            ws.current = new WebSocket("ws://localhost:8000/ws");
        
            console.log("Connected at least");
        
            ws.current.onmessage = (message: { data: string }) => {
              let data = JSON.parse(message.data);
              let cars_arr: Car[] = data["cars"];
              let is_legal_board = data["is_legal_board"];
        
              //console.log("Level representation: ", data);
              if (is_legal_board) {
                setCamCars(cars_arr);
        
                if (
                  usingCamRef.current &&
                  currentGameState !== gameState.selectingLevel
                ) {
                  setNewCarsState(cars_arr);
                }
              }
            };
        
            ws.current.onopen = () => {
              ws.current?.send(JSON.stringify({ event: "connected" }));
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
              }* /
            }
        
            window.addEventListener("keydown", handleKeyDown);
        
            return () => {
              ws.current?.close();
              window.removeEventListener("keydown", handleKeyDown);
            };
          }, []); */
