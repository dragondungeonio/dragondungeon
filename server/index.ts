// DragonDungeon Core

// 3rd Party Imports
import { createServer } from 'http'
import { createServer as createSecureServer } from 'https'
import { readFileSync, existsSync } from 'fs'
import { parse } from 'url'
import { Server } from 'colyseus'
import { WebSocketTransport } from '@colyseus/ws-transport'
import express from 'express'
import next from 'next'
import cors from 'cors'
import { monitor } from '@colyseus/monitor'
import 'colors'

// 1st Party Imports
import {
  ArenaRoom,
  CaptureRoom,
  EssentialRoom,
  SurvivalRoom,
  ZonesRoom,
} from './MultiplayerRooms'
import { TutorialRoom, CampaignBetaRoom } from './SingleplayerRooms'
import { completePurchase, equipItem, getLoadout, initUser, linkAnet, purchaseInit, purchaseItem } from './api'
import { TournamentArenaRoom, TournamentCaptureRoom, TournamentSurvivalRoom, TournamentZonesRoom } from './TournamentRooms'

// Friendly Logs
console.log('DragonDungeon'.red)
console.log('The LEAGUE of Amazing Programmers'.yellow)

// HTTPS support
let secureServer =
  process.argv.includes('--https') && existsSync('config/private/key.pem')
let secureServerOptions: any = {}

if (secureServer) {
  secureServerOptions.key = readFileSync('config/private/key.pem')
  secureServerOptions.cert = readFileSync('config/private/cert.pem')
}

// Initialize Next.js
const dev = !process.argv.includes('--prod')
const app = next({ dev })
const handle = app.getRequestHandler()

// Start Client
app.prepare().then(() => {
  let clientServer = !secureServer
    ? createServer((req, res) => {
      handle(req, res, parse(req.url, true))
    })
    : createSecureServer(secureServerOptions, (req, res) => {
      handle(req, res, parse(req.url, true))
    })

  clientServer.listen(8080, () => {
    console.log(
      'client'.green +
      ' - [::]:8080 - ' +
      (secureServer ? 'https'.green : 'http'.yellow),
    )
  })
})

// Start Server
let gameServerApp = express()

gameServerApp.use(cors())

gameServerApp.use('/monitor', monitor())

gameServerApp.get('/equip/:id', equipItem)
gameServerApp.get('/purchase/:id', purchaseItem)
gameServerApp.get('/pay/:gemAmount', purchaseInit)
gameServerApp.get('/init', initUser)
gameServerApp.get('/claim/anet/:cid', linkAnet)
gameServerApp.get('/loadout', getLoadout)
gameServerApp.post(
  '/pay/webhook',
  express.raw({ type: 'application/json' }),
  completePurchase
)

let gameServer = !secureServer
  ? createServer(gameServerApp)
  : createSecureServer(secureServerOptions, gameServerApp)

const colyseusServer = new Server({
  transport: new WebSocketTransport({
    server: gameServer,
  }),
})

colyseusServer.define('arena', ArenaRoom)
colyseusServer.define('ctc', CaptureRoom)
colyseusServer.define('lds', SurvivalRoom)
colyseusServer.define('zones', ZonesRoom)
colyseusServer.define('campaign', CampaignBetaRoom)

colyseusServer.define('tarena', TournamentArenaRoom)
colyseusServer.define('tctc', TournamentCaptureRoom)
colyseusServer.define('tlds', TournamentSurvivalRoom)
colyseusServer.define('tzones', TournamentZonesRoom)

colyseusServer.define('essentials', EssentialRoom)
colyseusServer.define('tutorial', TutorialRoom)

colyseusServer.listen(1337)
console.log(
  'server'.green +
  ' - [::]:1337 - ' +
  (secureServer ? 'https'.green : 'http'.yellow),
)
