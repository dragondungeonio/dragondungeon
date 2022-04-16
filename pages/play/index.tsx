import { useRouter } from 'next/router'
import styles from '../../styles/menu.module.css'

function ModeItem(props) {
    return <div style={{ border: `5px solid ${props.color}`, padding: '20px', width: '160px', textAlign: 'center' }} onClick={() => { if (props.href) { props.router.push(props.href) } }}>
      <img src={props.img} alt={props.name} style={{ imageRendering: 'pixelated', height: '50px' }} />
      <br /><br />
      <span style={{ fontSize: '20pt' }}>{props.name}</span><br /><br />
      { !props.enabled && <span style={{ color: '#f9e300' }}>Coming soon...</span> }
    </div>
}

export default function ModeSelect() {
  let router = useRouter()

  return (
    <div className={styles.pageContent}>
      <h1>Play</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
          <ModeItem enabled={true} name="Arena (Beta)" img="/img/dragons/basicDragon.png" color="red" href="/play/arena" router={router} />
          <ModeItem enabled={false} name="Capture" img="/img/game/coinJar.png" color="#00a1de" router={router} />
          <ModeItem enabled={false} name="Annual Pass" img="/img/game/skull.png" color="#009b3a" router={router} />
      </div>
    </div>
  )
}
