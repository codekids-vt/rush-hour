/*
orange and gray don't render all the time I don't know why
can still drag and move them (you can see the graph change)
they just don't show on screen I'm not sure if it's a problem 
with my computer because I've been having issues with it or
if it's a problem with the app 
*/
export const levels : Car[][] = [[ //intro
  { x: 0, y: 2, vertical: false, length: 2, color: "red" },
  { x: 4, y: 1, vertical: true, length: 3, color: "blue" },
  { x: 2, y: 2, vertical: true, length: 2, color: "green" }
], [ //beginner
  { x: 0, y: 2, vertical: false, length: 2, color: "red" },
  { x: 5, y: 3, vertical: true, length: 3, color: "blue" },
  { x: 4, y: 0, vertical: false, length: 2, color: "green" },
  { x: 2, y: 0, vertical: true, length: 3, color: "yellow" },
  { x: 0, y: 3, vertical: false, length: 3, color: "orange" }
],
[ //intermediate
    { x: 0, y: 2, vertical: false, length: 2, color: "red" },
    { x: 0, y: 4, vertical: false, length: 3, color: "blue" },
    { x: 0, y: 0, vertical: false, length: 3, color: "yellow" },
    { x: 1, y: 5, vertical: false, length: 2, color: "green" },
    { x: 2, y: 1, vertical: true, length: 3, color: "orange" },
    { x: 3, y: 0, vertical: true, length: 2, color: "green" },
    { x: 5, y: 0, vertical: true, length: 2, color: "orange" },
    { x: 5, y: 2, vertical: true, length: 2, color: "blue" },
    { x: 3, y: 3, vertical: false, length: 2, color: "pink" },
    { x: 4, y: 4, vertical: true, length: 2, color: "purple" }
],
[ //advanced
    { x: 1, y: 2, vertical: false, length: 2, color: "red" },
    { x: 3, y: 3, vertical: false, length: 3, color: "blue" },
    { x: 3, y: 0, vertical: true, length: 3, color: "yellow" },
    { x: 4, y: 4, vertical: true, length: 2, color: "blue" },
    { x: 5, y: 4, vertical: true, length: 2, color: "pink" },
    { x: 0, y: 0, vertical: false, length: 2, color: "green" },
    { x: 0, y: 1, vertical: true, length: 3, color: "orange" },
    { x: 0, y: 4, vertical: false, length: 3, color: "green" },
    { x: 2, y: 0, vertical: true, length: 2, color: "orange" },
    { x: 0, y: 5, vertical: false, length: 2, color: "purple" }
],
[
    { x: 2, y: 2, vertical: false, length: 2, color: "red" },
    { x: 0, y: 0, vertical: false, length: 3, color: "yellow" },
    { x: 3, y: 0, vertical: true, length: 2, color: "green" }, //200
    { x: 5, y: 0, vertical: true, length: 3, color: "blue" }, //300
    { x: 1, y: 1, vertical: false, length: 2, color: "blue" }, //300
    { x: 0, y: 3, vertical: false, length: 2, color: "pink" }, //700
    { x: 2, y: 3, vertical: true, length: 2, color: "purple" },
    { x: 1, y: 4, vertical: true, length: 2, color: "green" },
    { x: 2, y: 5, vertical: false, length: 2, color: "blue" }, //300
    { x: 4, y: 5, vertical: false, length: 2, color: "yellow" },
    { x: 4, y: 0, vertical: true, length: 3, color: "orange" }, //700
    { x: 0, y: 1, vertical: true, length: 2, color: "orange" }, //700
    { x: 3, y: 4, vertical: false, length: 2, color: "gray" },
  ]]