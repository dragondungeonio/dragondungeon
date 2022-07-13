import * as admin from 'firebase-admin'
import * as fs from 'fs'
import 'colors'

admin.initializeApp({
  credential: admin.credential.cert(require('../config/private/adminsdk.json')),
})

export async function getUserDetails(token: string) {
  console.log(
    'litapi'.yellow + ` - getUserDetails called with token [REDACTED]`,
  )
  let userClaims = await fetch(`${process.env.AUTH_SERVER || 'https://lit.games'}/api/Platform/User/VerifyAuthToken?user=${token}`)
  let userDetailsFull = await userClaims.json()
  console.log(
    'litapi'.yellow + ` - token verified for user ${userDetailsFull.response.preferredIdentifier}`,
  )

  return {
    uid: userDetailsFull.response.uid,
    name: userDetailsFull.response.preferredIdentifier,
    email: userDetailsFull.response.email,
    picture: userDetailsFull.response.avatar,
  }
}

export async function getUserDragon(uid: string) {
  try {
    return require(`../cache/${uid}.json`)
  } catch {
    return {
      skin: 0,
      mod: 100,
      ability: 'Fireball'
    }
  }
}

export async function getUserEntitlements(uid: string) {
  console.log(
    'firebase'.yellow + ` - getUserEntitlements called with UID ${uid}`,
  )
  try {
    let dragonInfoRaw = await admin.firestore().doc(`${uid}/store`).get()
    if (dragonInfoRaw.exists) {
      return dragonInfoRaw.data()
    } else {
      return {
        gems: 0,
        skinEntitlements: [0],
      }
    }
  } catch {
    console.log(
      'firebase'.red + ` - failed to fetch dragon entitlements for user ${uid}`,
    )
    return {
      gems: 0,
      skinEntitlements: [0],
    }
  }
}

export async function getUserStats(uid: string) {
  console.log('firebase'.yellow + ` - getUserStats called with UID ${uid}`)
  try {
    let dragonInfoRaw = await admin.firestore().doc(`${uid}/stats`).get()
    return dragonInfoRaw.data()
  } catch {
    console.log(
      'firebase'.red + ` - failed to fetch dragon stats for user ${uid}`,
    )
    return {
      level: 0,
      fireballs: 0,
      coins: 0,
    }
  }
}

export async function setUserDragon(
  data: {
    ability?: string
    skin?: number
    mod?: number
  },
  uid: string,
) {
  if (fs.existsSync(`${__dirname}/../cache/${uid}.json`)) {
    let dragon = require(`${__dirname}/../cache/${uid}.json`)
    if (data.ability) { dragon.ability = data.ability }
    if (data.skin) { dragon.skin = data.skin }
    if (data.mod) { dragon.mod = data.mod }
    fs.writeFile(`${__dirname}/../cache/${uid}.json`, JSON.stringify(dragon), () => { })
  } else {
    fs.writeFile(`${__dirname}/../cache/${uid}.json`, JSON.stringify({
      ability: data.ability || 'Fireball',
      mod: data.mod || 100,
      skin: data.skin || 0
    }), () => { })
  }
}

export async function setUserEntitlements(
  data: {
    gems?: number
    skinEntitlements?: number[]
  },
  uid: string,
) {
  console.log(
    'firebase'.yellow + ` - setUserEntitlements called with UID ${uid}`,
  )
  try {
    await admin.firestore().doc(`${uid}/store`).set(data)
  } catch {
    console.log(
      'firebase'.red + ` - failed to set dragon entitlements for user ${uid}`,
    )
  }
}

export async function setUserStats(
  data: {
    coins?: number
    fireballs?: number
  },
  uid: string,
) {
  console.log('firebase'.yellow + ` - setUserStats called with UID ${uid}`)
  try {
    await admin.firestore().doc(`${uid}/stats`).set(data)
  } catch {
    console.log(
      'firebase'.red + ` - failed to set dragon stats for user ${uid}`,
    )
  }
}
