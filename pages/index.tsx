import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'

import styles from 'styles/index.module.css'

function MenuOption(props) {
  let router = useRouter()
  return <div className={styles.link} onClick={() => router.push(props.href)}>{props.name}</div>
}

export default function Home() {
  let [ name, setName ] = useState<string>('Dragon0000')
  let [ profilePicture, setProfilePicture ] = useState<string>('/img/game/coinJar.png')

  useMemo(() => {
    let auth = getAuth()
    let authUnsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setName(user.displayName)
        setProfilePicture(user.photoURL)
      }
    })
  
    authUnsub()
  }, [])

  return (
    <div className={styles.home}>
      <div style={{ padding: '20px' }}>
        <h1>DRAGON DUNGEON</h1>
        <img src="/img/game/skull.png" className={styles.heroImage} style={{ transform: 'scaleX(-1)' }} />
        <h2><img src={profilePicture} style={{ verticalAlign: 'middle', height: '50px' }} />&nbsp;&nbsp;&nbsp;{name}</h2>
      </div>
      <MenuOption name="Play" href="/play" />
      <MenuOption name="Profile" href="/profile" />
      {/* <MenuOption name="Options" href="/options" /> */}
      <MenuOption name="Credits" href="/credits" />
    </div>
  )
}
