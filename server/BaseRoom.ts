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
  CoinJar,
} from '../common'
import gameConfig from '../config/dragondungeon.config'

import * as admin from 'firebase-admin'
import { v4 } from 'uuid'

const botNames = require('./botnames.json')
const botwords = require('./wordlists/nouns.json')
const MAX_COINS_HELD = 30

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

export class BaseRoom extends Room<GameState> {
  counter = 0
  maxClients = 6

  redTeamIds: string[] = []
  blueTeamIds: string[] = []

  botPlayers: Player[] = []

  gameInt: NodeJS.Timeout

  firstBlood = false

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

      if (this.checkWalls(bat.x, bat.y, 0, 1, false)) {
        bat.angle == 0 ? (bat.angle = 1) : (bat.angle = 0)
      }
    }, 100)
  }

  async onJoin(client: Client, options: { token: string }, _2: any) {
    client.send('sfx', '/audio/welcome.m4a')
    for (let batCreationIndex = 0; batCreationIndex < 70; batCreationIndex++) {
      this.manageBat()
    }

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

    var teamnum
    var xPos
    var yPos
    if (this.state.gamemode == 'CTC') {
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
    this.state.players[client.id] = new ServerPlayer(
      ability,
      dragonSkin,
      teamnum,
      client,
    )

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
    this.setCoinJar()
    this.gameInt = setInterval(() => {
      this.clock.tick()
      this.tick()
      this.state.debugOn = !this.state.debugOn
    }, 1000 / 60)
  }

  gameOver() {
    this.clock.clear()
    this.state.gameOver = true
    this.state.players.forEach(async (player: Player) => {
      if (!player.isBot) {
        let playerLifetimeStatsRef = admin
          .firestore()
          .collection(player.onlineID)
          .doc('stats')
        let playerLifetimeStats = await playerLifetimeStatsRef.get()
        let coins =
          parseInt(playerLifetimeStats.data().coins, 10) + player.score
        let fireballs =
          parseInt(playerLifetimeStats.data().fireballs, 10) +
          player.fireballCount
        playerLifetimeStatsRef.update({ coins, fireballs })
      }
      player.dead = true
    })
    this.lock()
  }

  setCoinJar() {
    if (this.state.gamemode == 'CTC') {
      this.state.coinJars.set(
        v4(),
        new CoinJar(this.state.gamewidth / 4, this.state.gameheight / 2, 1),
      )
      this.state.coinJars.set(
        v4(),
        new CoinJar(this.state.gamewidth / 1.25, this.state.gameheight / 2, 2),
      )
    } else {
      this.state.coinJars.set(
        v4(),
        new CoinJar(this.state.gamewidth / 2, this.state.gameheight / 2, 0),
      )
    }
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

  moveBot(bot: Player) {
    bot.inputs({
      up: Math.random() > 0.5 ? true : false,
      down: Math.random() > 0.5 ? true : false,
      left: Math.random() > 0.5 ? true : false,
      right: Math.random() > 0.5 ? true : false,
      shoot: false,
      autoshoot: false,
      angle: Math.random() * Math.PI * 2,
      space: false,
      turbo: false,
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

    var walls: Wall[] = []
    if (this.state.gamemode == 'CTC') {
      //LEFT SIDE
      for (let i = 0; i < 4; i++) {
        walls.push(
          new Wall(
            i * (gamewidth / 3 / 4),
            gameheight / 3,
            gamewidth / 3 / 4,
            wallWidth,
            false,
            10,
            'CTC',
            this.setWallTeam(i, true),
          ),
        )
      }
      
      for (let i = 0; i < 4; i++) {
        walls.push(
          new Wall(
            gamewidth/3,
            (i * (gameheight / 3 / 4))+(gameheight/3),
            gamewidth / 3 / 4,
            wallWidth,
            true,
            10,
            'CTC',
            this.setWallTeam(i, true),
          ),
        )
      }
      for (let i = 0; i < 4; i++) {
        walls.push(
          new Wall(
            i * (gamewidth / 3 / 4),
            (gameheight / 3)*2,
            gamewidth / 3 / 4,
            wallWidth,
            false,
            10,
            'CTC',
            this.setWallTeam(i, true),
          ),
        )
      }
      //RIGHT SIDE
      for (let i = 0; i < 4; i++) {
        walls.push(
          new Wall(
            i * (gamewidth / 3 / 4)+(gamewidth/1.5),
            gameheight / 3,
            gamewidth / 3 / 4,
            wallWidth,
            false,
            10,
            'CTC',
            this.setWallTeam(i, false),
          ),
        )
      }
      for (let i = 0; i < 4; i++) {
        walls.push(
          new Wall(
            gamewidth/3+(gamewidth/3),
            (i * (gameheight / 3 / 4))+(gameheight/3),
            gamewidth / 3 / 4,
            wallWidth,
            true,
            10,
            'CTC',
            this.setWallTeam(i, false),
          ),
        )
      }
      for (let i = 0; i < 4; i++) {
        walls.push(
          new Wall(
            i * (gamewidth / 3 / 4)+(gamewidth/1.5),
            (gameheight / 3)*2,
            gamewidth / 3 / 4,
            wallWidth,
            false,
            10,
            'CTC',
            this.setWallTeam(i, false),
          ),
        )
      }
    } else {
      //bottom right
      walls.push(
        new Wall(
          gamewidth / 2 + midAreaLength,
          gameheight / 2 + midAreaLength,
          wallLength,
          wallWidth,
          true,
          2,
          'coingrab',
          0,
        ),
      )
      walls.push(
        new Wall(
          gamewidth / 2 + midAreaLength,
          gameheight / 2 + midAreaLength,
          wallLength,
          wallWidth,
          false,
          2,
          'coingrab',
          0,
        ),
      )
      //bottom left
      walls.push(
        new Wall(
          gamewidth / 2 - midAreaLength,
          gameheight / 2 + midAreaLength,
          wallLength,
          wallWidth,
          true,
          2,
          'coingrab',
          0,
        ),
      )
      walls.push(
        new Wall(
          gamewidth / 2 - midAreaLength - wallLength,
          gameheight / 2 + midAreaLength,
          wallLength,
          wallWidth,
          false,
          2,
          'coingrab',
          0,
        ),
      )
      //top left
      walls.push(
        new Wall(
          gamewidth / 2 - midAreaLength,
          gameheight / 2 - midAreaLength - wallLength,
          wallLength,
          wallWidth,
          true,
          2,
          'coingrab',
          0,
        ),
      )
      walls.push(
        new Wall(
          gamewidth / 2 - midAreaLength - wallLength,
          gameheight / 2 - midAreaLength,
          wallLength,
          wallWidth,
          false,
          2,
          'coingrab',
          0,
        ),
      )
      //top right
      walls.push(
        new Wall(
          gamewidth / 2 + midAreaLength,
          gameheight / 2 - midAreaLength - wallLength,
          wallLength,
          wallWidth,
          true,
          2,
          'coingrab',
          0,
        ),
      )
      walls.push(
        new Wall(
          gamewidth / 2 + midAreaLength,
          gameheight / 2 - midAreaLength,
          wallLength,
          wallWidth,
          false,
          2,
          'coingrab',
          0,
        ),
      )
    }
    for (let wall of walls) {
      this.state.walls[v4()] = wall
    }
  }

  //this is a dumb little method i made to make selecting which wall is neutral and on a team slightly easier
  setWallTeam(i: number, isRedTeam: boolean){
    if(i == 0 || i==3){
      return 0
    } else{
      if(isRedTeam){return 1} 
      else{return 2}
    }
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
            if (isFireball && wall.team != 0) {
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

  tick() {
    if (this.state.players.size < 2) {
      for (let botIndex = 0; botIndex < 3; botIndex++) {
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

        let botPlayer = new Player(ballType, 0, 0)
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
                player.x = -40000
                player.y = -40000
                player.coins = 0

                setTimeout(() => {
                  player.x = 200
                  player.y = 200
                  player.health = 10
                }, 5000)
                
                this.broadcast('chatlog', `${player.onlineName} died`)

                if (!this.firstBlood) {
                  this.firstBlood = true
                  this.broadcast(
                    'chatlog',
                    `${playerHit.onlineName} got First Blood!`,
                  )
                  playerHit.colyseusClient.send('sfx', '/audio/firstblood.m4a')
                } else {
                  playerHit.colyseusClient.send('sfx', '/audio/amazing.m4a')
                }
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
            } catch {}

            if (fireBall.type === 'electric') {
              if (playerHit.fireballs.length < 10) {
                const angle = Math.random() * Math.PI * 2
                const newX = player.x + 50 * Math.cos(angle)
                const newY = player.y + 50 * Math.sin(angle)
                if (!this.checkWalls(newX, newY, player.team, 22.5, true)) {
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
                '/audio/coinjar.wav',
              )
              this.broadcast(
                'chatlog',
                `${this.state.players[id].onlineName} <img src='/img/game/coinJar.png' height='20px' height='20px' style='image-rendering:pixelated' /> ${this.state.players[id].coins}`,
              )
            } catch {}
          }
          this.state.players[id].coins = 0 // remove coins
        }
      }

      for (let cid of this.state.coins.keys()) {
        if (
          this.state.players[id].team == this.state.coins[cid].team &&
          this.state.coins[cid].checkHit(
            this.state.players[id].x,
            this.state.players[id].y,
            0,
          ) &&
          this.state.players[id].coins < 10
        ) {
          let prevCoins = this.state.players[id].coins
          var coins = this.state.players[id].coins
          try {
            player.colyseusClient.send('sfx', '/audio/coin.wav')
          } catch {}
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
      }

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
