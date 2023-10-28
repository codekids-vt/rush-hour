# Rush Hour Tactile Game 

## Features
- Helps the person place the board in steps
- Hint feature on next move
- Visualization of the graph visualization during play
  - Either show the entire graph or discover it as you're playing
    - New discovery ui change on a new discovery
  - If you hover over a node it would show that move on the board
  - Color them differently if they are dead ends
  - maybe make the map nodes have images like, dead end sign or house, like a map

## Hardware

Options 
- camera
- physical sensors

Options to differentiate cars
- different colors (requires camera)
- use space between cars to differentiate (requires camera)
- calculate based on one move at a time 

Choose to go with different colors since it will be the easiest to implement.

## Software

- websocket and react graph vis
- moving average of what the board is to reduce noise
- start button checks if board looks like the start board
- show graph once start button is pressed
- only legal moves are registered (illegal moves display a message)
