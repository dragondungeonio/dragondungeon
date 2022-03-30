import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore/lite'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'

import styles from 'styles/menu.module.css'

function MenuOption(props) {
  let router = useRouter()
  return (
    <div className={styles.link} onClick={() => router.push(props.href)}>
      {props.name}
    </div>
  )
}

function MenuOptionSkin(props) {
  let className = props.selected
    ? `${styles.link} ${styles.selected}`
    : styles.link
  return (
    <div
      className={className}
      onClick={() => {
        setSkin(props.name.toLowerCase(), props.user)
        props.setSkin(props.name.toLowerCase())
      }}
      onMouseEnter={() => previewSkin(props.name.toLowerCase() + 'Dragon')}
    >
      {props.name}
    </div>
  )
}

async function setSkin(skin, user) {
  let db = getFirestore()
  let userInfoRef = doc(db, user, 'gameplay')
  await setDoc(userInfoRef, { dragonSkin: skin }, { merge: true })
}

function previewSkin(skin) {
  ;(
    document.querySelector('#skinhero') as HTMLImageElement
  ).src = `/img/dragons/${skin}.png`
}

export default function Appearance() {
  let [user, setUser] = useState<any>('')
  const [currentSkin, setSkin] = useState('')
  useMemo(() => {
    let auth = getAuth()
    let authUnsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      }
    })

    authUnsub()
    if (user) {
      const db = getFirestore()
      getDoc(doc(db, user.uid, 'gameplay')).then((userData) => {
        setSkin(userData.data().dragonSkin)
      })
    }
  }, [user])

  return (
    <div className={styles.pageContent}>
      <div style={{ padding: '20px' }}>
        <h1>Appearance</h1>
        <img
          src="/img/dragons/basicDragon.png"
          id="skinhero"
          className={styles.heroImage}
        />
      </div>
      <MenuOption name="&larr;" href="/profile/dragon" />
      <MenuOptionSkin
        name="Basic"
        user={user.uid}
        selected={currentSkin === 'basic'}
        setSkin={setSkin}
      />
      <MenuOptionSkin
        name="Gold"
        user={user.uid}
        selected={currentSkin === 'gold'}
        setSkin={setSkin}
      />
      <MenuOptionSkin
        name="Light"
        user={user.uid}
        selected={currentSkin === 'light'}
        setSkin={setSkin}
      />
    </div>
  )
}
