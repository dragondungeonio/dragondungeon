import { useRouter } from 'next/router'
import styles from '../../styles/menu.module.css'

function QuestStep(props) {
    return <div style={{ border: `5px solid #c60c30`, padding: '20px', width: '160px', textAlign: 'center' }} onClick={() => { props.router.push(props.href) }}>
      <img src={props.img} alt={props.name} style={{ imageRendering: 'pixelated', height: '50px' }} />
      <br /><br />
      <span style={{ fontSize: '20pt' }}>{props.name}</span><br /><br />
      <span style={{ fontSize: '14pt' }}>{props.details}</span>
    </div>
}

export default function CampaignView() {
  let router = useRouter()

  return (
    <div className={styles.pageContent}>
      <h1>Campaign // Annual Pass 2022</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px' }}>
          <QuestStep name="Discovery" details="Investigate a mysterious intrusion into the castle." img="/img/ui/mission.png" href="/play/ap22discovery" router={router} />
          <QuestStep name="Ruin" details="Hear the story of the Skulls." img="/img/ui/cutscene.png" href="/play/cutscene?video=ap22/ruin" router={router} />
          <QuestStep name="Collection" details="Collect clues from Skulls in Arena mode." img="/img/ui/queststep.png" href="/play/arena" router={router} />
          <QuestStep name="Clues" details="Report your findings to the castle." img="/img/ui/mission.png" href="/play/ap22/clues" router={router} />
          <QuestStep name="Confrontation" details="Confront the leader of the Skulls." img="/img/ui/mission.png" href="/play/ap22-confrontation" router={router} />
          <QuestStep name="Wrap-up" details="Learn your lessons." img="/img/ui/cutscene.png" href="/play/cutscene?video=ap22/wrap" router={router} />
      </div>
    </div>
  )
}
