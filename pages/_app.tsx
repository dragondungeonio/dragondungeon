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
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

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
      const onlineServices = initializeApp({
        apiKey: 'AIzaSyCRClPzTZnRSg_fAap6ENnAkxUBQKJGk5w',
        authDomain: 'leaguedragoncoin.firebaseapp.com',
        projectId: 'leaguedragoncoin',
        storageBucket: 'leaguedragoncoin.appspot.com',
        messagingSenderId: '320692217416',
        appId: '1:320692217416:web:f9cd0efdc04445865e9a7d',
      })

      // const appCheck = initializeAppCheck(onlineServices, {
      //   provider: new ReCaptchaV3Provider('6LcbhOQfAAAAALfRhtZTXG01H2uyAc7QHNWKzy0m'),
      //   isTokenAutoRefreshEnabled: true
      // });

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

  return (
    <>
      <Head>
        <title>DragonDungeon</title>
        <link rel="icon" href="/assets/img/game/coinJar.png" />
        <meta property="og:title" content="DragonDungeon" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dragondungeon.io" />
        <meta
          property="og:image"
          content="https://dragondungeon.io/assets/img/skins/basic.png"
        />
        <meta
          property="og:description"
          content="Compete against dragons from all over the world and become the richest dragon of all in this award-winning game from the LEAGUE of Amazing Programmers."
        />
        <meta
          name="description"
          content="Compete against dragons from all over the world and become the richest dragon of all in this award-winning game from the LEAGUE of Amazing Programmers."
        />
        <meta name="twitter:creator" content="@dragondungeonio" />
        <meta
          name="twitter:image"
          content="https://dragondungeon.io/assets/img/skins/basic.png"
        />
        <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi" />
      </Head>
      <div className={styles.dragondungeon}>
        <div className={styles.centeredContent}>
          {typeof window !== 'undefined' && (
            <>
              {!router.pathname.startsWith('/play/') &&
                !router.pathname.startsWith('/award') &&
                window.localStorage.ddTournamentMode != 'true' && (
                  <div className={styles.nav}>
                    <span
                      className={styles.link}
                      style={{ color: '#f9e300' }}
                      onClick={() => router.push('/')}
                    >
                      Play
                    </span>
                    <MenuOption name="Dragon" href="/profile" />
                    <MenuOption name="Store" href="/store" />
                    <MenuOption
                      name="Updates"
                      href="https://dragondungeonio.substack.com/"
                    />
                    <MenuOption name="Settings" href="/settings" />
                  </div>
                )}
              {!router.pathname.startsWith('/play/') &&
                router.pathname != '/' &&
                window.localStorage.ddTournamentMode == 'true' && (
                  <div className={styles.nav}>
                    <span
                      className={styles.link}
                      style={{ color: '#f9e300' }}
                      onClick={() => router.push('/')}
                    >
                      Back
                    </span>
                  </div>
                )}
            </>
          )}
          <AnimatePresence
            exitBeforeEnter
            initial={false}
            onExitComplete={() => window.scrollTo(0, 0)}
          >
            {gameStarted && <Component {...pageProps} controls={0} />}
            {!gameStarted && signInNeeded && (
              <>
                <div
                  style={{
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0, 0, 0, 0.7)',
                    position: 'fixed',
                    zIndex: '999999999999999999',
                    top: 0,
                    left: 0,
                  }}
                >
                  <span
                    className={styles.link}
                    style={{
                      position: 'fixed',
                      left: '37%',
                      top: '45%',
                      textAlign: 'center',
                      fontSize: '25pt',
                      padding: '20px',
                    }}
                    onClick={async () => {
                      let auth = getAuth()
                      try {
                        let info = await signInWithPopup(
                          auth,
                          new GoogleAuthProvider(),
                        )
                        if (info.user) {
                          let db = getFirestore()
                          let userStoreDoc = await getDoc(
                            doc(db, info.user.uid, 'store'),
                          )
                          if (!userStoreDoc.exists()) {
                            await fetch(
                              `${window.location.protocol}//${window.location.hostname
                              }:1337/init?user=${await getIdToken(info.user)}`,
                            )
                          }
                          return true
                        } else {
                          return false
                        }
                      } catch (error) {
                        console.log(error.code)
                        switch (error.code) {
                          case 'auth/user-disabled':
                            alert('Not so fast! This account has been banned.')
                            break
                          default:
                            alert('There was an issue signing you in.')
                            break
                        }
                      }
                    }}
                  >
                    Log In with Google
                  </span>
                </div>
                <Component {...pageProps} controls={0} />
              </>
            )}
            {!gameStarted && !signInNeeded && <></>}
          </AnimatePresence>
        </div>
      </div>
      {typeof window == 'object' && (
        <>
          {window.localStorage.ddImmersiveMode != 'true' &&
            window.localStorage.ddTournamentMode != 'true' && (
              <p
                style={{
                  color: '#f9e300',
                  position: 'fixed',
                  bottom: 0,
                  right: '20px',
                  width: 'max-content',
                  textAlign: 'right',
                  pointerEvents: 'none',
                  zIndex: 99999999999999999999,
                }}
              >
                {'V'}{require('../package.json').version}{' on '}
                {navigator.userAgent.includes('Mac')
                  ? 'Mac'
                  : navigator.userAgent.includes('Windows')
                    ? 'Windows'
                    : 'Other'}
              </p>
            )}
        </>
      )}
    </>
  )
}

export default function DDApp({ Component, pageProps }) {
  return (
    <>
      {typeof window == 'object' && (
        <>
          {window.innerWidth > 1000 && (
            <>
              <DragonDungeon Component={Component} pageProps={pageProps} />
            </>
          )}
          {window.innerWidth < 1000 && (
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <h1>DragonDungeon</h1>
              <h2>
                Your screen is too small to play DragonDungeon. Please rotate
                your display to landscape or switch to a computer, then reload
                this page.
              </h2>
            </div>
          )}
        </>
      )}
    </>
  )
}
