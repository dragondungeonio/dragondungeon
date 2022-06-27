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
        {typeof window !== "undefined" && <>
          {window.localStorage.ddTournamentMode !== 'true' && <h1>DragonDungeon</h1>}
          {window.localStorage.ddTournamentMode == 'true' && <h1>DragonDungeon Live!</h1>}
        </>}
        {typeof window !== "undefined" && <>
          {window.localStorage.ddTournamentMode !== 'true' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}>
            <ModeItem description="Fight dragons. Collect coins." name="Arena" img="/assets/img/game/coinJar.png" href="/play/arena" router={router} />
            <ModeItem description="Defend your base. Capture coins." name="Capture" img="/assets/img/game/skull.png" href="/play/ctc" router={router} />
            <ModeItem description="Capture and defend zones." name="Zones" img="/assets/img/game/bat.png" href="/play/zones" router={router} />
            <ModeItem description="Become the Last Dragon Standing." name="Survival" img="/assets/img/skins/basic.png" href="/play/lds" router={router} />
            <ModeItem description="A secret mode awaits...." name="[REDACTED]" img="/assets/img/prompts/mnk/Question_Key_Dark.png" href="#" router={router} />
            <ModeItem description="Learn the ropes." name="Tutorial" img="/assets/img/ui/queststep.png" href="/play/tutorial" router={router} />
          </div>}
          {window.localStorage.ddTournamentMode == 'true' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}>
            <ModeItem name="Tutorial" img="/assets/img/prompts/mnk/T_Key_Dark.png" href="/play/tutorial" router={router} />
            <ModeItem name="Dragon" img="/assets/img/prompts/mnk/D_Key_Dark.png" href="/profile" router={router} />
            <ModeItem name="Credits" img="/assets/img/prompts/mnk/C_Key_Dark.png" href="/credits" router={router} />

            <ModeItem description="Game I" name="Round I" img="/assets/img/game/bat.png" href="/play/tarena" router={router} />
            <ModeItem description="Game II" name="Round I" img="/assets/img/game/bat.png" href="/play/tarena" router={router} />
            <ModeItem description="Game III" name="Round I" img="/assets/img/game/bat.png" href="/play/tarena" router={router} />

            <ModeItem description="Game I" name="Round II" img="/assets/img/game/coinJar.png" href="/play/tzones" router={router} />
            <ModeItem description="Game II" name="Round II" img="/assets/img/game/coinJar.png" href="/play/tzones" router={router} />
            <ModeItem description="Game III" name="Round II" img="/assets/img/game/coinJar.png" href="/play/tzones" router={router} />

            <ModeItem description="Game I" name="Round III" img="/assets/img/game/skull.png" href="/play/tctc" router={router} />
            <ModeItem description="Game II" name="Round III" img="/assets/img/game/skull.png" href="/play/tctc" router={router} />
            <ModeItem description="Game III" name="Round III" img="/assets/img/game/skull.png" href="/play/tctc" router={router} />

            <ModeItem description="Game I" name="Round IV" img="/assets/img/skins/basic.png" href="/play/tlds" router={router} />
            <ModeItem description="Game II" name="Round IV" img="/assets/img/skins/basic.png" href="/play/tlds" router={router} />
            <ModeItem description="Game III" name="Round IV" img="/assets/img/skins/basic.png" href="/play/tlds" router={router} />
          </div>}
        </>}
      </div>
    </PageLayout>
  )
}
