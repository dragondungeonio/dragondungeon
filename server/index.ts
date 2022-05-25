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
import Stripe from 'stripe'
import 'colors'

// 1st Party Imports
import {
  ArenaRoom,
  CaptureRoom,
  EssentialRoom,
  SurvivalRoom,
} from './MultiplayerRooms'
import { TutorialRoom } from './SingleplayerRooms'
import CoreRoom from './CoreRoom'
import {
  getUserDetails,
  getUserDragon,
  getUserEntitlements,
  getUserStats,
  setUserDragon,
  setUserEntitlements,
  setUserStats,
} from './data'

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
  apiVersion: '2020-08-27',
})

gameServerApp.get('/equip/:id', async (req, res) => {
  try {
    let userClaims = await getUserDetails(req.query.user as string)

    if (req.query.type == 'ability') {
      await setUserDragon(
        {
          ability: req.params.id,
        },
        userClaims.uid,
        true,
      )
    } else {
      let userEntitlements = await getUserEntitlements(userClaims.uid)
      if (
        userEntitlements.skinEntitlements.includes(parseInt(req.params.id, 10))
      ) {
        await setUserDragon(
          {
            skin: parseInt(req.params.id, 10),
          },
          userClaims.uid,
          true,
        )
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
    let userClaims = await getUserDetails(req.query.user as string)
    let playerEntitlementsDoc = await getUserEntitlements(userClaims.uid)
    let playerEntitlements = playerEntitlementsDoc.data()

    let skinList = require('../public/api/skins.json')
    skinList.forEach(async (skin) => {
      if (skin.id == parseInt(req.params.id, 10)) {
        if (playerEntitlements.gems >= skin.gemCost) {
          console.log('has enough gems')
          playerEntitlements.skinEntitlements.push(skin.id)
          await setUserEntitlements(
            {
              gems: playerEntitlements.gems - skin.gemCost,
              skinEntitlements: playerEntitlements.skinEntitlements,
            },
            userClaims.uid,
          )
        } else {
          res.status(400)
          res.send('Not enough gems')
        }
      }
    })

    res.status(200)
    res.send('Success')
  } catch {
    res.status(400)
    res.send('Unknown error')
  }
})

gameServerApp.get('/pay/:gemAmount', async (req, res) => {
  let linePrice = 99

  switch (req.params.gemAmount) {
    case '500':
      linePrice = 499
      break
    case '1000':
      linePrice = 999
      break
    case '10000':
      linePrice = 9999
      break
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: linePrice,
    currency: 'usd',
    description: req.query.uid.toString(),
    automatic_payment_methods: { enabled: true },
  })

  res.send({ clientSecret: paymentIntent.client_secret })
})

gameServerApp.post(
  '/pay/webhook',
  express.raw({ type: 'application/json' }),
  async (request, response) => {
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
          let playerGems = await getUserEntitlements(gemCharge.description)
          if (playerGems.exists) {
            await setUserEntitlements(
              {
                gems: (playerGems.data().gems || 0) + gemCredit,
              },
              gemCharge.description,
            )
          } else {
            await setUserEntitlements(
              {
                gems: gemCredit,
              },
              gemCharge.description,
            )
          }
        }
      }
    } catch (err) {
      console.log(err.message)
      return response.status(400).send(err.message)
    }

    response.status(200)
  },
)

gameServerApp.get('/init', async (req, res) => {
  try {
    let userClaims = await getUserDetails(req.query.user.toString())
    let userDragonDoc = await getUserDragon(userClaims.uid)
    let userStoreDoc = await getUserEntitlements(userClaims.uid)
    let userStatsDoc = await getUserStats(userClaims.uid)
    if (!(await userStoreDoc.get()).exists) {
      await setUserDragon(
        {
          ability: 'Fireball',
          skin: 0,
        },
        userClaims.uid,
      )
      await setUserEntitlements(
        {
          gems: 0,
          skinEntitlements: [0],
        },
        userClaims.uid,
      )
      await setUserStats(
        {
          fireballs: 0,
          coins: 0,
        },
        userClaims.uid,
      )
    }
    res.status(200)
    res.send('Done')
  } catch {
    res.status(400)
    res.send("Couldn't initialize user")
  }
})

gameServerApp.get('/claim/anet/:cid', async (req, res) => {
  try {
    let userClaims = await getUserDetails(req.query.user.toString())
    let characterData = await (
      await fetch(
        `https://api.guildwars2.com/v2/characters/${req.query.char}?access_token=${req.query.token}`,
      )
    ).json()
    let userStoreDoc = await getUserEntitlements(userClaims.uid)
    let skinEntitlements = userStoreDoc.skinEntitlements

    switch (req.params.cid) {
      case 'Die 100 Times':
        if (characterData.deaths >= 10) {
          skinEntitlements.push(5)
          userStoreDoc.update({
            skinEntitlements,
          })
          res.status(200)
          res.send('Claimed')
        } else {
          res.status(400)
          res.send('Ineligible')
        }
        break
      case 'Reach Level 10':
        if (characterData.level >= 10) {
          console.log('elig')
          res.status(200)
          res.send('Claimed')
        } else {
          res.status(400)
          res.send('Ineligible')
        }
        break
      case 'Reach Level 80':
        if (characterData.level >= 80) {
          console.log('elig')
          res.status(200)
          res.send('Claimed')
        } else {
          res.status(400)
          res.send('Ineligible')
        }
        break
    }
  } catch {
    res.status(400)
    res.send('Error claiming reward')
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
colyseusServer.define('ctc', CaptureRoom)
colyseusServer.define('lds', SurvivalRoom)
colyseusServer.define('essentials', EssentialRoom)
colyseusServer.define('tutorial', TutorialRoom)

colyseusServer.listen(1337)
console.log(
  'server'.green +
    ' - [::]:1337 - ' +
    (secureServer ? 'https'.green : 'http'.yellow),
)
