import Head from 'next/head'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

import styles from '../styles/navigation.module.css'
import '../styles/globals.css'

function MenuOption(props) {
  let router = useRouter()
  return (
    <span className={styles.link} onClick={() => router.push(props.href)}>
      {props.name}
    </span>
  )
}

function DragonDungeon({ Component, pageProps }) {
  let [gameStarted, setGameStarted] = useState<boolean>(false)
  let [signInNeeded, setSignInNeeded] = useState<boolean>(false)
  let router = useRouter()

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
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://dragondungeon.io" />
      <meta property="og:image" content="https://dragondungeon.io/img/dragons/basicDragon.png" />
      <meta property="og:description" content="Compete against dragons from all over the world and become the richest dragon of all in this award-winning game from the LEAGUE of Amazing Programmers." />
      <meta name="description" content="Compete against dragons from all over the world and become the richest dragon of all in this award-winning game from the LEAGUE of Amazing Programmers." />
      <meta name="twitter:creator" content="@dragondungeonio" />
      <meta name="twitter:image" content="https://dragondungeon.io/img/dragons/basicDragon.png" />
    </Head>
    <p style={{ color: '#f9e300', position: 'fixed', bottom: '0', right: '15px', fontSize: '13pt' }}>Build {require('package.json').version}</p>
    {!gameStarted && <div className={styles.pageContent} style={{ textAlign: 'center' }}>
      {!signInNeeded && <div className={styles.loginWindow}><h2>Loading...</h2></div>}
      {signInNeeded && <div className={styles.loginWindow}>
        <h1 style={{ fontSize: '40pt' }}>DRAGON DUNGEON</h1>
        <img src="/img/dragons/basicDragon.png" height={180} style={{ imageRendering: 'pixelated' }} />
        <h2 style={{ fontSize: '20pt' }} onClick={async () => {
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
        }}>Click Here To Begin</h2>
      </div>}
    </div>}
    {gameStarted && <>
      {!router.pathname.startsWith('/play/') && <div className={styles.nav}>
        <span className={styles.link} style={{ color: '#f9e300' }} onClick={() => router.push('/play')}>Play</span>
        <MenuOption name="Profile" href="/profile" />
        <MenuOption name="Store" href="/store" />
        <MenuOption name="Settings" href="/settings" />
      </div>}
      <Component {...pageProps} />
    </>}
  </>
}

export default DragonDungeon
