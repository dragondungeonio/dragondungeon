import Head from 'next/head'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  getIdToken,
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

async function startGame() {
  let auth = getAuth()
  let info = await signInWithPopup(auth, new GoogleAuthProvider())
  if (info.user) {
    let db = getFirestore()
    let userStoreDoc = await getDoc(doc(db, info.user.uid, 'store'))
    if (!userStoreDoc.exists()) {
      await fetch(`${window.location.protocol}//${window.location.hostname}:1337/init?user=${await getIdToken(info.user)}`)
    }
    return true
  } else {
    return false
  }
}

function DragonDungeon({ Component, pageProps }) {
  let [gameStarted, setGameStarted] = useState<boolean>(false)
  let [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  let [controlScheme, setControlScheme] = useState<number>(0)

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

      if (typeof window == 'object') {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            setIsLoggedIn(true)
          }

          window.addEventListener('touchstart', () => {
            setControlScheme(1)
          })

          window.addEventListener('keypress', async (e) => {
            setControlScheme(0)
            try {
              if (user) {
                setGameStarted(true)
              } else {
                if (e.code == 'Enter') {
                  if (await startGame() == true) {
                    setGameStarted(true)
                  }
                }
              }
            } catch { }
          })

          window.addEventListener("gamepadconnected", (e) => { })
        })
      }
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
    <div className={styles.dragondungeon}>
      {!gameStarted && <div className={styles.pageContent} style={{ textAlign: 'center' }}>
        <div className={styles.loginWindow}>
          <h1 style={{ fontSize: '40pt' }}>DRAGON DUNGEON</h1>
          <img src="/img/dragons/basicDragon.png" height={180} style={{ imageRendering: 'pixelated' }} />
          {(controlScheme == 0) && <p className={styles.startPrompt}>Press <img src="/prompts/mnk/Enter_Key_Dark.png" alt="Enter" height={60} style={{ verticalAlign: 'middle' }} /> to begin</p>}
          {(controlScheme == 1) && <p onClick={async () => {
            if (!isLoggedIn) {
              if (await startGame() == true) {
                setGameStarted(true)
              }
            } else {
              setGameStarted(true)
            }
          }} className={styles.startPrompt}>Tap here to begin</p>}
          {(controlScheme == 2) && <p className={styles.startPrompt}>Press <img src="/prompts/mshid/XboxSeriesX_A.png" alt="A" height={60} style={{ verticalAlign: 'middle' }} /> to begin</p>}
          {(controlScheme == 3) && <p className={styles.startPrompt}>Press <img src="/prompts/sonyhid/PS5_Cross.png" alt="Cross" height={60} style={{ verticalAlign: 'middle' }} /> to begin</p>}
        </div>
      </div>}
      {gameStarted && <>
        {(!router.pathname.startsWith('/play/') && router.pathname !== '/') && <div className={styles.nav}>
          <span className={styles.link} style={{ color: '#f9e300' }} onClick={() => router.push('/play')}>Play</span>
          <MenuOption name="Profile" href="/profile" />
          <MenuOption name="Store" href="/store" />
          <MenuOption name="Settings" href="/settings" />
        </div>}
        <Component {...pageProps} controls={controlScheme} />
      </>}
    </div>
  </>
}

export default DragonDungeon
