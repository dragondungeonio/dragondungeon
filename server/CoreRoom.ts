import { Room, Client } from 'colyseus'

import {
  getUserDetails,
  getUserDragon,
  getUserStats,
  setUserStats,
} from './data'

import {
  GameState,
  Player,
  IInputs,
  Coin,
  Maths,
  Fireball,
  CoinJar,
} from '../common'
import { calculateAngle } from '../common/maths'

import { v4 } from 'uuid'

export class ServerPlayer extends Player {
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

export default class CoreRoom extends Room<GameState> {
  counter = 0
  maxClients = 6

  redTeamIds: string[] = []
  blueTeamIds: string[] = []

  gameInt: NodeJS.Timeout

  firstBlood = false

  constructor(state: GameState) {
    super()
    state.map = 'dirt'
    this.state = state
    this.setState(state)
  }

  onCreate() {
    // this.setState(new GameState())
    this.startGameLoop()
  }

  async onJoin(client: Client, options: { token: string }, _2: any) {
    client.send('sfx', '/assets/audio/welcome.m4a')

    let userData = await getUserDetails(options.token)

    let ability = 'fire'
    let dragonSkin = 0
    let mod = 100

    const userDoc = await getUserDragon(userData.uid)
    try {
      if (userDoc.ability) {
        ability = userDoc.ability.toLowerCase().replace('ball', '')
      } else {
        ability = 'fire'
      }

      if (userDoc.mod) {
        mod = userDoc.mod
      } else {
        mod = 100
      }

      if (userDoc.skin) {
        dragonSkin = userDoc.skin
      } else {
        dragonSkin = 0
      }
    } catch { }

    var teamnum
    var xPos
    var yPos
    if (this.state.gamemode == 'CTC' || this.state.gamemode == 'Zones') {
      if (this.redTeamIds.length <= this.blueTeamIds.length) {
        teamnum = 1
        this.redTeamIds.push(client.id)
        xPos = Math.random() * 700 + 100
        yPos = Math.random() * 800 + 1100
      } else {
        teamnum = 2
        this.blueTeamIds.push(client.id)
        xPos = Math.random() * 800 + 2100
        yPos = Math.random() * 800 + 1100
      }
    } else {
      teamnum = 0
      xPos = this.state.gamewidth * Math.random()
      yPos = this.state.gameheight * Math.random()
      while (this.checkWalls(xPos, yPos, 0, 45, false)) {
        xPos = this.state.gamewidth * Math.random()
        yPos = this.state.gameheight * Math.random()
      }
    }

    let match = false

    this.state.players.forEach(player => {
      if (player.onlineID == userData.uid) {
        this.state.players.delete(player.colyseusClient.id)
        match = true
        this.state.players[client.id] = new ServerPlayer(
          ability,
          dragonSkin,
          player.team,
          client,
        )
      }
    })

    if (!match) {
      this.state.players[client.id] = new ServerPlayer(
        ability,
        dragonSkin,
        teamnum,
        client,
      )
    }

    this.state.players[client.id].x = xPos
    this.state.players[client.id].y = yPos

    this.state.players[client.id].mod = mod

    if (userData.name == null) {
      const adjectives = require('../../wordlists/adjectives.json')
      const nouns = require('../../wordlists/nouns.json')
      const adjective =
        adjectives[Math.floor(Math.random() * adjectives.length)]
      const noun = nouns[Math.floor(Math.random() * nouns.length)]
      this.state.players[client.id].onlineName =
        `${adjective}-${noun}`.toLowerCase()
    } else {
      this.state.players[client.id].onlineName = userData.name
    }
    this.state.players[client.id].onlineID = userData.uid
  }

  onLeave(client: Client, _consent: boolean) { }

