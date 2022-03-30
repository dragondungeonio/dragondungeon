import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore/lite'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'

import styles from 'styles/menu.module.css'

function MenuOption(props) {
  let router = useRouter()
  return <div className={styles.link} onClick={() => router.push(props.href)}>{props.name}</div>
}

export default function Stats() {
  let [ user, setUser ] = useState<any>('')
  let [ stats, setStats ] = useState<any>('')

  useMemo(() => {
    let auth = getAuth()
    let authUnsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        let db = getFirestore()
        let userStatsRef = doc(db, currentUser.uid, 'stats')
        let userStats = await getDoc(userStatsRef)
        setStats(userStats.data())
      }
    })

    authUnsub()
  }, [])

  return (
    <div className={styles.pageContent}>
      <div style={{ padding: '20px' }}>
        <h1>Stats</h1>
        <img src={user.photoURL} className={styles.heroImage} />
      </div>
      <MenuOption name="&larr;" href="/profile" />
      <MenuOption name={user.displayName} href="" />
      <MenuOption name={`Level ${stats.level}`} href="" />
      <MenuOption name={`Coins: ${stats.coins}`} href="" />
      <MenuOption name={`Fireballs: ${stats.fireballs}`} href="" />
    </div>
  )
}
