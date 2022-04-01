import { useRouter } from 'next/router'
import styles from '../../styles/menu.module.css'

function ModeItem(props) {
    return <div style={{ border: `5px solid ${props.color}`, padding: '20px', width: '160px', textAlign: 'center' }} onClick={() => { props.router.push(props.href) }}>
      <img src={props.img} alt={props.name} style={{ imageRendering: 'pixelated', height: '50px' }} />
      <br /><br />
      <span style={{ fontSize: '20pt' }}>{props.name}</span>
    </div>
}

export default function ModeSelect() {
  let router = useRouter()

  return (
    <div className={styles.pageContent}>
      <h1>Play</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
          <ModeItem name="Arena (Beta)" img="/img/dragons/basicDragon.png" color="red" href="/play/arena" router={router} />
          <p>More modes coming soon...</p>
          {/* <ModeItem name="Capture" img="/img/game/coinJar.png" color="#00a1de" href="/play/ctc" router={router} /> */}
          {/* <ModeItem name="Annual Pass" img="/img/game/skull.png" color="#009b3a" href="/play/ap22" router={router} /> */}
      </div>
    </div>
  )
}
