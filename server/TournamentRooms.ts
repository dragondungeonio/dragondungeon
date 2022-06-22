import { Countdown, GameState, CoinJar, Player, Wall } from '../common'
import CoreRoom from './CoreRoom'
import { v4 } from 'uuid'
import { Client } from 'colyseus'

export class TournamentSurvivalRoom extends CoreRoom {
  constructor() {
    let state = new GameState()
    state.gamemode = 'LDS'
    super(state)
  }

  async onJoin(
    client: Client,
    options: { token: string },
    _2: any,
  ): Promise<void> {
    super.onJoin(client, options, _2)
  }

  tick(): void {
    super.tick()

    let dragonsStanding = []
    this.state.players.forEach((player) => {
      if (player.isGhost == false) {
        dragonsStanding.push(player.onlineName)
      }
    })

    if (dragonsStanding.length == 1 && this.state.players.size > 1) {
      super.gameOver(`${dragonsStanding[0]} wins the tournament!`)
    }
  }
}

export class TournamentArenaRoom extends CoreRoom {
  constructor() {
    let state = new GameState()
    state.countdown = new Countdown(5, 0)
    state.coinJars.set(v4(), new CoinJar(1500, 1500, 0))
    super(state)
  }

  async onJoin(
    client: Client,
    options: { token: string },
    _2: any,
  ): Promise<void> {
    super.onJoin(client, options, _2)
  }

  tick(): void {
    super.tick()
    for (
      let i = super.getState().coins.size;
      i < super.getState().players.size * 80;
      i++
    ) {
      super.spawnCoin()
    }

    this.moveBots()
  }
}

export class TournamentCaptureRoom extends CoreRoom {
  constructor() {
    let state = new GameState()
    state.gamemode = 'CTC'
    state.countdown = new Countdown(5, 0)
    state.coinJars.set(v4(), new CoinJar(200, 1500, 1))
    state.coinJars.set(v4(), new CoinJar(2800, 1500, 2))
    let setWallTeam = (i: number, isRedTeam: boolean) => {
      if (i == 0 || i == 3) {
        return 0
      } else {
        if (isRedTeam) {
          return 1
        } else {
          return 2
        }
      }
    }

    for (let i = 0; i < 4; i++) {
      state.walls.set(
        v4(),
        new Wall(
          i * (3000 / 3 / 4),
          3000 / 3,
          3000 / 3 / 4,
          30,
          false,
          10,
          'CTC',
          setWallTeam(i, true),
        ),
      )
    }

    for (let i = 0; i < 4; i++) {
      state.walls.set(
        v4(),
        new Wall(
          3000 / 3,
          i * (3000 / 3 / 4) + 3000 / 3,
          3000 / 3 / 4,
          30,
          true,
          10,
          'CTC',
          setWallTeam(i, true),
        ),
      )
    }
    for (let i = 0; i < 4; i++) {
      state.walls.set(
        v4(),
        new Wall(
          i * (3000 / 3 / 4),
          (3000 / 3) * 2,
          3000 / 3 / 4,
          30,
          false,
          10,
          'CTC',
          setWallTeam(i, true),
        ),
      )
    }
    //RIGHT SIDE
    for (let i = 0; i < 4; i++) {
      state.walls.set(
        v4(),
        new Wall(
          i * (3000 / 3 / 4) + 3000 / 1.5,
          3000 / 3,
          3000 / 3 / 4,
          30,
          false,
          10,
          'CTC',
          setWallTeam(i, false),
        ),
      )
    }
    for (let i = 0; i < 4; i++) {
      state.walls.set(
        v4(),
        new Wall(
          3000 / 3 + 3000 / 3,
          i * (3000 / 3 / 4) + 3000 / 3,
          3000 / 3 / 4,
          30,
          true,
          10,
          'CTC',
          setWallTeam(i, false),
        ),
      )
    }
    for (let i = 0; i < 4; i++) {
      state.walls.set(
        v4(),
        new Wall(
          i * (3000 / 3 / 4) + 3000 / 1.5,
          (3000 / 3) * 2,
          3000 / 3 / 4,
          30,
          false,
          10,
          'CTC',
          setWallTeam(i, false),
        ),
      )
    }

    super(state)
  }

  tick(): void {
    super.tick()
    if (super.getState().coins.size < 100) {
      super.spawnCoin()
    }
  }
}

export class TournamentZonesRoom extends CoreRoom {
  constructor() {
    let state = new GameState()
    state.gamemode = 'Zones'
    state.countdown.minutes = 5
    state.coinJars.set(v4(), new CoinJar(200, 1500, 0))
    state.coinJars.set(v4(), new CoinJar(600, 700, 0))
    state.coinJars.set(v4(), new CoinJar(1000, 2800, 0))
    state.coinJars.set(v4(), new CoinJar(1400, 2540, 0))
    state.coinJars.set(v4(), new CoinJar(1800, 1230, 0))
    super(state)
  }

  async onJoin(
    client: Client,
    options: { token: string },
    _2: any,
  ): Promise<void> {
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

export class EssentialRoom extends CoreRoom {
  constructor() {
    let state = new GameState()
    super(state)
  }
}
