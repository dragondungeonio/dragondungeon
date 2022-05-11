import React, { useMemo } from 'react'
import * as PIXI from 'pixi.js'
import { AnimatedSprite } from '../AnimatedSprite'
import skullImage1 from './sprites/skull1.png'
import skullImage2 from './sprites/skull2.png'
import skullImage3 from './sprites/skull3.png'

interface IProps {
  key: string
  x: number
  y: number
  rot: number
}

let ANIMATION_SPEED = 0
export const Skull = (props: IProps) => {
  ANIMATION_SPEED = Math.random() / 10
  const coinTextures = useMemo(() => {
    //Create textures from spites
    let coinImages = [skullImage1, skullImage2, skullImage3]
    let textures: PIXI.AnimatedSprite['textures'] = []
    coinImages.forEach((image) => {
      let texture = PIXI.Texture.from(image.src)
      textures.push(texture as any)
    })
    return textures
  }, [])

  var yS = 5
  const angle = Math.abs(props.rot) % (2 * Math.PI)
  if (angle > Math.PI / 2 && angle < (Math.PI * 3) / 2) {
    yS = -5
  }

  return (
    <AnimatedSprite
      anchor={new PIXI.Point(0.5, 0.5)}
      width={90}
      height={90}
      textures={coinTextures}
      x={props.x}
      animationSpeed={ANIMATION_SPEED}
      loop={true}
      y={props.y}
      rotation={props.rot}
      yScale={yS}
    />
  )
}
