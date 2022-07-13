import React, { useEffect, useCallback } from 'react'
import { IInputs } from '../../common'
import { Viewport } from 'pixi-viewport'
import ReactNipple from 'react-nipple'
import styles from '../../styles/leaderboard.module.css'

interface ControlProps {
  actionCallback: (p: IInputs) => void
  viewport: Viewport
  scheme: number
}

let activeControls = {
  left: false,
  up: false,
  right: false,
  down: false,
  shoot: false,
  autoshoot: false,
  angle: 0.0,
  space: false,
  turbo: false,
  zoneClaim: false,
}

export const Controls = (props: ControlProps) => {
  const actionCallback = props.actionCallback

  const updateAndSend = useCallback(
    (change: object) => {
      const updated = Object.assign({}, activeControls, change)

      actionCallback(updated)
      activeControls = updated
    },
    [actionCallback],
  )

  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if (props.scheme == 0) {
        if (e.key == ' ') {
          updateAndSend({ space: true, shoot: true })
        }
        if (e.key == 'x') {
          updateAndSend({ autoshoot: true })
        }
        if (e.key == 'v') {
          updateAndSend({ turbo: true })
        }
        if (e.key == 'c') {
          updateAndSend({ zoneClaim: true })
        }
      }
    }
    const keyup = (e: KeyboardEvent) => {
      if (props.scheme == 0) {
        if (e.key == ' ') {
          updateAndSend({ space: false, shoot: false })
        }
        if (e.key == 'x') {
          updateAndSend({ autoshoot: false })
        }
        if (e.key == 'v') {
          updateAndSend({ turbo: false })
        }
        if (e.key == 'c') {
          updateAndSend({ zoneClaim: false })
        }
      }
    }
    const mouseMove = (e: MouseEvent) => {
      try {
        if (props.scheme == 0) {
          const X = window.innerWidth / 2
          const Y = window.innerHeight / 2
          const change = { angle: -Math.atan2(X - e.x, Y - e.y) + Math.PI / 2 }
          updateAndSend(change)
        }
      } catch { }
    }

    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)
    window.addEventListener('mousemove', mouseMove)

    window.addEventListener('gamepadconnected', gamepadInputLoop)

    function gamepadInputLoop() {
      var gamepads = navigator.getGamepads()
      if (!gamepads) {
        return
      }
      var gamepad = gamepads[0]

      if (gamepad.buttons[12].pressed) {
        updateAndSend({ up: true, down: false })
      }
      if (gamepad.buttons[13].pressed) {
        updateAndSend({ down: true, up: false })
      }
      if (gamepad.buttons[14].pressed) {
        updateAndSend({ left: true, right: false })
      }
      if (gamepad.buttons[15].pressed) {
        updateAndSend({ right: true, left: false })
      }

      requestAnimationFrame(gamepadInputLoop)
    }

    const controlFocusCheck = setInterval(() => {
      if (!document.hasFocus()) {
        updateAndSend({
          up: false,
          down: false,
          left: false,
          right: false,
        })
      }
    }, 100)

    return () => {
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('mousemove', mouseMove)
      clearInterval(controlFocusCheck)
    }
  }, [props.actionCallback, updateAndSend, props.viewport])
  return (
    <>
      <div className={styles.abilityBar}>
        <img onTouchStart={() => { updateAndSend({ zoneClaim: true }) }} onMouseDown={() => { updateAndSend({ zoneClaim: true }) }} onTouchEnd={() => { updateAndSend({ zoneClaim: false }) }} onMouseUp={() => { updateAndSend({ zoneClaim: false }) }} src="/assets/img/game/coinJar.png" height={60} />
        <img onTouchStart={() => { updateAndSend({ turbo: true }) }} onMouseDown={() => { updateAndSend({ turbo: true }) }} onTouchEnd={() => { updateAndSend({ turbo: false }) }} onMouseUp={() => { updateAndSend({ turbo: false }) }} src="/assets/img/ui/mixer.png" height={60} />
        <img style={{ paddingLeft: '40px', paddingRight: '40px' }} onTouchStart={() => { updateAndSend({ space: true, shoot: true }) }} onMouseDown={() => { updateAndSend({ space: true, shoot: true }) }} onTouchEnd={() => { updateAndSend({ space: false, shoot: false }) }} onMouseUp={() => { updateAndSend({ space: false, shoot: false }) }} src="/assets/img/abilities/fireball.png" height={90} />
      </div>
      <ReactNipple
        options={{
          color: '#c60c30',
          mode: 'dynamic',
          position: { bottom: '25%', right: '10%' },
        }}
        style={{
          position: 'fixed',
          width: '100vh',
          height: '100vh',
        }}
        onMove={(evt: any, data) => {
          if (data.angle) {
            updateAndSend({
              angle: -data.angle.radian + Math.PI,
            })
          }
        }}
      />
    </>
  )
}