  registerMessages() {
    this.onMessage('input', (client: Client, message: IInputs) => {
      try {
        if (message.zoneClaim && this.state.gamemode == 'Zones') {
          let player = this.state.players.get(client.sessionId)
          this.state.coinJars.forEach(jar => {
            if ((player.x > jar.x - 60 && player.x < jar.x + 60) && (player.y > jar.y - 60 && player.y < jar.y + 60)) {
              setTimeout(() => {
                if ((player.x > jar.x - 60 && player.x < jar.x + 60) && (player.y > jar.y - 60 && player.y < jar.y + 60) && message.zoneClaim) {
                  jar.team = player.team
                  this.broadcast('chatlog', `${player.onlineName} captured a zone for ${player.team == 1 ? 'Red' : 'Blue'} team!`)
                  player.colyseusClient.send('sfx', '/assets/audio/captured.m4a')
                }
              }, 3000)
            }
          })
        }
        this.state.players[client.sessionId].inputs(message)
      } catch { }
    })
  }

  startGameLoop() {
    this.registerMessages()
    this.gameInt = setInterval(() => {
      this.clock.tick()
      this.tick()
      this.state.debugOn = !this.state.debugOn
    }, 1000 / 60)
  }

  gameOver(message?: string) {
    this.clock.clear()
    this.state.gameOver = true
    if (message) {
      this.state.gameOverMessage = message
    }
    this.state.players.forEach(async (player: Player) => {
      if (!player.isBot) {
        let playerLifetimeStats = await getUserStats(player.onlineID)
        let coins = parseInt(playerLifetimeStats.coins, 10) + player.score
        let fireballs =
          parseInt(playerLifetimeStats.fireballs, 10) + player.fireballCount
        await setUserStats({ coins, fireballs }, player.onlineID)
      }
      player.dead = true
    })
    this.lock()
  }

  moveBots() {
    this.state.players.forEach((player: Player) => {
      const coinJarCoordinates = { x: 1500, y: 1500 }
      if (!player.isBot) return
      if (
        player.coins >= 10 &&
        ((player.x > coinJarCoordinates.x - 50 &&
          player.x < coinJarCoordinates.x + 50) ||
          (player.y > coinJarCoordinates.y - 50 &&
            player.y < coinJarCoordinates.y + 50))
      ) {
        player.angle = calculateAngle(
          player.x,
          player.y,
          coinJarCoordinates.x,
          coinJarCoordinates.y,
        )
        player.activeInputs.angle = player.angle
      } else if (Math.random() > 0.95) {
        player.angle = Math.random() * 360
        player.activeInputs.angle = Math.random() * 360
      }
      player.inputs(player.activeInputs)
    })
  }

  spawnCoin() {
    var num = Math.random()
    var size = 20
    var xPos
    var yPos
    if (num >= 0.75) {
      size += 5
      if (num >= 0.95) {
        size += 5
        if (num >= 0.995) {
          size = 100
        }
      }
    }
    var teamNum
    if (this.state.gamemode == 'CTC') {
      teamNum = 2
      if (this.state.coins.size % 2 == 0) {
        xPos = Math.random() * 700 + 100
        yPos = Math.random() * 800 + 1100
      } else if (this.state.coins.size % 2 == 1) {
        teamNum = 1
        xPos = Math.random() * 800 + 2100
        yPos = Math.random() * 800 + 1100
      }
    } else {
      teamNum = 0
      xPos = Math.random() * this.state.gamewidth
      yPos = Math.random() * this.state.gameheight
      while (this.checkWalls(xPos, yPos, 0, size, false)) {
        xPos = Math.random() * this.state.gamewidth
        yPos = Math.random() * this.state.gameheight
      }
    }
    this.state.coins.set(v4(), new Coin(xPos, yPos, size, teamNum))
  }

  createCoin(x: number, y: number) {
    this.state.coins.set(v4(), new Coin(x, y, 20, 0))
  }

