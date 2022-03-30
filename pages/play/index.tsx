import { useRouter } from 'next/router'
import styles from '../../styles/menu.module.css'

function ModeItem(props) {
    return <div className={styles.borderSliceApplied} style={{ border: `5px solid ${props.color}`, padding: '20px', width: '160px' }} onClick={() => { props.router.push(props.href) }}>
      <img src={props.img} alt={props.name} style={{ imageRendering: 'pixelated', height: '32px' }} /><br /><br />
      {props.name}<br /><br /><i>{props.requirement}</i>
    </div>
}

function ModeCategory(props) {
    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>{props.children}</div>
}

export default function ModeSelect() {
  let router = useRouter()

  return (
    <div className={styles.pageContent}>
      <h1>Play</h1>
      <h2>Classic</h2>
      <ModeCategory>
          <ModeItem name="Arena" img="/img/dragons/basicDragon.png" color="red" requirement="Beta" href="/play/arena" router={router} />
      </ModeCategory>
      <h2>Multiplayer</h2>
      <ModeCategory>
          <ModeItem name="Capture The Coins" img="/img/game/coinJar.png" color="#00a1de" requirement="Requires purchase" router={router} />
      </ModeCategory>
      <h2>Campaign</h2>
      <h3>2022 Annual Pass</h3>
      <ModeCategory>
          <ModeItem name="The Landing" img="/img/game/icon.png" color="#009b3a" requirement="Coming Soon" router={router} />
          <ModeItem name="The Danger" img="/img/game/skull.png" color="#009b3a" requirement="Requires Annual Pass" router={router} />
          <ModeItem name="The Control" img="/img/game/bat.png" color="#009b3a" requirement="Requires Annual Pass" router={router} />
      </ModeCategory>
    </div>
  )
}
