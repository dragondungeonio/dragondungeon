import * as PIXI from 'pixi.js-legacy'
import { CustomPIXIComponent } from 'react-pixi-fiber'

import { settings, SCALE_MODES } from 'pixi.js'

settings.ROUND_PIXELS = true
settings.SCALE_MODE = SCALE_MODES.NEAREST

type AnimatedSpriteProps = {
  textures: PIXI.AnimatedSprite['textures']
  animationSpeed?: number
  loop?: boolean
  rotation?: number
  x: number
  y: number
  width?: number
  height?: number
  anchor?: PIXI.Point
  xScale?: number //this neends to be either 1 for normal or -1 for flip over x axis
  yScale?: number //same here but y axis
}

function equalAnchors(a1?: PIXI.Point, a2?: PIXI.Point): boolean {
  if (!a1 && !a2) {
    return true
  }
  if (!a1) {
    return false
  }
  if (!a2) {
    return false
  }
  if (a1.x !== a2.x) {
    return false
  }
  if (a1.y !== a2.y) {
    return false
  }

  return true
}

export const AnimatedSprite = CustomPIXIComponent<
  PIXI.AnimatedSprite,
  AnimatedSpriteProps
>(
  {
    customDisplayObject: (props) => new PIXI.AnimatedSprite(props.textures),
    customApplyProps: (instance, _oldProps, newProps) => {
      if (instance.loop !== newProps.loop) {
        instance.loop = !!newProps.loop
        instance.play()
      }
      if (instance.animationSpeed !== newProps?.animationSpeed) {
        instance.animationSpeed = newProps.animationSpeed || 1
        instance.play()
      }
      if (instance.rotation !== newProps?.rotation) {
        instance.rotation = newProps.rotation || 0
      }
      if (instance.textures !== newProps.textures) {
        const oldFrame = instance.currentFrame
        instance.textures = newProps.textures
        instance.gotoAndPlay(oldFrame)
      }
      if (instance.x !== newProps.x) {
        instance.x = newProps.x
      }
      if (instance.y !== newProps.y) {
        instance.y = newProps.y
      }
      if (newProps.width !== undefined && instance.width !== newProps.width) {
        instance.width = newProps.width
      }
      if (
        newProps.xScale !== undefined &&
        instance.scale.x !== newProps.xScale
      ) {
        instance.scale.x = newProps.xScale
      }
      if (
        newProps.yScale !== undefined &&
        instance.scale.y !== newProps.yScale
      ) {
        instance.scale.y = newProps.yScale
      }
      if (
        newProps.height !== undefined &&
        instance.height !== newProps.height
      ) {
        instance.height = newProps.height
      }
      if (!equalAnchors(instance.anchor, newProps.anchor)) {
        if (newProps.anchor) {
          ;(instance as any).anchor = newProps.anchor
        }
      }
    },
    customDidAttach: (instance) => {
      instance.play()
    },
  },
  'AnimatedSprite',
) as any
