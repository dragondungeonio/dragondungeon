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
        <h1>dragondungeon.io</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
          <ModeItem description="Fight dragons. Collect coins." name="Arena" img="/img/skins/basic.png" href="/play/arena" router={router} />
          <ModeItem description="Defend your base. Capture coins." name="Capture" img="/img/game/coinJar.png" href="/play/ctc" router={router} />
          {/* <ModeItem description="Mix it up!" name="Random" img="/img/game/icon.png" href="/play" router={router} /> */}
          <ModeItem description="Learn the ropes!" name="Tutorial" img="/img/game/bat.png" href="/play/tutorial" router={router} />
        </div>
      </div>
    </PageLayout>
  )
}
