import { Room } from 'colyseus.js'
import React, { useMemo, useState } from 'react'
import { GameState } from '../../common'
import { ColyseusService } from '../../lib/colyseus'
import { StateManager } from '../state/StateManager'
import { GameView } from './GameView'
import { MapSchema } from '@colyseus/schema'
import { Player } from 'common'

let stateManager = new StateManager(
  new ColyseusService(window.location.protocol == 'http:' ? 'ws': 'wss', window.location.hostname + ':1337'),
  'random',
)

function renderTableData(players: MapSchema<Player>) {
  let leaderboardData = []
  players.forEach((player: Player, key: any) => {
      const score = player.score;
      let name = player.onlineName;
      const ballType = player.ballType;
      leaderboardData.push(<tr key={key}>
          <td style={{ padding: '10px' }} className="playerData"><img src={`/img/abilities/${ballType}ball.png`} style={{ height: '30px' }} /></td>
          <td style={{ padding: '10px' }} className="playerData">{name}</td>
          <td style={{ padding: '10px' }} className="playerData"><b><big>{score}</big></b></td>
      </tr>)
  })
  return leaderboardData
}

export default function CoreView() {
  const [room, setRoom] = useState<Room<GameState> | null>(null)
  const [state, setState] = useState<GameState | null>(null)
  const [gameOver, setGameOver] = useState<boolean>(false)

  useMemo(() => {
    let ref

    stateManager.getGameRoom.then(() => {
      ref = stateManager.room.onStateChange(newState => {
        setGameOver(newState.gameOver)
        setState(newState)
      })
    })

    return () => {
      ref.clear()
    };
  }, [])

  if (state == null) {
    return (
      <div style={{ textAlign: 'center' }}>
        <br /><br /><br />
        <img style={{ textAlign: 'center', height: '150px', imageRendering: 'pixelated' }} src="/img/dragons/basicDragon.png" />
      </div>
    )
  }

  if (gameOver) {
    return (
      <div style={{ padding: '30px' }}>
        <h1>Game Over</h1>
        <table><tbody id='leaderboard'>{renderTableData(state.players)}</tbody></table>
      </div>
    )
  }

  return <GameView stateManager={stateManager} state={state} />
}
