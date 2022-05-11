import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema'

import { Player } from './Player'
import { Coin } from './Coin'
import { CoinJar } from './CoinJar'
import { v4 } from 'uuid'
import { BorderFence } from './BorderFence'
import { Countdown } from './Countdown'
import { Bat } from './Bat'
import { Skull } from './Skull'
import { Wall } from './Wall'
import gameConfig from '../config/dragondungeon.config'

export class GameState extends Schema {
  @type('boolean')
  first: boolean = false

  @type({
    map: Player,
  })
  players = new MapSchema<Player>()

  @type({ map: Coin })
  coins = new MapSchema<Coin>()

  @type({ map: BorderFence })
  fences = new MapSchema<BorderFence>()

  @type('string')
  map: String = 'classic'

  @type(Countdown)
  countdown: Countdown = new Countdown(100000000000000, 0)

  @type({ map: Bat })
  bats = new MapSchema<Bat>()

  @type('string')
  gameOverMessage: string = ''

  @type('boolean')
  leaderboardEnabled: boolean = true

  @type({ map: Skull })
  skulls = new MapSchema<Skull>()

  @type('boolean')
  debugOn: boolean = false

  @type('boolean')
  gameOver: boolean = false

  @type({ map: Wall })
  walls = new MapSchema<Wall>()

  @type('number')
  batRot: number = 0

  @type('number')
  gamewidth: number = gameConfig.gameSize

  @type('number')
  gameheight: number = gameConfig.gameSize

	@type({map: CoinJar})
	coinJars = new MapSchema<CoinJar>();


	//"CTC" or "coinCapture"
	@type("string")
	gamemode: string = "coinCapture"

	constructor() {
		super();
	}
}
