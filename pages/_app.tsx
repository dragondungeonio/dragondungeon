import Head from 'next/head'
import { useMemo, useState } from 'react'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

import '../styles/globals.css'
import styles from '../styles/index.module.css'

function DragonDungeon({ Component, pageProps }) {
  let [gameStarted, setGameStarted] = useState<boolean>(false)
  let [signInNeeded, setSignInNeeded] = useState<boolean>(false)

  useMemo(() => {
    if (typeof window !== undefined) {
      initializeApp({
        apiKey: 'AIzaSyCRClPzTZnRSg_fAap6ENnAkxUBQKJGk5w',
        authDomain: 'leaguedragoncoin.firebaseapp.com',
        projectId: 'leaguedragoncoin',
        storageBucket: 'leaguedragoncoin.appspot.com',
        messagingSenderId: '320692217416',
        appId: '1:320692217416:web:f9cd0efdc04445865e9a7d',
      })

      let auth = getAuth()
      let unsubAuthState = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setGameStarted(true)
        } else {
          setSignInNeeded(true)
        }
      })

      unsubAuthState()
    }
  }, [])

  return <>
    <Head>
      <title>Dragon Dungeon</title>
      <link rel="icon" href="/img/game/coinJar.png" />
      <meta property="og:title" content="Dragon Dungeon" />
      <meta property="og:type" content="text/html" />
      <meta property="og:url" content="https://dragondungeon.io" />
      <meta property="og:image" content="https://dragondungeon.io/img/dragons/basicDragon.png" />
      <meta name="twitter:creator" content="@dragondungeonio" />
      <meta name="twitter:player" content="https://dragondungeon.io/play" />
      <meta name="twitter:player:width" content="480" />
	    <meta name="twitter:player:height" content="480" />
    </Head>
    <p style={{ color: '#f9e300', fontFamily: 'sans-serif', position: 'fixed', bottom: '0', right: '15px', fontSize: '13pt' }}>{require('package.json').version}</p>
    {!gameStarted && <div className={styles.home} style={{ textAlign: 'center' }}>
        <img className={styles.heroImage} src="/img/dragons/basicDragon.png" />
        <br /><br /><br />
        <h1>DRAGON DUNGEON</h1>
        {!signInNeeded && <h2>Loading...</h2>}
        {signInNeeded && <>
          <h2 className={styles.link} style={{ fontSize: '25pt' }} onClick={async () => {
            let auth = getAuth()
            let info = await signInWithPopup(auth, new GoogleAuthProvider())
            if (info.user) {
              let db = getFirestore()
              let userStatsRef = doc(db, info.user.uid, 'stats')
              let userStats = await getDoc(userStatsRef)
              if (!userStats.exists()) {
                await setDoc(userStatsRef, {
                  level: 1,
                  coins: 0,
                  fireballs: 0
                })
              }
              setSignInNeeded(false)
              setGameStarted(true)
            }
          }}>Start</h2>
          <a style={{ textDecoration: 'none' }} href="https://lit.games" className={styles.link}>lit.games</a><br /><br />
          <a style={{ textDecoration: 'none' }} href="https://jointheleague.org" className={styles.link}>The LEAGUE</a><br /><br />
          <a style={{ textDecoration: 'none' }} href="https://github.com/dragondungeonio/dragondungeon" className={styles.link}>GitHub</a>
        </>}
      </div>}
    {gameStarted && <Component {...pageProps} />}
  </>
}

export default DragonDungeon
