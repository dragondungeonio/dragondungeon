import { Schema, type } from '@colyseus/schema'
import { v4 } from 'uuid'

class Fireball extends Schema {
  @type('float32')
  x: number = 1

  @type('float32')
  y: number = 1

  @type('float32')
  angle: number = 0

  @type('string')
  id: string

  @type('float32')
  width: number

  @type('float32')
  height: number

  @type('string')
  type: string = 'fire' //fire, ice, electricity, poision

  @type('float32')
  lifetime: number = 40

  @type('number')
  team: number = 0

  @type('float32')
  speed: number = 12

  constructor(
    x: number,
    y: number,
    angle: number,
    type: string,
    lifetime: number,
    teamNum: number,
    speed?: number,
  ) {
    super()
    this.width = 45
    this.height = 84.4
    this.x = x
    this.y = y
    this.id = v4()
    this.angle = angle
    if (speed) this.speed = speed
    this.type = type
    this.lifetime = lifetime
    this.team = teamNum
    if (this.type === 'mud') {
      this.width *= 1.2
      this.height *= 1.2
    }
  }

  checkHit(dragonX: number, dragonY: number, teamNum: number) {
    if (
      Math.sqrt(Math.pow(this.x - dragonX, 2) + Math.pow(this.y - dragonY, 2)) <
      this.width / 2 + 45
    ) {
      return true
    } else {
      return false
    }
  }
}

export { Fireball }
