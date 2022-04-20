import { Room, Client } from 'colyseus'
import { GameState, IInputs, Player, Maths } from '../common'
import * as admin from 'firebase-admin'

class ServerPlayer extends Player {
  colyseusClient: Client = null
  constructor(
    ballType: string,
    skinType: number,
    teamNum: number,
    client: Client,
  ) {
    super(ballType, skinType, teamNum)
    this.colyseusClient = client
  }
}

export class CoreRoom extends Room {
  gameInt: NodeJS.Timeout
  counter: number = 0

  onCreate() {
    this.setState(new GameState())
    this.onMessage('input', (client: Client, message: IInputs) => {
      this.state.players[client.sessionId].inputs(message)
    })
    this.gameInt = setInterval(() => {
      this.clock.tick()
      this.tick()
      this.state.debugOn = !this.state.debugOn
    }, 1000 / 60)
  }

  tick() {
    this.counter++
    this.state.countdown.elaspseTime()
    if (this.state.countdown.done) {
      if (this.state.gameOver) {
        clearInterval(this.gameInt)
      }
      // this.gameOver()
    }

    let dx = this.clock.deltaTime

    for (let id of this.state.players.keys()) {
      this.movePlayer(this.state.players[id], dx / 50)
      this.moveFireballs(this.state.players[id], dx / 50)
    }
  }

  async onJoin(client: Client, options?: any, auth?: any) {
    const user = await admin.auth().verifyIdToken(options.token)
    const db = admin.firestore()
    let ability = 'fire'
    let dragonSkin = 0

    const userDoc = await db.collection(user.uid).doc('dragon').get()
    if (userDoc.data()?.ability) {
      ability = userDoc.data()?.ability.toLowerCase().replace('ball', '')
    } else {
      ability = 'fire'
    }

    if (userDoc.data()?.skin) {
      dragonSkin = userDoc.data()?.skin
    } else {
      dragonSkin = 0
    }

    this.state.players[client.id] = new ServerPlayer(
      ability,
      dragonSkin,
      0,
      client,
    )

    this.state.players[client.id].onlineName = user.name
    this.state.players[client.id].onlineID = user.uid
  }

  movePlayer(player: ServerPlayer, ticks: number) {
    if (player.direction.x !== 0 || player.direction.y !== 0) {
      const magnitude = Maths.normalize2D(
        player.direction.x,
        player.direction.y,
      )
      const speedX = Maths.round2Digits(
        player.direction.x *
          (((player.speed + player.coins) * (1 / player.deceleration) * ticks) /
            magnitude),
      )
      const speedY = Maths.round2Digits(
        player.direction.y *
          (((player.speed + player.coins) * (1 / player.deceleration) * ticks) /
            magnitude),
      )
      const newX = player.x + speedX
      const newY = player.y + speedY

      if (!this.checkWalls(player.x, newY, player.team, 45, false)) {
        player.y = newY
      }
      if (!this.checkWalls(newX, player.y, player.team, 45, false)) {
        player.x = newX
      }
    }
  }

  moveFireballs(player: ServerPlayer, ticks: number) {
    for (let fireball of player.fireballs) {
      fireball.lifetime -= ticks

      var newX =
        fireball.x + fireball.speed * Math.cos(fireball.angle - Math.PI)
      var newY =
        fireball.y + fireball.speed * Math.sin(fireball.angle - Math.PI)
      if (!this.checkWalls(newX, fireball.y, fireball.team, 22.5, true)) {
        fireball.x = newX
      } else {
        fireball.lifetime -= 0.3
      }
      if (!this.checkWalls(fireball.x, newY, fireball.team, 22.5, true)) {
        fireball.y = newY
      } else {
        fireball.lifetime -= 0.3
      }
    }
  }

  checkWalls(
    objectX: number,
    objectY: number,
    objectTeam: number,
    radius: number,
    isFireball: boolean,
  ) {
    let walls = this.state.walls
    let result = false

    if (
      objectX > this.state.gamewidth - radius ||
      objectY > this.state.gameheight - radius ||
      objectX < radius ||
      objectY < radius
    ) {
      return true
    }

    for (let wallKey of this.state.walls.keys()) {
      let wall = this.state.walls[wallKey]
      let xLen = wall.xLength
      let yLen = wall.yLength
      if (wall.isRotated) {
        xLen = wall.yLength * 1
        yLen = wall.xLength
      }
      if (wall.health >= 0) {
        if (objectY + radius > wall.y && objectY - radius < wall.y + yLen) {
          if (
            (wall.isRotated &&
              objectX + radius > wall.x - xLen &&
              objectX - radius < wall.x) ||
            (!wall.isRotated &&
              objectX + radius > wall.x &&
              objectX - radius < wall.x + xLen)
          ) {
            if (objectTeam == wall.team && objectTeam != 0) {
              return false
            }
            if (isFireball && wall.gamemode == 'CTC') {
              //if(isFireball){
              wall.health -= 1
            }
            result = true
          }
        }
      }
    }

    return result
  }
}
