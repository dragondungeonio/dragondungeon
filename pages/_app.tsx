import Head from 'next/head'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { AnimatePresence } from 'framer-motion'
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  getIdToken,
} from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { PageLayout } from 'components'

import styles from '../styles/navigation.module.css'
import '../styles/globals.css'

function ModeItem(props) {
  return <div style={{ padding: '20px', width: '160px', textAlign: 'center' }} onClick={() => { if (props.href) { props.router.push(props.href) } }}>
    <img src={props.img} alt={props.name} style={{ imageRendering: 'pixelated', height: '50px' }} />
    <br /><br />
    <span style={{ fontSize: '20pt' }}>{props.name}</span><br /><br />
    {props.description && <span style={{ color: '#f9e300' }}>{props.description}</span>}
  </div>
}

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

      if (typeof window == 'object') {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            setGameStarted(true)
          } else {
            setSignInNeeded(true)
          }
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
      <meta property="og:image" content="https://dragondungeon.io/img/skins/basic.png" />
      <meta property="og:description" content="Compete against dragons from all over the world and become the richest dragon of all in this award-winning game from the LEAGUE of Amazing Programmers." />
      <meta name="description" content="Compete against dragons from all over the world and become the richest dragon of all in this award-winning game from the LEAGUE of Amazing Programmers." />
      <meta name="twitter:creator" content="@dragondungeonio" />
      <meta name="twitter:image" content="https://dragondungeon.io/img/skins/basic.png" />
      <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi" />
    </Head>
    <div className={styles.dragondungeon}>
      <div className={styles.centeredContent}>
        {!router.pathname.startsWith('/play/') && <div className={styles.nav}>
          <span className={styles.link} style={{ color: '#f9e300' }} onClick={() => router.push('/')}>Play</span>
          <MenuOption name="Profile" href="/profile" />
          <MenuOption name="Store" href="/store" />
          <MenuOption name="Settings" href="/settings" />
        </div>}
        <AnimatePresence
          exitBeforeEnter
          initial={false}
          onExitComplete={() => window.scrollTo(0, 0)}
        >
          {gameStarted && <Component {...pageProps} controls={0} />}
          {(!gameStarted && signInNeeded) && <>
            <div style={{ width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.7)', position: 'fixed', zIndex: '999999999999999999', top: 0, left: 0 }}>
              <span className={styles.link} style={{ position: 'fixed', left: '37%', top: '45%', textAlign: 'center', fontSize: '25pt', padding: '20px' }} onClick={async () => {
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
              }}>
                Log In with Google
              </span>
            </div>
            <Component {...pageProps} controls={0} />
          </>}
          {(!gameStarted && !signInNeeded) && <>Loading....</>}
        </AnimatePresence>
      </div>
    </div>
    {typeof window == 'object' &&
      <p style={{ color: '#f9e300', position: 'fixed', top: 0, left: 0, width: '100vw', textAlign: 'center', pointerEvents: 'none', zIndex: 99999999999999999999 }}>{navigator.userAgent}<br /><b>dragondungeon.io Public Beta Build {require('../package.json').version}</b></p>
    }
  </>
}

export default DragonDungeon
