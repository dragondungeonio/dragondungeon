import { Fireball } from '../../common'
import { InteractionManager } from 'pixi.js'

export { Fireball }

export interface ICountdown {
  seconds: number
  minutes: number
  done: boolean
}

export interface IBar {
  x: number
  y: number
  key: string
}

export interface IPlayer {
  name: string
  host: boolean
  x: number
  y: number
  angle: number
  fireballs: Fireball[]
  bar: IBar
  score: number
  coins: number
  onlineName: string
  onlineID: string
  ballType: string
  skinType: string
  hitsRecived: number
  hitsDealt: number
  coinsPickedUp: number
  dead: boolean
  team: number
}

export interface ICoin {
  key: string
  x: number
  y: number
  size: number
  team: number
}

export interface ICoinJar {
  key: string
  x: number
  y: number
  team: number
}

export interface ILeaderboard {
  name: string
  score: number
}

export interface IBat {
  key: string
  x: number
  y: number
  angle: number
}

export interface ISkull {
  x: number
  y: number
  angle: number
}

export interface IWall {
  key: string
  x: number
  y: number
  xLength: number
  yLength: number
  health: number
  angle: number
}
