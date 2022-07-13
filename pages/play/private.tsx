import { PageLayout } from 'components'
import { useRouter } from 'next/router'
import styles from 'styles/menu.module.css'

function ModeItem(props) {
  return <div style={{ padding: '20px', width: '160px', textAlign: 'center' }} onClick={() => { if (props.href) { props.router.push(props.href) } }}>
    <img src={props.img} alt={props.name} style={{ imageRendering: 'pixelated', height: '50px' }} />
    <br /><br />
    <span style={{ fontSize: '20pt' }}>{props.name}</span><br /><br />
    {props.description && <span style={{ color: '#f9e300' }}>{props.description}</span>}
  </div>
}

export default function Home() {
  let router = useRouter()

  return (
    <PageLayout>
      <div className={styles.centeredContent}>
        <h1>Private Match</h1>
        <br /><br />
        <h2>New Match</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
            <ModeItem description="Fight dragons. Collect coins." name="Arena" img="/assets/img/game/coinJar.png" href="/play/arena" router={router} />
            <ModeItem description="Defend your base. Capture coins." name="Capture" img="/assets/img/game/skull.png" href="/play/ctc" router={router} />
            <ModeItem description="Capture and defend zones." name="Zones" img="/assets/img/game/bat.png" href="/play/zones" router={router} />
            <ModeItem description="Become the Last Dragon Standing." name="Survival" img="/assets/img/skins/basic.png" href="/play/lds" router={router} />
        </div>
        <br /><br />
        <h2>Join Match</h2>
        <input type="text" style={{ background: 'transparent', color: 'white', border: '3px solid red', padding: '10px', borderRadius: '10px', fontSize: '14pt' }} id="matchID" />
        &nbsp;&nbsp;
        <button onClick={() => {
            router.push(`/play/${(document.getElementById('matchID') as HTMLInputElement).value}`)
        }} style={{ background: 'transparent', color: 'white', border: '3px solid white', padding: '10px', borderRadius: '5px', fontSize: '14pt' }}>Join</button>
      </div>
    </PageLayout>
  )
}
