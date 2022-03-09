import { Room, Client } from 'colyseus'

import {
  GameState,
  Player,
  IInputs,
  Coin,
  Maths,
  Fireball,
  Bat,
  Skull,
  Wall,
} from '../common'
import gameConfig from '../config/dragondungeon.config'

import * as admin from 'firebase-admin'
import { v4 } from 'uuid'

const botnames = require('./botnames.json')
const botwords = require('./wordlists/nouns.json')
const MAX_COINS_HELD = 30

const serviceAccount = require('../config/private/adminsdk.json')

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })

class ServerPlayer extends Player {
  colyseusClient: Client = null
  constructor(
    ballType: string,
    skinType: string,
    teamNum: number,
    client: Client,
  ) {
    super(ballType, skinType, teamNum)
    this.colyseusClient = client
  }
}

export class GameRoom extends Room<GameState> {
  counter = 0
  maxClients = 6

  redTeamIds: string[] = []
  blueTeamIds: string[] = []

  botPlayers: Player[] = []

  gameInt: NodeJS.Timeout

  onCreate() {
    this.setState(new GameState())
    this.registerMessages()
    this.startGameLoop()
  }

  manageBat() {
    const bat = new Bat(
      Math.floor(Math.random() * gameConfig.gameSize),
      Math.floor(Math.random() * gameConfig.gameSize),
      1,
    )
    this.state.bats.set(v4(), bat)
    setTimeout(() => {
      if (bat.angle == 0) {
        bat.x += Math.floor(Math.random() * 20)
        bat.y += Math.floor(Math.random() * 20)
      } else {
        bat.x -= Math.floor(Math.random() * 20)
        bat.y -= Math.floor(Math.random() * 20)
      }

      if (this.checkWalls(bat.x, bat.y, 1, false)) {
        bat.angle == 0 ? (bat.angle = 1) : (bat.angle = 0)
      }
    }, 100)
  }

  async onJoin(client: Client, options: { token: string }, _2: any) {
    for (let batCreationIndex = 0; batCreationIndex < 70; batCreationIndex++) {
      this.manageBat()
    }

    this.state.skulls.set(
      v4(),
      new Skull(gameConfig.gameSize / 2, gameConfig.gameSize / 2, 1),
    )
    this.state.skulls.set(v4(), new Skull(0, gameConfig.gameSize / 2, 1))

    const user = await admin.auth().verifyIdToken(options.token)
    const db = admin.firestore()
    let ballType = 'fireball'
    let dragonSkin = 'default'

    const userDoc = await db.collection(user.uid).doc('gameplay').get()
    if (userDoc.data()?.ballType) {
      ballType = userDoc.data()?.ballType
    } else {
      switch (Math.floor(Math.random() * 5)) {
        case 0:
          ballType = 'fire'
          break
        case 1:
          ballType = 'ice'
          break
        case 2:
          ballType = 'poison'
          break
        case 3:
          ballType = 'mud'
          break
        case 4:
          ballType = 'electric'
          break
      }
    }

    if (userDoc.data()?.dragonSkin) {
      dragonSkin = userDoc.data()?.dragonSkin
    } else {
      switch (Math.floor(Math.random() * 3)) {
        case 0:
          dragonSkin = 'default'
          break
        case 1:
          dragonSkin = 'light'
          break
        case 2:
          dragonSkin = 'gold'
          break
      }
    }

    var teamnum
    if (this.state.gamemode == 'CTC') {
      if (this.redTeamIds.length <= this.blueTeamIds.length) {
        teamnum = 1
        this.redTeamIds.push(client.id)
      } else {
        teamnum = 2
        this.blueTeamIds.push(client.id)
      }
    } else {
      teamnum = 0
    }
    this.state.players[client.id] = new ServerPlayer(
      ballType,
      dragonSkin,
      teamnum,
      client,
    )

    var xPos = this.state.gamewidth * Math.random()
    var yPos = this.state.gameheight * Math.random()
    while (this.checkWalls(xPos, yPos, 45, false)) {
      xPos = this.state.gamewidth * Math.random()
      yPos = this.state.gameheight * Math.random()
    }
    this.state.players[client.id].x = xPos
    this.state.players[client.id].y = yPos

    if (user.name == null) {
      const adjectives = require('../../wordlists/adjectives.json')
      const nouns = require('../../wordlists/nouns.json')
      const adjective =
        adjectives[Math.floor(Math.random() * adjectives.length)]
      const noun = nouns[Math.floor(Math.random() * nouns.length)]
      this.state.players[client.id].onlineName =
        `${adjective}-${noun}`.toLowerCase()
    } else {
      this.state.players[client.id].onlineName = user.name
    }
    this.state.players[client.id].onlineID = user.uid
  }

  onLeave(client: Client, _consent: boolean) {}

  registerMessages() {
    this.onMessage('input', (client: Client, message: IInputs) => {
      this.state.players[client.sessionId].inputs(message)
    })
  }

