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
    <>
      <div className={styles.homeSelection} style={{ left: '0', borderRight: '10px solid #c60c30', zIndex: 999999, width: '49.4vw' }} >
        <img src="/img/game/icon.png" style={{ height: '250px', imageRendering: 'pixelated' }} onClick={() => router.push('/play/arena')} />
        <br /><br />
        <h1 style={{ fontSize: '40pt' }}>Play</h1>
        <p style={{ fontSize: '20pt' }}>Battle against other dragons in a variety of multiplayer and singleplayer modes.</p>
        <span className={styles.link} style={{ color: '#f9e300' }} onClick={() => router.push('/play/arena')}>Play (Arena)</span>
        {/* <span className={styles.link} onClick={() => router.push('/play')}>Other Modes</span> */}
      </div>
      <div className={styles.homeSelection} style={{ left: '50vw' }} >
        <img src="/img/skins/basic.png" style={{ height: '250px', imageRendering: 'pixelated' }} onClick={() => router.push('/profile')} />
        <br /><br />
        <h1 style={{ fontSize: '40pt' }}>Dragon</h1>
        <p style={{ fontSize: '20pt' }}>Suit up for battle with a special ability, and get new skins and modes from the Gem Store.</p>
        <span className={styles.link} onClick={() => router.push('/profile')}>Profile</span>
        <span className={styles.link} onClick={() => router.push('/store')}>Store</span>
        <span className={styles.link} onClick={() => router.push('/settings')}>Settings</span>
      </div>
    </>
  )
}
