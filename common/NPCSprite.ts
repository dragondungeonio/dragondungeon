import { ArraySchema, Schema, type } from '@colyseus/schema'
import { Geometry } from '.'
import { Bar } from './Bar'
import { Fireball } from './Fireball'

export class NPCSprite extends Schema {
  @type([Fireball])
  fireballs = new ArraySchema<Fireball>()

  @type('number')
  fireballCount: number = 0

  @type('number')
  mod: number = 100

  @type('number')
  health: number = 10

  @type('number')
  x: number = 300

  @type('number')
  y: number = 300

  @type('number')
  angle: number = Math.PI

  @type('number')
  score: number = 0

  @type('number')
  coins: number = 0

  @type([Bar])
  bar = new Bar('', this.x, this.y)

  @type('number')
  speed: number = 25

  @type('number')
  deceleration: number = 1

  @type('number')
  hitsRecived: number = 0

  @type('number')
  hitsDealt: number = 0

  @type('number')
  coinsPickedUp: number = 0

  direction: Geometry.Vector = new Geometry.Vector(0, 0)

  constructor(x: number, y: number) {
    super()
    this.x = x
    this.y = y
  }
}
