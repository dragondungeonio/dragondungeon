import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'

import styles from 'styles/menu.module.css'

function MenuOption(props) {
  let router = useRouter()
  return <div className={styles.link} onClick={() => router.push(props.href)}>{props.name}</div>
}

export default function Profile() {
  let [ user, setUser ] = useState<any>('')

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
    <div className={styles.pageContent}>
      <div style={{ padding: '20px' }}>
        <h1>My Dragon</h1>
        <img src="/img/dragons/basicDragon.png" className={styles.heroImage} />
      </div>
      <MenuOption name="&larr;" href="/profile" />
      <MenuOption name="Appearance" href="/profile/dragon/appearance" />
      <MenuOption name="Abilities" href="/profile/dragon/abilities" />
    </div>
  )
}
