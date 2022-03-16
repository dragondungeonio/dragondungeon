/**
 *
 * Get the angle in radiant between two points
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 */

export function calculateAngle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  return Math.atan2(y1 - y2, x1 - x2)
}

/**
 * Lerp between two values
 * @param a
 * @param b
 * @param n
 */
export function lerp(a: number, b: number, n: number): number {
  return (1 - n) * a + n * b
}

/**
 * Lerp between two angles
 * @param from
 * @param to
 * @param weight
 */
export function lerpAngle(from: number, to: number, weight: number) {
  return from + shortAngleDist(from, to) * weight
}

/**
 * find shortest angle distance.
 */
function shortAngleDist(startAngle: number, endAngle: number) {
  var max = Math.PI * 2
  var da = (endAngle - startAngle) % max
  return ((2 * da) % max) - da
}

/**
 * Get the distance between two points
 * @param x
 * @param y
 * @param toX
 * @param toY
 */
export function getDistance(
  x: number,
  y: number,
  toX: number,
  toY: number,
): number {
  return Math.hypot(toX - x, toY - y)
}

/**
 * Get a random integer between min and max.
 * @param {number} min - min number
 * @param {number} max - max number
 */
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * Clamp a value
 * @param value
 * @param min
 * @param max
 */
export function clamp(value: number, min: number, max: number): number {
  return value > max ? max : value < min ? min : value
}

/**
 * Round a floating number to 2 digits
 * @param value
 */
export function round2Digits(value: number): number {
  return Math.round(Math.round(value * 1000) / 10) / 100
}

/**
 * Normalize a vector
 * @param ax
 * @param ay
 */
export function normalize2D(ax: number, ay: number): number {
  return Math.sqrt(ax * ax + ay * ay)
}

/**
 * Transform an angle in degrees to the nearest cardinal point.
 */
type Cardinal = 'E' | 'NE' | 'N' | 'NW' | 'W' | 'SW' | 'S' | 'SE'
export function degreeToCardinal(degree: number): Cardinal {
  const cardinals: Cardinal[] = ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE']
  const remainder = (degree %= 360)
  const index = Math.round((remainder < 0 ? degree + 360 : degree) / 45) % 8
  return cardinals[index]
}

/**
 * Reverse a number between a range
 * @example
 * reverseNumber(1.2, 0, 3) // returns 1.8
 */
export function reverseNumber(num: number, min: number, max: number): number {
  return max + min - num
}

/**
 * Snap a position on a grid with TILE_SIZE cells
 * @param pos The position to snap
 * @param tileSize The tile size to snap to
 */
export function snapPosition(pos: number, tileSize: number): number {
  const rest = pos % tileSize
  return rest < tileSize / 2 ? -rest : tileSize - rest
}

/**
 * Shuffles an array
 */
export function shuffleArray(array: any[]) {
  const result = [...array]

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }

  return result
}
/*
export function lineOverlap(xmin1: number, xmax1: number, xmin2: number, xmax2: number){
  return (xmax1 >= xmin2 && xmax2 >= xmin1);
}

export function boxOverlap(xmin1: number, xmax1: number, ymin1: number, ymax1: number, xmin2: number, xmax2: number,  ymin2: number, ymax2: number ){
  return (lineOverlap(xmin1, xmax1, xmin2, xmax2) && lineOverlap(ymin1, ymax1, ymin2, ymax2));
}

export function pointInBox(x: number, y: number, xmin: number, xmax: number, ymin: number, ymax:number){
  return (x >= xmin && y >= ymin && x <= xmax && y <= ymax);
}

export function lineInCircle(){
  return ();
}

export function boxCircleOverlap(x: number, y: number, rad:number, xmin: number, xmax: number, ymin: number, ymax:number){
  return (pointInBox(x, y, xmin, xmax, ymin, ymax) );
}*/
/*
export function checkWalls(newX: number, newY: number){
  const gameWidth = 2000;
  const gameHeight = 2000;
  //this just checks the basic outer walls
  if(newX > gameWidth || newY > gameHeight || newX < 0 || newY < 0){
    return true;
  }
  //offset is horizontal/vertical distance to center
  const offset = gameWidth/2;
  const offsetX = Math.abs(newX - offset);
  const offsetY = Math.abs(newY - offset);
  const boxLength = 735;
  const innerBoxLength = 200;
  if(offsetX < boxLength && offsetY < boxLength){
    if(offsetX > innerBoxLength && offsetY > innerBoxLength){
      if((offsetX > innerBoxLength && offsetX < 120 + innerBoxLength) || (offsetY > innerBoxLength && offsetY < 120 + innerBoxLength)){
        return true;
      }
    }
  }
  return false;
}
*/

/*export function checkWalls (newX: number, newY: number, rad: number){
  //this just checks the basic outer walls
  if(newX > gameWidth-rad || newY > gameHeight-rad || newX < rad || newY < rad){
    return true;
  }

  //wall width
  const width = 42;
  //offset of player from middle
  const offX = Math.abs(newX - gameWidth/2);
  const offY = Math.abs(newY - gameHeight/2);
  //wall start/end
  const inner = 200 + 39.375;
  const outer = 735 - 39.375;
  //if in outer box
  if(offX > inner - rad && offY > inner - rad && offX < outer + rad && offY < outer + rad){
    //vertical || horizontal wall
    if(offX < inner + width + rad || offY < inner + width + rad ){
      return true;
    }
  }

}*/
