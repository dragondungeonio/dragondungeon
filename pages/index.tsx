import { PageLayout } from 'components'
import { useRouter } from 'next/router'
import styles from 'styles/menu.module.css'

function ModeItem(props) {
  return <div style={{ padding: '20px', width: '160px', textAlign: 'center', cursor: 'pointer' }} onClick={() => { if (props.href) { props.router.push(props.href) } }}>
    {props.img && <img src={props.img} alt={props.name} style={{ imageRendering: 'pixelated', height: '50px' }} />}
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
        {typeof window !== "undefined" && <>
          {window.localStorage.ddTournamentMode !== 'true' && <h1>DragonDungeon<br /><br /><span style={{ color: '#f9e300', fontFamily: 'Varela Round', fontSize: '20pt' }}>Public Beta</span></h1>}
          {window.localStorage.ddTournamentMode == 'true' && <h1>DragonDungeon Live!</h1>}
        </>}
        {typeof window !== "undefined" && <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
            <ModeItem description="Capture coins. Defend your zones." name="Zones" img="/assets/img/game/coinJar.png" href="/play/zones" router={router} />
            <ModeItem description="A classic free-for-all arena." name="Arena" img="/assets/img/game/bat.png" href="/play/arena" router={router} />
            <ModeItem description="Defend your base. Take back your coins." name="Capture" img="/assets/img/game/skull.png" href="/play/ctc" router={router} />
            <ModeItem description="Become the Last Dragon Standing." name="Survival" img="/assets/img/skins/basic.png" href="/play/lds" router={router} />
            <ModeItem description="Play with your friends across all modes." name="Join By ID" href="/join" router={router} />
            <ModeItem description="Learn the ropes." name="Tutorial" href="/play/tutorial" router={router} />
            <ModeItem description="Learn the ropes." name="Dragon" href="/profile" router={router} />
            <ModeItem description="Learn the ropes." name="About" href="/about" router={router} />
          </div>
        </>}
      </div>
    </PageLayout>
  )
}
