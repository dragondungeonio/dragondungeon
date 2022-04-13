import { Player } from 'common'
import { MapSchema } from '@colyseus/schema'
import { Box } from 'components'

import styles from 'styles/leaderboard.module.css'
import { useEffect, useState } from 'react'
import { v4 } from 'uuid'
function renderTableData(players: MapSchema<Player>) {

 // let leaderboardData = []
  let redScore = 0
  let blueScore = 0
  players.forEach((player: Player, key: any) => {
    const score = player.score
    if (player.team == 1){
        redScore += score
    }
    else if(player.team == 2){
        blueScore += score
    }
  })
 
    console.log("leaderboard", "redScore: "+redScore+"  blueScore: "+blueScore)
  return <span key = {v4()}> {redScore} | {blueScore} </span>
}

function renderMobileTableData(players: MapSchema<Player>) {
  let leaderboardData = []
  players.forEach((player: Player, key: any) => {
    const score = player.score
    let name = player.onlineName
    const ballType = player.ballType
    leaderboardData.push(
      <span key={key} style={{ color: 'white' }}>
        <span className="playerData">{name}</span>&nbsp;&nbsp;
        <b className="playerData" style={{ fontSize: '25px'}}>
          {score}
        </b>
      </span>,
    )
  })
  return leaderboardData
}

export function CTCLeaderboard(props: {
  players: MapSchema<Player>
}) {
  const [players, setPlayerState] = useState<MapSchema<Player>>(props.players)

  return (
    <>
      <p className={styles.mobileCountdown}></p>
      {window.innerWidth >= 1000 && (
        <>
          <div id="chatlog" className={styles.CTCboard}></div>
          <div className={styles.CTCboard}>
            {renderTableData(props.players)}
            
          </div>
        </>
      )}

      {window.innerWidth <= 1000 && (
        <>
          <div
            id="chatlog"
            className={styles.CTCboard}
            style={{ display: 'none' }}
          ></div>
          <Box>{renderMobileTableData(players)}</Box>
        </>
      )}
    </>
  )
}
