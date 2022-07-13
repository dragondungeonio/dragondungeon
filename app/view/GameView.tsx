import React, { Component } from 'react'
import { StateManager } from '../state/StateManager'
import { Controls } from 'app/controls'
import { IInputs, Player } from 'common'
import { render } from 'react-pixi-fiber'
import * as PIXI from 'pixi.js'
import { v4 } from 'uuid'

import { Viewport } from 'pixi-viewport'

import { GameState } from 'common'
import { Dragon, TeamOrb } from './entities/dragon/index'
import { MovingBackground } from './entities/movingBackground'
import { Coin } from './entities/coin'
import { Wall } from './entities/wall'
import { CoinJar } from './entities/coinJar'
import { Bar } from './entities/healthBar/healthBar'
import { Leaderboard } from 'components'
import { Skull } from './entities/skull'
import Router from 'next/router'

let dragonCelebrating = false
let SFXPlayTimeout = false

interface GameViewProps {
  stateManager: StateManager
  state: GameState
  controls: number
}

interface GameViewState {
  showMusicElement: boolean
  music: HTMLAudioElement
}

export class GameView extends Component<GameViewProps, GameViewState> {
  app!: PIXI.Application
  gameCanvas!: HTMLDivElement
  viewport!: Viewport

  chatlogClearInt!: NodeJS.Timeout

  constructor(props) {
    super(props)
    this.state = { showMusicElement: true, music: new Audio() }
  }
  /**
   * After mounting, add the Pixi Renderer to the div and start the Application.
   */
  componentDidMount() {
    this.app = new PIXI.Application({
      resizeTo: window,
      antialias: false,
      backgroundAlpha: 0,
    })
    this.setState({ showMusicElement: true })
    this.gameCanvas!.appendChild(this.app.view)
    this.viewport = new Viewport()
    if (window.localStorage.ddSpectatorMode == 'true') {
      this.viewport.zoom(5000)
    }
    this.app.stage.addChild(this.viewport)
    this.app.start()
    this.app.ticker.add(() => this.renderScene())

    this.props.stateManager.room.onMessage('music', (musicURL) => {
      const music = new Audio(musicURL)
      music.loop = true
      if (window.localStorage.musicVolume) {
        music.volume = parseFloat(window.localStorage.musicVolume)
      } else {
        music.volume = 0.4
      }
      music.play()
      this.setState({ ...this.state, music })
    })

    this.props.stateManager.room.onMessage('sfx', (audioURL) => {
      if (audioURL == '/assets/audio/coinjar.wav') {
        dragonCelebrating = true
      }
      if (
        !SFXPlayTimeout ||
        audioURL == '/assets/audio/coin.wav' ||
        audioURL == '/assets/audio/coinjar.wav' ||
        audioURL == '/assets/audio/error.wav'
      ) {
        SFXPlayTimeout = true
        let sfx = new Audio(audioURL)
        if (window.localStorage.sfxVolume) {
          sfx.volume = parseFloat(window.localStorage.sfxVolume)
        } else {
          sfx.volume = 1
        }
        sfx.play()
        setTimeout(() => (SFXPlayTimeout = false), 1000)
      }
      setTimeout(() => (dragonCelebrating = false), 1000)
    })

    this.props.stateManager.room.onMessage('chatlog', (chatMessage) => {
      if (document.querySelector('#chatlog')) {
        ;(document.querySelector('#chatlog') as any).style.display = 'block'
        document.querySelector('#chatlog').innerHTML = chatMessage
        this.chatlogClearInt = setTimeout(
          () =>
            ((document.querySelector('#chatlog') as any).style.display =
              'none'),
          5000,
        )
      }
    })
    setTimeout(() => this.setState({ showMusicElement: false }), 10_000)
    this.props.stateManager.room.onLeave(() => {
      Router.push('/')
    })
  }

