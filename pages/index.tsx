import { useRouter } from 'next/router'
import styles from 'styles/menu.module.css'

function MenuOption(props) {
  let router = useRouter()
  return (
    <div className={styles.link} onClick={() => router.push(props.href)}>
      {props.name}
    </div>
  )
}

export default function Home() {
  let router = useRouter()

  return (
    <div className={styles.pageContent}>
      <div style={{ padding: '20px' }}>
        <h1 style={{ fontSize: '30pt' }}>DRAGON DUNGEON</h1>
        <img
          src="/img/game/skull.png"
          className={styles.heroImage}
          style={{ height: 150, imageRendering: 'pixelated' }}
          alt="Skull"
        /><br /><br /><br />
        <span style={{ color: '#f9e300', fontSize: '20pt', border: '5px solid #f9e300', padding: '10px' }} onClick={() => router.push('/play')}>Play</span>
      </div>
    </div>
  )
}
