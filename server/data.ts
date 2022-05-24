import * as admin from 'firebase-admin'
import 'colors'

admin.initializeApp({ credential: admin.credential.cert(require('../config/private/adminsdk.json')) })

export async function getUserDetails(token: string) {
    console.log('firebase'.yellow + ` - getUserDetails called with token [REDACTED]`)
    let userDetailsFull = await admin.auth().verifyIdToken(token);
    console.log('firebase'.yellow + ` - token verified for user ${userDetailsFull.email}`)

    return {
        uid: userDetailsFull.uid,
        name: userDetailsFull.name,
        email: userDetailsFull.email,
        picture: userDetailsFull.picture
    }
}

export async function getUserDragon(uid: string) {
    console.log('firebase'.yellow + ` - getUserDragon called with UID ${uid}`)
    try {
        let dragonInfoRaw = await admin.firestore().doc(`${uid}/dragon`).get()
        return dragonInfoRaw.data()
    } catch {
        console.log('firebase'.red + ` - failed to fetch dragon data fetched for user ${uid}`)
        return {
            ability: 'Fireball',
            skin: 0,
        }
    }
}

export async function getUserEntitlements(uid: string) {
    console.log('firebase'.yellow + ` - getUserEntitlements called with UID ${uid}`)
    try {
        let dragonInfoRaw = await admin.firestore().doc(`${uid}/store`).get()
        return dragonInfoRaw.data()
    } catch {
        console.log('firebase'.red + ` - failed to fetch dragon entitlements fetched for user ${uid}`)
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
        console.log('firebase'.red + ` - failed to fetch dragon stats fetched for user ${uid}`)
        return {
            level: 0,
            fireballs: 0,
            coins: 0,
        }
    }
}

export async function setUserDragon(data: {
    ability?: string,
    skin?: number,
}) {}

export async function setUserEntitlements(data: {
    gems?: number,
    skinEntitlements?: number[],
}) {}

export async function setUserStats(data: {
    coins?: number,
    fireballs?: number
}) {}
