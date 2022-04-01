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
import * as admin from 'firebase-admin'
import cors from 'cors'
import Stripe from 'stripe'
import 'colors'

// 1st Party Imports
import { ArenaRoom } from './MultiplayerRooms'
import { AP22DiscoveryRoom } from './SingleplayerRooms'

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

const stripeAccount = require('../config/private/stripesdk.json')
const stripe = new Stripe(stripeAccount.secretKey, {
  apiVersion: '2020-08-27'
})

const serviceAccount = require('../config/private/adminsdk.json')
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })

gameServerApp.get('/equip/:id', async (req, res) => {
  try {
    let userClaims = await admin.auth().verifyIdToken(req.query.user as string)

    if (req.query.type == 'ability') {
      await admin.firestore().doc(`${userClaims.uid}/dragon`).update({
        ability: req.params.id
      })
    } else {
      let userEntitlementsDoc = await admin.firestore().doc(`${userClaims.uid}/store`).get()
      let userEntitlements = userEntitlementsDoc.data()
      if (userEntitlements.skinEntitlements.includes(parseInt(req.params.id, 10))) {
        await admin.firestore().doc(`${userClaims.uid}/dragon`).update({
          skin: parseInt(req.params.id, 10)
        })
      } else {
        res.status(400)
        res.send('Skin is not in user entitlements')
      }
    }

    res.status(200)
    res.send('Success')
  } catch {
    res.status(400)
    res.send('Unknown error')
  }
})

gameServerApp.get('/purchase/:id', async (req, res) => {
  try {
    let userClaims = await admin.auth().verifyIdToken(req.query.user as string)
    let playerEntitlementsDoc = await admin.firestore().doc(`${userClaims.uid}/store`).get()
    let playerEntitlements = playerEntitlementsDoc.data()

    if (req.query.type == 'mode') {
      let modeList = require('../public/api/modes.json')
      modeList.forEach(async mode => {
        if (mode.id == req.params.id) {
          if (playerEntitlements.gems >= mode.gemCost) {
            playerEntitlements.modeEntitlements.push(mode.id)
            await admin.firestore().doc(`${userClaims.uid}/store`).update({
              gems: playerEntitlements.gems - mode.gemCost,
              modeEntitlements: playerEntitlements.modeEntitlements
            })
          } else {
            res.status(400)
            res.send('Not enough gems')
          }
        }
      })
    } else {
      let skinList = require('../public/api/skins.json')
      skinList.forEach(async skin => {
        if (skin.id == parseInt(req.params.id, 10)) {
          console.log(`purchasing skin ${skin.name}`)
          if (playerEntitlements.gems >= skin.gemCost) {
            console.log('has enough gems')
            playerEntitlements.skinEntitlements.push(skin.id)
            await admin.firestore().doc(`${userClaims.uid}/store`).update({
              gems: playerEntitlements.gems - skin.gemCost,
              skinEntitlements: playerEntitlements.skinEntitlements
            })
          } else {
            res.status(400)
            res.send('Not enough gems')
          }
        }
      })
    }

    res.status(200)
    res.send('Success')
  } catch {
    res.status(400)
    res.send('Unknown error')
  }
})

gameServerApp.get('/pay/:gemAmount', async (req, res) => {
  let linePrice = 99

  switch(req.params.gemAmount) {
    case "500":
      linePrice = 499
      break;
    case "1000":
      linePrice = 999
      break;
    case "10000":
      linePrice = 9999
      break;
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: linePrice,
    currency: "usd",
    description: req.query.uid.toString(),
    automatic_payment_methods: { enabled: true },
  })

  res.send({ clientSecret: paymentIntent.client_secret })
})

gameServerApp.post('/pay/webhook', express.raw({ type: 'application/json' }), async (request, response) => {  
  try {
    let event: Stripe.Event = JSON.parse(request.body)
    console.log('stripe'.gray + ' - ' + event.type)
    if (event.type == 'charge.succeeded') {
      let gemCharge = event.data.object as Stripe.Charge
      let gemCredit = 100
 
      switch (gemCharge.amount) {
        case 499:
          gemCredit = 550
          break
        case 999:
          gemCredit = 1100
          break
        case 9999:
          gemCredit = 11000
          break
      }

      let authedCharge = await stripe.charges.retrieve(gemCharge.id)
      // Fraud protection - makes sure request isn't forged
      if (authedCharge.amount == gemCharge.amount) {
        let playerGemDoc = admin.firestore().collection(gemCharge.description).doc('store')
        let playerGems = await playerGemDoc.get()
        if (playerGems.exists) {
          playerGemDoc.update({
            gems: (playerGems.data().gems || 0) + gemCredit
          })
        } else {
          playerGemDoc.create({
            gems: gemCredit
          })
        }
      }
    }
  } catch (err) {
    console.log(err.message)
    return response.status(400).send(err.message)
  }

  response.status(200);
});

gameServerApp.get('/init', async (req, res) => {
  try {
    let userClaims = await admin.auth().verifyIdToken(req.query.user.toString())
    let userDragonDoc = admin.firestore().doc(`${userClaims.uid}/dragon`)
    let userStoreDoc = admin.firestore().doc(`${userClaims.uid}/store`)
    let userStatsDoc = admin.firestore().doc(`${userClaims.uid}/stats`)
    if (!(await userStoreDoc.get()).exists) {
      userDragonDoc.set({
        ability: 'Fireball',
        skin: 0
      })
      userStoreDoc.set({
        gems: 0,
        skinEntitlements: [0],
        modeEntitlements: ["arena"]
      })
      userStatsDoc.set({
        level: 0,
        fireballs: 0,
        coins: 0
      })
    }
    res.status(200)
    res.send('Done')
  } catch {
    res.status(400)
    res.send('Couldn\'t initialize user')
  }
})

let gameServer = !secureServer
  ? createServer(gameServerApp)
  : createSecureServer(secureServerOptions, gameServerApp)

const colyseusServer = new Server({
  transport: new WebSocketTransport({
    server: gameServer,
  }),
})

colyseusServer.define('arena', ArenaRoom)
colyseusServer.define('ap22discovery', AP22DiscoveryRoom)

colyseusServer.listen(1337)
console.log(
  'server'.green +
  ' - [::]:1337 - ' +
  (secureServer ? 'https'.green : 'http'.yellow),
)
