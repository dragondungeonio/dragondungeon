import { Countdown, GameState, CoinJar, Player, Wall } from '../common'
import CoreRoom from './CoreRoom'
import { v4 } from 'uuid'
import { Client } from 'colyseus'

let botNames = require('./botnames.json')

export class ArenaRoom extends CoreRoom {
  constructor() {
    let state = new GameState()
    state.countdown = new Countdown(3, 0)
    state.coinJars.set(v4(), new CoinJar(1500, 1500, 0))

    let botPlayerA = new Player('mud', 0, 0)
    botPlayerA.onlineName =
      botNames[Math.floor(Math.random() * botNames.length)]
    botPlayerA.isBot = true
    state.players.set(v4(), botPlayerA)

    let botPlayerB = new Player('poison', 0, 0)
    botPlayerB.onlineName =
      botNames[Math.floor(Math.random() * botNames.length)]
    botPlayerB.isBot = true
    state.players.set(v4(), botPlayerB)

    state.walls.set(
      v4(),
      new Wall(3000 / 2 + 350, 3000 / 2 + 350, 700, 50, true, 2, 'coingrab', 0),
    )

    state.walls.set(
      v4(),
      new Wall(
        3000 / 2 + 350,
        3000 / 2 + 350,
        700,
        50,
        false,
        2,
        'coingrab',
        0,
      ),
    )
    //bottom left
    state.walls.set(
      v4(),
      new Wall(3000 / 2 - 350, 3000 / 2 + 350, 700, 50, true, 2, 'coingrab', 0),
    )
    state.walls.set(
      v4(),
      new Wall(
        3000 / 2 - 350 - 700,
        3000 / 2 + 350,
        700,
        50,
        false,
        2,
        'coingrab',
        0,
      ),
    )
    //top left
    state.walls.set(
      v4(),
      new Wall(
        3000 / 2 - 350,
        3000 / 2 - 350 - 700,
        700,
        50,
        true,
        2,
        'coingrab',
        0,
      ),
    )
    state.walls.set(
      v4(),
      new Wall(
        3000 / 2 - 350 - 700,
        3000 / 2 - 350,
        700,
        50,
        false,
        2,
        'coingrab',
        0,
      ),
    )
    //top right
    state.walls.set(
      v4(),
      new Wall(
        3000 / 2 + 350,
        3000 / 2 - 350 - 700,
        700,
        50,
        true,
        2,
        'coingrab',
        0,
      ),
    )
    state.walls.set(
      v4(),
      new Wall(
        3000 / 2 + 350,
        3000 / 2 - 350,
        700,
        50,
        false,
        2,
        'coingrab',
        0,
      ),
    )

    super(state)
  }

  async onJoin(
    client: Client,
    options: { token: string },
    _2: any,
  ): Promise<void> {
    super.broadcast('music', '/music/risingtide.mp3')
    super.onJoin(client, options, _2)
  }

  tick(): void {
    super.tick()
    for (
      let i = super.getState().coins.size;
      i < super.getState().players.size * 20;
      i++
    ) {
      super.spawnCoin()
    }
  }
}

export class CaptureRoom extends CoreRoom {}

export class EssentialRoom extends CoreRoom {
  constructor() {
    let state = new GameState()
    state.countdown = new Countdown(10, 0)
    super(state)
  }
}
