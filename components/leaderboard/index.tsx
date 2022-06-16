import { CoinJar, Player } from '../../common'
import { MapSchema } from '@colyseus/schema'
import { Countdown } from '../../common/Countdown'
import { Box } from '../../components'

import styles from 'styles/leaderboard.module.css'
import { ReactNode, useEffect, useState } from 'react'

import blueJarImg from '../../app/view/entities/coinJar/sprites/blueCoinJar1.png'
import redJarImg from '../../app/view/entities/coinJar/sprites/redCoinJar1.png'
import stdJarImg from '../../app/view/entities/coinJar/sprites/coinJar1.png'

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
        {/* <img src={`/assets/img/abilities/${ballType}ball.png`} style={{ height: '40px', verticalAlign: 'bottom' }} /> */}
        &nbsp;&nbsp;
        <span>{name}</span>&nbsp;&nbsp;
        <b>{score}</b>&nbsp;&nbsp;&nbsp;
      </span>,
    )
  })
  return leaderboardData
}

function renderTeamScores(players: MapSchema<Player>) {
  let redScore = 0
  let blueScore = 0
  let result = []

  players.forEach((player: Player, key: any) => {
    if (player.team == 1) {
      redScore += player.score

    }
    else if (player.team == 2) {
      blueScore += player.score
    }
  })
  result.push(
    <span className={styles.teamScore}><span className={styles.redScore}>{redScore}</span> | <span className={styles.blueScore}>{blueScore}</span></span>
  )
  return result
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

function renderZonesLeaderboard(coinJars: MapSchema<CoinJar> | any[]) {
  let onScreenJars: JSX.Element[] = []
  coinJars.forEach(jar => {
    switch (jar.team) {
      case 1:
        onScreenJars.push(<img src={redJarImg.src} height={50} />)
        break
      case 2:
        onScreenJars.push(<img src={blueJarImg.src} height={50} />)
        break
      default:
        onScreenJars.push(<img src={stdJarImg.src} height={50} />)
        break
    }
  })

  return onScreenJars
}

export function Leaderboard(props: {
  players: MapSchema<Player>
  countdown: Countdown
  isCTC?: boolean
  isZones?: boolean
  coinJars?: MapSchema<CoinJar>
}) {
  const {
    isCTC = false,
    isZones = false,
    coinJars = []
  } = props
  const [countdownRender, setCountdownState] = useState<String>('')
  const [players, setPlayerState] = useState<MapSchema<Player>>(props.players)
  useEffect(() => {
    let clockInterval = setInterval(() => {
      setCountdownState(renderCountdown(props.countdown))

    }, 100)
    return () => clearInterval(clockInterval)
  }, [])

  return (
    <>
      {props.countdown.minutes != 100000000000000 && (
        <p className={styles.countdown}>{countdownRender}</p>
      )}
      <>
        <div id="chatlog" className={styles.chatlog}></div>
        {(props.isCTC || props.isZones) && renderTeamScores(props.players)}
        {props.isZones && <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '5px'
        }}>{renderZonesLeaderboard(coinJars)}</div>}
        <div className={styles.leaderboardContainer}>
          <table>
            <tbody id="leaderboard">{renderTableData(props.players)}</tbody>
          </table>
        </div>
      </>
    </>
  )
}
