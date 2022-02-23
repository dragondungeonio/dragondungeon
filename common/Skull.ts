import { Schema, type } from '@colyseus/schema'

export class Skull extends Schema {
  @type('number')
  x: number = 1

  @type('number')
  y: number = 1

  @type('number')
  speed: number = 2

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

  move() {
    if (this.dist > 1000) {
      this.angle += Math.PI
      this.dist = 0
      if (this.angle > 2 * Math.PI) {
        this.angle -= 2 * Math.PI
      }
    }
    const dX = Math.cos(this.angle) * this.speed
    const dY = Math.sin(this.angle) * this.speed
    this.dist += Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2))
    this.x += dX
    this.y += dY
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
