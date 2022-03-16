import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'

import styles from 'styles/index.module.css'

function MenuOption(props) {
  let router = useRouter()
  return (
    <div className={styles.link} onClick={() => router.push(props.href)}>
      {props.name}
    </div>
  )
}

export default function MyDragon() {
  let [user, setUser] = useState<any>('')

  useMemo(() => {
    let auth = getAuth()
    let authUnsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      }
    })

    authUnsub()
  }, [])

  return (
    <div className={styles.home}>
      <div style={{ padding: '20px' }}>
        <h1>Profile</h1>
        <img src={user.photoURL} className={styles.heroImage} />
      </div>
      <MenuOption name="&larr;" href="/" />
      <MenuOption name="Dragon" href="/profile/dragon" />
      <MenuOption name="Stats" href="/profile/stats" />
      <MenuOption name="Social" href="/profile/social" />
    </div>
  )
}
