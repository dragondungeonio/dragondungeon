import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore/lite'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'

import styles from 'styles/menu.module.css'

function MenuOption(props) {
  let router = useRouter()
  return (
    <div className={styles.link} onClick={() => router.push(props.href)}>
      {props.name}
    </div>
  )
}

function MenuOptionBallType(props) {
  let className = props.selected
    ? `${styles.link} ${styles.selected}`
    : styles.link
  return (
    <div
      className={className}
      onClick={() => {
        setBallType(props.name.toLowerCase(), props.user)
        props.setBall(props.name.toLowerCase().replace('ball', ''))
      }}
      onMouseEnter={() => previewBallType(props.name.toLowerCase())}
    >
      {props.name}
    </div>
  )
}

async function setBallType(ball, user) {
  let db = getFirestore()
  let userInfoRef = doc(db, user, 'gameplay')
  await setDoc(
    userInfoRef,
    { ballType: ball.replace('ball', '') },
    { merge: true },
  )
}

function previewBallType(ball) {
  ;(
    document.querySelector('#ballhero') as HTMLImageElement
  ).src = `/img/abilities/${ball}.png`
}

export default function Abilities() {
  let [user, setUser] = useState<any>('')
  const [currentBall, setBall] = useState('')
  useMemo(() => {
    let auth = getAuth()
    let authUnsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      }
    })

    authUnsub()
    console.log('User id', user.id)
    if (user) {
      const db = getFirestore()
      getDoc(doc(db, user.uid, 'gameplay')).then((userData) => {
        setBall(userData.data().ballType)
      })
    }
  }, [user])

  return (
    <div className={styles.pageContent}>
      <div style={{ padding: '20px' }}>
        <h1>Abilities</h1>
        <img
          src="/img/abilities/fireball.png"
          id="ballhero"
          className={styles.heroImage}
        />
      </div>
      <MenuOption name="&larr;" href="/profile/dragon" />
      <MenuOptionBallType
        name="Fireball"
        user={user.uid}
        selected={currentBall === 'fire'}
        setBall={setBall}
      />
      <MenuOptionBallType
        name="Electricball"
        user={user.uid}
        selected={currentBall === 'electric'}
        setBall={setBall}
      />
      <MenuOptionBallType
        name="Iceball"
        user={user.uid}
        selected={currentBall === 'ice'}
        setBall={setBall}
      />
      <MenuOptionBallType
        name="Mudball"
        user={user.uid}
        selected={currentBall === 'mud'}
        setBall={setBall}
      />
      <MenuOptionBallType
        name="Poisonball"
        user={user.uid}
        selected={currentBall === 'poison'}
        setBall={setBall}
      />
    </div>
  )
}
