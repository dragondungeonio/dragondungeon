import { Player } from '../../common'
import { MapSchema } from '@colyseus/schema'
import { Countdown } from '../../common/Countdown'
import { Box } from '../../components'

import styles from 'styles/leaderboard.module.css'
import { ReactNode, useEffect, useState } from 'react'

function renderCountdown(countdown: Countdown) {
  if (countdown.done) {
    return '0:00'
  } else if (countdown.minutes == 100000000000000) {
    return ''
  } else {
    return `${countdown.minutes}:${Math.floor(countdown.seconds)
      .toString()
      .padStart(2, '0')}`
  }
}

function renderTableData(players: MapSchema<Player>) {
  let leaderboardData = []
  players.forEach((player: Player, key: any) => {
    const score = player.score
    let name = player.onlineName
    const ballType = player.ballType
    leaderboardData.push(
      <span>
        &nbsp;&nbsp;&nbsp;
        {/* <img src={`/img/abilities/${ballType}ball.png`} style={{ height: '40px', verticalAlign: 'bottom' }} /> */}
        &nbsp;&nbsp;
        <span>{name}</span>&nbsp;&nbsp;
        <b>{score}</b>&nbsp;&nbsp;&nbsp;
      </span>
    )
  })
  return leaderboardData
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
        <b className="playerData" style={{ fontSize: '25px' }}>
          {score}
        </b>
      </span>,
    )
  })
  return leaderboardData
}

export function Leaderboard(props: {
  players: MapSchema<Player>
  countdown: Countdown
  isCTC: boolean
}) {
  const [countdownRender, setCountdownState] = useState<String>('Loading...')
  const [players, setPlayerState] = useState<MapSchema<Player>>(props.players)
  useEffect(() => {
    let clockInterval = setInterval(() => {
      setCountdownState(renderCountdown(props.countdown))
    }, 100)
    return () => clearInterval(clockInterval)
  }, [])

  return (
    <>
      {props.countdown.minutes != 100000000000000 && <p className={styles.countdown}>{countdownRender}</p>}
      <>
        <div id="chatlog" className={styles.chatlog}></div>
        <div className={styles.leaderboardContainer}>
          <table>
            <tbody id="leaderboard">{renderTableData(props.players)}</tbody>
          </table>
        </div>
      </>
    </>
  )
}