  //sets x and y of player to random numbers
  spawnPlayer(player: Player) {
    var newX = 0
    var newY = 0
    do {
      newX = Math.random() * 100
      newY = Math.random() * 100
    } while (
      this.checkWalls(newX, newY, player.team, 45, false) ||
      (newX > 500 && newY > 500 && newX < 3500 && newY < 3500)
    )
    player.x = newX
    player.y = newY
  }

  movePlayer(player: Player, ticks: number) {
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

  //false means no collision, true means collision
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
            if (isFireball && wall.gamemode == 'CTC' && wall.team !== 0) {
              wall.health -= 1
            }
            result = true
          }
        }
      }
    }

    return result
  }

  moveFireballs(player: Player, ticks: number) {
    for (let fireball of player.fireballs) {
      fireball.lifetime -= ticks

      var newX =
        fireball.x + fireball.speed * Math.cos(fireball.angle - Math.PI)
      var newY =
        fireball.y + fireball.speed * Math.sin(fireball.angle - Math.PI)
      if (!this.checkWalls(newX, fireball.y, fireball.team, 22.5, true)) {
        fireball.x = newX
      } else {
        fireball.lifetime -= 10
      }
      if (!this.checkWalls(fireball.x, newY, fireball.team, 22.5, true)) {
        fireball.y = newY
      } else {
        fireball.lifetime -= 10
      }
    }
  }

  getState() {
    return this.state
  }

  tick() {
    this.counter++
    const dx = this.clock.deltaTime
    if (this.state.countdown.minutes != 100000000000000) {
      this.state.countdown.elaspseTime()
      if (this.state.countdown.done) {
        if (this.state.gameOver) {
          clearInterval(this.gameInt)
        } else {
          this.gameOver()
        }
      }
    }

    for (let id of this.state.players.keys()) {
      this.movePlayer(this.state.players[id], dx / 50)
      this.moveFireballs(this.state.players[id], dx / 50)

      let player = this.state.players[id]
      let playerId = id

      player.tick(dx)

      this.state.players.forEach((playerHit, playerHitId) => {
        for (let i = 0; i < playerHit.fireballs.length; i++) {
          const fireBall = playerHit.fireballs[i]
          if (playerId == playerHitId) return
          if (
            playerHit.fireballs[i].checkHit(player.x, player.y, player.team)
          ) {
            playerHit.hitsDealt++
            if (player.isGhost == false) {
              player.hitsRecived++
              player.health -= 0.2
            }
            if (player.health < 0) {
              player.health = 10
              try {
                player.x = -40000
                player.y = -40000
                player.coins = 0

                if (this.state.gamemode == 'LDS') {
                  player.isGhost = true
                }

                setTimeout(() => {
                  player.x = 400
                  player.y = 400
                }, 3000)

                if (this.state.gamemode == 'LDS') {
                  this.broadcast(
                    'chatlog',
                    `${player.onlineName} has been eliminated!`,
                  )
                } else {
                  this.broadcast(
                    'chatlog',
                    `${playerHit.onlineName}  <img src='/assets/img/abilities/${playerHit.ballType}ball.png' height='20px' height='20px' style='image-rendering:pixelated' />  ${player.onlineName}`,
                  )
                }

                if (!this.firstBlood) {
                  this.firstBlood = true
                  playerHit.colyseusClient.send('sfx', '/assets/audio/firstblood.m4a')
                } else {
                  playerHit.colyseusClient.send('sfx', '/assets/audio/amazing.m4a')
                }
              } catch { }
            }

            const coinChance = 0.2 // the possibility of removing a coin on collision with a fireball, this is done to spread out the coins more
            const lifetimeRemove = 1 // the lifetime decreace of the fireball for every coin it removes from a dragon (as if  it is heavier)

            try {
              const oldX = player.x
              const oldY = player.y
              const newX =
                oldX + fireBall.speed * Math.cos(fireBall.angle - Math.PI)
              const newY =
                oldY + fireBall.speed * Math.sin(fireBall.angle - Math.PI)

              if (!this.checkWalls(oldX, newY, player.team, 45, true)) {
                player.y = newY
              }
              if (!this.checkWalls(newX, oldY, player.team, 45, true)) {
                player.x = newX
              }

              if (player.coins > 0 && Math.random() < coinChance) {
                player.coins--
                fireBall.lifetime -= lifetimeRemove
                if (fireBall.type == 'poison' && playerHit.coins < 10) {
                  playerHit.coins++
                  playerHit.coinsPickedUp++
                } else {
                  this.createCoin(player.x, player.y)
                }
              }
            } catch { }

            if (fireBall.type === 'electric') {
              if (playerHit.fireballs.length < 10) {
                const angle = Math.random() * Math.PI * 2
                const newX = player.x + 50 * Math.cos(angle)
                const newY = player.y + 50 * Math.sin(angle)
                if (
                  !this.checkWalls(newX, newY, player.team, 22.5, true) &&
                  Math.random() < 0.3
                ) {
                  playerHit.fireballs.push(
                    new Fireball(
                      newX,
                      newY,
                      angle + Math.PI,
                      'electric',
                      20,
                      0,
                    ),
                  )
                }
              }
            } else if (fireBall.type === 'ice') {
              player.deceleration = 0.0001
              setTimeout(() => {
                player.deceleration = 1
              }, 4000)
            } else if (fireBall.type === 'fire') {
              fireBall.lifetime = 70
            }
          }
          if (
            fireBall.type === 'mud' &&
            fireBall.width < 500 &&
            fireBall.height < 935
          ) {
            fireBall.width += 0.5
            fireBall.height += 0.935
            fireBall.speed += 0.001
          }
        }
      })

      for (let coinJarId of this.state.coinJars.keys()) {
        if (
          this.state.coinJars[coinJarId].checkHit(
            this.state.players[id].x,
            this.state.players[id].y,
            this.state.players[id].team,
          )
        ) {
          // when a player has collided with the coinjar
          this.state.players[id].score += this.state.players[id].coins // add coins to players score
          if (this.state.players[id].coins > 0) {
            try {
              this.state.players[id].colyseusClient.send(
                'sfx',
                '/assets/audio/coinjar.wav',
              )
              this.broadcast(
                'chatlog',
                `${this.state.players[id].onlineName} <img src='/assets/img/game/coinJar.png' height='20px' height='20px' style='image-rendering:pixelated' /> ${this.state.players[id].coins}`,
              )
            } catch { }
          }
          this.state.players[id].coins = 0 // remove coins
        }
      }

      for (let cid of this.state.coins.keys()) {
        if (
          (this.state.players[id].team == this.state.coins[cid].team || this.state.coins[cid].team == 0) &&
          this.state.coins[cid].checkHit(
            this.state.players[id].x,
            this.state.players[id].y,
            0,
          ) &&
          this.state.players[id].coins < 10 &&
          this.state.players[id].isGhost == false
        ) {
          let prevCoins = this.state.players[id].coins
          var coins = this.state.players[id].coins
          try {
            player.colyseusClient.send('sfx', '/assets/audio/coin.wav')
          } catch { }
          switch (this.state.coins[cid].getSize()) {
            case 20:
              coins++
              break
            case 25:
              coins++
              break
            case 30:
              coins++
              break
            case 100:
              player.score += 20
              player.coinsPickedUp += 20
              break
          }
          if (prevCoins < 10 && coins >= 10) {
            try {
              player.colyseusClient.send('sfx', '/assets/audio/error.wav')
              player.colyseusClient.send(
                'chatlog',
                '<img src="/assets/img/game/icon.png" width="20px" height="20px" /> out of space',
              )
            } catch { }
          }
          player.coinsPickedUp += Math.min(coins, 10) - player.coins
          player.coins = Math.min(coins, 10)
          this.state.coins.delete(cid)
        }
      }
    }
  }
}
