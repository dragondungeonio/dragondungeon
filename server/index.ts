// DragonDungeon Core

// 3rd Party Imports
import { createServer } from 'http'
import { createServer as createSecureServer } from 'https'
import { readFileSync, existsSync } from 'fs'
import { parse } from 'url'
import { Server } from 'colyseus'
import { WebSocketTransport } from '@colyseus/ws-transport'
import next from 'next'
import 'colors'

// 1st Party Imports
import { GameRoom } from './GameRoom'

// Friendly Logs
console.log('DragonDungeon'.red)
console.log('The LEAGUE of Amazing Programmers'.yellow)

// HTTPS support
let secureServer =
  process.env.HTTP !== 'true' && existsSync('config/private/key.pem')
let secureServerOptions: any = {}

if (secureServer) {
  secureServerOptions.key = readFileSync('config/private/key.pem')
  secureServerOptions.cert = readFileSync('config/private/cert.pem')
}

// Initialize Next.js
const dev = process.env.NODE_ENV !== 'production'
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
let gameServer = !secureServer
  ? createServer()
  : createSecureServer(secureServerOptions)

const colyseusServer = new Server({
  transport: new WebSocketTransport({
    server: gameServer,
  }),
})

colyseusServer.define('game', GameRoom)

colyseusServer.listen(1337)
console.log(
  'server'.green +
    ' - [::]:1337 - ' +
    (secureServer ? 'https'.green : 'http'.yellow),
)
