import { Schema, type } from '@colyseus/schema'

export class Bat extends Schema {
  @type('number')
  x: number = 1

  @type('number')
  y: number = 1

  @type('number')
  speed: number = 3

  @type('number')
  angle: number = 0

  @type('number')
  dist: number = 10

  constructor(x: number, y: number, speed: number) {
    super()
    this.x = x
    this.y = y
    this.speed = speed
  }

  checkHit(dragonX: number, dragonY: number) {
    if (
      Math.sqrt(Math.pow(this.x - dragonX, 2) + Math.pow(this.y - dragonY, 2)) <
      70
    ) {
      return true
    } else {
      return false
    }
  }
}
