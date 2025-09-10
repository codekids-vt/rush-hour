

export function addCustomCar(
    length : number, 
    carRotation: number, 
    mousePosition : {x: number, y: number},
    carColor: string
) {
    const custom_level : Car[] = [];
    var addedCar = {
      x : Math.floor((mousePosition.x - 230) / 63), 
      y : Math.floor((mousePosition.y - 30) / 64), 
      vertical: ((carRotation / 90) % 2 !== 0), 
      length: length, 
      color: carColor
    };
    custom_level.push(addedCar);
    //cars.push(addedCar);

    return custom_level;
}