  renderScene() {
    let dragons = []
    let tiles = []
    let walls = []
    let coins = []
    let hudBars = []
    let skulls = []
    let coinJars = []

    this.props.state.skulls.forEach((skull, key) => {
      skulls.push(
        <Skull
          x={skull.x}
          y={skull.y}
          rot={skull.angle}
          key={key.toString()}
        />,
      )
    })

    this.props.state.walls.forEach((wall) => {
      const factor = 6
      for (let i = 0; i < factor; i++) {
        const newLen = wall.xLength / factor
        if (!wall.isRotated) {
          walls.push(
            <Wall
              x={newLen * i + wall.x}
              y={wall.y}
              xLength={newLen}
              yLength={wall.yLength}
              angle={wall.angle}
              team={wall.team}
              health={wall.health}
            />,
          )
        } else {
          walls.push(
            <Wall
              x={wall.x}
              y={newLen * i + wall.y}
              xLength={newLen}
              yLength={wall.yLength}
              angle={wall.angle}
              team={wall.team}
              health={wall.health}
            />,
          )
        }
      }
    })

    const id = this.props.stateManager.room.sessionId
    const me = this.props.state.players[id]

    if (this.props.state.npcs) {
      this.props.state.npcs.forEach(npc => {
        dragons.push(
          <Dragon
            player={npc}
            key={v4()}
            team={0}
            skin={0}
            celebration={true}
            isGhost={false}
            isMe={true}
            turbo={false}
          />,
        )
        const BetterBar = Bar as any
        hudBars.push(
          <BetterBar
            key={v4()}
            health={npc.health}
            x={npc.x - 35}
            y={npc.y - 80}
            width={70}
            team={0}
            height={18}
            color={0xe30b1d}
            coins={npc.coins}
            name={'Dragon'}
            turbo={false}
            nullAndVoid={false}
          />,
        )
      })
    }

    this.props.state.players.forEach((player) => {
      if (player == me) {
        dragons.push(
          <Dragon
            player={player}
            key={player.onlineID}
            team={player.team}
            skin={player.skinType}
            celebration={dragonCelebrating || player.turboMode}
            isGhost={player.isGhost}
            isMe={true}
            turbo={player.turboMode}
          />,
        )
      } else {
        dragons.push(
          <Dragon
            player={player}
            key={player.onlineID}
            team={player.team}
            skin={player.skinType}
            celebration={player.turboMode}
            isGhost={player.isGhost}
            isMe={true}
            turbo={player.turboMode}
          />,
        )
      }
      if (window.localStorage.ddImmersiveMode != 'true') {
        const BetterBar = Bar as any
        hudBars.push(
          <BetterBar
            key={v4()}
            health={player.health}
            x={player.x - 35}
            y={player.y - 80}
            width={70}
            team={player.team}
            height={18}
            color={0xe30b1d}
            coins={player.coins}
            name={player.onlineName}
            turbo={player.turboMode}
            nullAndVoid={player.mod === 101}
          />,
        )
      }
    })

    //moves the center of the viewport to the player
    if (
      me !== null &&
      this.viewport !== null &&
      window.localStorage.ddSpectatorMode != 'true'
    ) {
      try {
        this.viewport.x = -me.x + window.innerWidth / 2
        this.viewport.y = -me.y + window.innerHeight / 2
      } catch {}
    }

    if (window.localStorage.ddSpectatorMode == 'true') {
      this.viewport.x = 400
      this.viewport.y = 200
    }

    var tileAmt = 19
    var midpoint = this.props.state.gamewidth / 2
    for (var i = 0; i < tileAmt; i++) {
      for (var j = 0; j < tileAmt; j++) {
        if (typeof me !== 'undefined') {
          tiles.push(
            <MovingBackground
              map={'classic'}
              key={`${i}-${j}`}
              x={(me.x - midpoint) / 2 + i * 177 * 1.2 - (177 * 1.2 * 5) / 7}
              y={(me.y - midpoint) / 2 + j * 177 * 1.2 - (177 * 1.2 * 5) / 7}
            />,
          )
        }
      }
    }

    const xLen = 455.625
    const xLenInner = 455.625
    const yLen = 90
    //outer
    for (var i = 0; i < 7; i++) {
      walls.push(
        <Wall
          x={i * xLen - yLen}
          y={-yLen}
          xLength={xLen}
          yLength={yLen}
          angle={0}
          team={0}
          health={10}
        />,
      )
      walls.push(
        <Wall
          x={i * xLen - yLen}
          y={this.props.state.gameheight}
          xLength={xLen}
          yLength={yLen}
          angle={0}
          team={0}
          health={10}
        />,
      )
      walls.push(
        <Wall
          x={0}
          y={i * xLen}
          xLength={xLen}
          yLength={yLen}
          angle={Math.PI / 2}
          team={0}
          health={10}
        />,
      )
      walls.push(
        <Wall
          x={this.props.state.gamewidth + yLen}
          y={i * xLen}
          xLength={xLen}
          yLength={yLen}
          angle={Math.PI / 2}
          team={0}
          health={10}
        />,
      )
    }
    //top right
    //walls.push(<Wall x={this.props.state.gamewidth/2 + 240} y={this.props.state.gameheight/2 - 240} xLength ={xLenInner} yLength = {yLen} angle = {-Math.PI/2} />)
    //walls.push(<Wall x={this.props.state.gamewidth/2 + 240} y={this.props.state.gameheight/2 - 280} xLength ={xLenInner} yLength = {yLen} angle = {0} />)
    //bottom right
    //walls.push(<Wall x={this.props.state.gamewidth/2 + 240} y={this.props.state.gameheight/2 + 240} xLength ={xLenInner} yLength = {yLen} angle = {0}/>)
    //walls.push(<Wall x={this.props.state.gamewidth/2 + 280} y={this.props.state.gameheight/2 + 240} xLength ={xLenInner} yLength = {yLen} angle = {Math.PI/2}/>)
    //bottom left
    //walls.push(<Wall x={this.props.state.gamewidth/2 - 240} y={this.props.state.gameheight/2 + 280} xLength ={xLenInner} yLength = {yLen} angle = {Math.PI}/>)
    //walls.push(<Wall x={this.props.state.gamewidth/2 - 240} y={this.props.state.gameheight/2 + 240} xLength ={xLenInner} yLength = {yLen} angle = {Math.PI/2}/>)
    //top left
    //walls.push(<Wall x={this.props.state.gamewidth/2 - 240} y={this.props.state.gameheight/2 - 240} xLength ={xLenInner} yLength = {yLen} angle = {Math.PI}/>)
    //walls.push(<Wall x={this.props.state.gamewidth/2 - 280} y={this.props.state.gameheight/2 - 240} xLength ={xLenInner} yLength = {yLen} angle = {-Math.PI/2}/>)

    if (this.props.state.coins.size !== 0) {
      this.props.state.coins.forEach((coin, cid) => {
        coins.push(
          <Coin
            key={cid}
            x={coin.x}
            y={coin.y}
            size={coin.size}
            team={coin.team}
          />,
        )
      })
    }

    this.props.state.coinJars.forEach((coinJar) => {
      coinJars.push(
        <CoinJar x={coinJar.x} y={coinJar.y} key={v4()} team={coinJar.team} />,
      )
    })

    render(
      <>
        {tiles}
        {walls}
        {coins}
        {coinJars}
        {hudBars}
        {dragons}
      </>,
      this.viewport,
    )
  }

  /**
   * Stop the Application when unmounting.
   */
  componentWillUnmount() {
    this.app.stop()
  }

  actionCallback(v: IInputs) {
    this.props.stateManager.room?.send('input', v)
  }

  /**
   * Simply render the div that will contain the Pixi Renderer.
   */

  render() {
    let component = this
    return (
      <>
        <Controls
          actionCallback={(v: IInputs) => this.actionCallback(v)}
          viewport={this.viewport}
          scheme={this.props.controls}
        />
        <div style={{ marginLeft: '3vw', display: 'flex' }}>
          <Leaderboard
            players={this.props.state.players}
            countdown={this.props.state.countdown}
            isCTC={this.props.state.gamemode == 'CTC' ? true : false}
            isZones={this.props.state.gamemode == 'Zones' ? true : false}
            coinJars={this.props.state.coinJars}
          ></Leaderboard>
        </div>
        <div
          ref={(thisDiv) => {
            component.gameCanvas = thisDiv!
          }}
        />
      </>
    )
  }
}
