import Head from 'next/head'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { AnimatePresence } from 'framer-motion'

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

export default function DragonDungeon({ Component, pageProps }) {
  let [gameStarted, setGameStarted] = useState<boolean>(false)
  let [user, setUser] = useState<any>()

  let router = useRouter()

  useMemo(async () => {
    if (typeof window !== undefined) {
      const onlineServices = initializeApp({
        apiKey: 'AIzaSyCRClPzTZnRSg_fAap6ENnAkxUBQKJGk5w',
        authDomain: 'leaguedragoncoin.firebaseapp.com',
        projectId: 'leaguedragoncoin',
        storageBucket: 'leaguedragoncoin.appspot.com',
        messagingSenderId: '320692217416',
        appId: '1:320692217416:web:f9cd0efdc04445865e9a7d',
      })

      if (typeof window == 'object') {
        try {
          let token = new URLSearchParams(window.location.search).get('user')
          let resp = await fetch(
            `${
              window.localStorage.ddAuthServer || 'https://lit.games'
            }/api/Platform/User/VerifyAuthToken?user=${token}`,
          )
          if (!resp.ok) {
            throw new Error(resp.statusText)
          }
          let userd = await resp.json()
          setUser({ ...userd.response, token })
          setGameStarted(true)
        } catch (error) {
          let loginInfo = await (
            await fetch(
              `${
                window.localStorage.ddAuthServer || 'https://lit.games'
              }/api/Platform/User/GetLoginURL?redirect=${
                window.location.protocol
              }//${window.location.host}${window.location.pathname}`,
            )
          ).json()
          window.location.href = loginInfo.response.loginURL
        }
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
        <meta
          name="viewport"
          content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi"
        />
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
                    <MenuOption name="About" href="/about" />
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
            {gameStarted && (
              <Component {...pageProps} user={user} controls={0} />
            )}
            {!gameStarted && (
              <div
                style={{
                  color: '#f9e300',
                  fontSize: '30pt',
                  padding: '20px',
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                }}
              >
                Contacting DragonDungeon Servers...
              </div>
            )}
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
                {'V'}
                {require('../package.json').version}
                {' on '}
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