  startGameLoop() {
    this.setWalls(false)

    this.gameInt = setInterval(() => {
      this.clock.tick()
      this.tick()
      this.state.debugOn = !this.state.debugOn
    }, 1000 / 60)
  }

  gameOver() {
    this.clock.clear()
    this.state.gameOver = true
    this.state.players.forEach((player: Player) => {
      player.dead = true
    })
  }

  spawnCoin() {
    var num = Math.random()
    var size = 20
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
      teamNum = 1
    } else {
      teamNum = 0
    }
    let xPos = Math.random() * this.state.gamewidth
    let yPos = Math.random() * this.state.gameheight
    while (this.checkWalls(xPos, yPos, size, false)) {
      xPos = Math.random() * this.state.gamewidth
      yPos = Math.random() * this.state.gameheight
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
      this.checkWalls(newX, newY, 45, false) ||
      (newX > 500 && newY > 500 && newX < 3500 && newY < 3500)
    )
    player.x = newX
    player.y = newY
  }

  moveBot(bot: Player) {
    bot.inputs({
      up: Math.random() > 0.5 ? true : false,
      down: Math.random() > 0.5 ? true : false,
      left: Math.random() > 0.5 ? true : false,
      right: Math.random() > 0.5 ? true : false,
      shoot: false,
      autoshoot: false,
      angle: 1,
      space: false,
    })
  }

  //this is where the setup of all inner walls is
  setWalls(isCTC: boolean) {
    const gamewidth = this.state.gamewidth
    const gameheight = this.state.gameheight
    const midAreaLength = 350
    //wall length needs to be a multiple of 100
    const wallLength = 700
    const wallWidth = 50

    //bottom right
    const wall2 = new Wall(
      gamewidth / 2 + midAreaLength,
      gameheight / 2 + midAreaLength,
      wallLength,
      wallWidth,
      true,
      2,
      'coingrab',
    )
    const wall3 = new Wall(
      gamewidth / 2 + midAreaLength,
      gameheight / 2 + midAreaLength,
      wallLength,
      wallWidth,
      false,
      2,
      'coingrab',
    )
    //bottom left
    const wall4 = new Wall(
      gamewidth / 2 - midAreaLength,
      gameheight / 2 + midAreaLength,
      wallLength,
      wallWidth,
      true,
      2,
      'coingrab',
    )
    const wall5 = new Wall(
      gamewidth / 2 - midAreaLength - wallLength,
      gameheight / 2 + midAreaLength,
      wallLength,
      wallWidth,
      false,
      2,
      'coingrab',
    )
    //top left
    const wall6 = new Wall(
      gamewidth / 2 - midAreaLength,
      gameheight / 2 - midAreaLength - wallLength,
      wallLength,
      wallWidth,
      true,
      2,
      'coingrab',
    )
    const wall7 = new Wall(
      gamewidth / 2 - midAreaLength - wallLength,
      gameheight / 2 - midAreaLength,
      wallLength,
      wallWidth,
      false,
      2,
      'coingrab',
    )
    //top right
    const wall8 = new Wall(
      gamewidth / 2 + midAreaLength,
      gameheight / 2 - midAreaLength - wallLength,
      wallLength,
      wallWidth,
      true,
      2,
      'coingrab',
    )
    const wall9 = new Wall(
      gamewidth / 2 + midAreaLength,
      gameheight / 2 - midAreaLength,
      wallLength,
      wallWidth,
      false,
      2,
      'coingrab',
    )

    this.state.walls[v4()] = wall2
    this.state.walls[v4()] = wall3

    this.state.walls[v4()] = wall4
    this.state.walls[v4()] = wall5

    this.state.walls[v4()] = wall6
    this.state.walls[v4()] = wall7

    this.state.walls[v4()] = wall8
    this.state.walls[v4()] = wall9
  }

  removeDeadWalls() {
    for (const wall of this.state.walls.values()) {
      if (wall.health <= 0) {
        // wall.remove
        // ! the remove property doesn't exist on a wall
        // is there another function for this or is the remove property going to be added?
      }
    }
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

      if (!this.checkWalls(player.x, newY, 45, false)) {
        player.y = newY
      }
      if (!this.checkWalls(newX, player.y, 45, false)) {
        player.x = newX
      }
    }
  }

  //false means no collision, true means collision
  checkWalls(
    objectX: number,
    objectY: number,
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

  moveFireballs(player: Player, ticks: number) {
    for (let fireball of player.fireballs) {
      fireball.lifetime -= ticks

      var newX =
        fireball.x + fireball.speed * Math.cos(fireball.angle - Math.PI)
      var newY =
        fireball.y + fireball.speed * Math.sin(fireball.angle - Math.PI)
      if (!this.checkWalls(newX, fireball.y, 22.5, true)) {
        fireball.x = newX
      } else {
        fireball.lifetime -= 0.3
      }
      if (!this.checkWalls(fireball.x, newY, 22.5, true)) {
        fireball.y = newY
      } else {
        fireball.lifetime -= 0.3
      }
    }
  }

  tick() {
    if (this.state.players.size < 2) {
      for (let botIndex = 0; botIndex < 3; botIndex++) {
        let botNames = require('./botnames.json')

        let ballType = 'fire'
        switch (Math.floor(Math.random() * 5)) {
          case 0:
            ballType = 'fire'
            break
          case 1:
            ballType = 'ice'
            break
          case 2:
            ballType = 'poison'
            break
          case 3:
            ballType = 'mud'
            break
          case 4:
            ballType = 'electric'
            break
        }

        let botPlayer = new Player(ballType, 'light', 0)
        botPlayer.onlineName =
          botNames[Math.floor(Math.random() * botNames.length)]
        botPlayer.isBot = true
        setInterval(() => this.moveBot(botPlayer), botPlayer.botTimeout)
        this.botPlayers.push(botPlayer)
        this.state.players.set(v4(), botPlayer)
      }
    }

    this.counter++
    const dx = this.clock.deltaTime
    this.state.countdown.elaspseTime()
    if (this.state.countdown.done) {
      if (this.state.gameOver) {
        clearInterval(this.gameInt)
      }
      this.gameOver()
    }

    for (let i = this.state.coins.size; i < this.state.players.size * 10; i++) {
      this.spawnCoin()
    }

    for (let skull of this.state.skulls.values()) {
      skull.move()
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
            player.hitsRecived++
            player.health -= 0.05
            if (player.health < 0) {
              player.health = 0
              try {
                player.colyseusClient.send('chatlog', 'You are very dead')
                player.x = -40000
                player.y = -40000
                player.coins = 0

                setTimeout(() => {
                  player.x = 200
                  player.y = 200
                  player.health = 10
                }, 5000)
              } catch {}
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

              if (!this.checkWalls(oldX, newY, 45, true)) {
                player.y = newY
              }
              if (!this.checkWalls(newX, oldY, 45, true)) {
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
            } catch {}

            if (fireBall.type === 'electric') {
              if (playerHit.fireballs.length < 10 && Math.random() > 0.9) {
                const angle = Math.random() * Math.PI * 2
                const newX = player.x + 50 * Math.cos(angle)
                const newY = player.y + 50 * Math.sin(angle)
                if (!this.checkWalls(newX, newY, 22.5, true)) {
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
              player.deceleration = 2
            }
          }
          if (
            fireBall.type === 'mud' &&
            fireBall.width < 500 &&
            fireBall.height < 935
          ) {
            fireBall.width += 0.05
            fireBall.height += 0.0935
            fireBall.speed += 0.005
          }
        }
      })

      if (this.state.coinJar.checkHit(player.x, player.y, 0)) {
        // when a player has collided with the coinjar
        player.score += player.coins // add coins to players score
        if (player.coins > 0) {
          try {
            player.colyseusClient.send('sfx', '/audio/coinjar.wav')
            this.broadcast(
              'chatlog',
              `${player.onlineName} <img src='/img/game/coinJar.png' height='20px' height='20px' style='image-rendering:pixelated' /> ${player.coins}`,
            )
          } catch {}
        }
        player.coins = 0 // remove coins
      }

      this.state.coins.forEach((coin, cid) => {
        if (coin.checkHit(player.x, player.y, 0) && player.coins < 10) {
          let prevCoins = player.coins
          var coins = player.coins
          try {
            player.colyseusClient.send('sfx', '/audio/coin.wav')
          } catch {}
          switch (this.state.coins[cid].getSize()) {
            case 20:
              coins++
              break
            case 25:
              coins += 2
              break
            case 30:
              coins += 4
              break
            case 100:
              player.score += 20
              player.coinsPickedUp += 20
              break
          }
          if (prevCoins < 10 && coins >= 10) {
            try {
              player.colyseusClient.send('sfx', '/audio/error.wav')
              player.colyseusClient.send(
                'chatlog',
                '<img src="/img/game/icon.png" width="20px" height="20px" /> out of space',
              )
            } catch {}
          }
          player.coinsPickedUp += Math.min(coins, 10) - player.coins
          player.coins = Math.min(coins, 10)
          this.state.coins.delete(cid)
        }
      })

      for (let bat of this.state.bats.values()) {
        if (bat.checkHit(player.x, player.y)) {
          player.fireballCooldown += 0.3
          break
        }
      }

      for (let skull of this.state.skulls.values()) {
        if (skull.checkHit(player.x, player.y)) {
          if (Math.random() < 0.2 && player.coins > 0) {
            player.coins--
            if (Math.random() < 0.5 && player.score > 0) {
              player.score--
            }
          }
          break
        }
      }
    }

    this.removeDeadWalls()
  }
}
