import { useRouter } from 'next/router'

import styles from '../styles/index.module.css'

export default function Credits() {
  let router = useRouter()
  return (
    <div className={styles.home} style={{ padding: '20px' }}>
      <img src="/img/game/coinJar.png" className={styles.heroImage} />
      <h2>Controls</h2>
      <p>
        Press <i>space</i> to shoot a fireball
      </p>
      <p> Your dragon will follow the direction of your cursor </p>
      <h2>How to Play</h2>
      <h3> Classic </h3>
      <p>
        There are many coins spread across the map. The goal of the game is to
        take coins and return them to the coinjar in the center of the game. You
        can also shoot fireballs to kill, push, or steal coins from other
        dragons. Your score will be updated whenever you place coins in the
        coinjar.
      </p>
    </div>
  )
}
