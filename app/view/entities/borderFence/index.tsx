import React, { useMemo } from 'react'
import * as PIXI from 'pixi.js'
import { AnimatedSprite } from '../../entities/AnimatedSprite'
import FenceImage from './sprites/Fence.png'

interface IProps {
  x: number
  y: number
  angle: number
}

let ANIMATION_SPEED = 0
export const BorderFence = (props: IProps) => {
  ANIMATION_SPEED = Math.random() / 10
  const fenceTextures = useMemo(() => {
    let fenceImages = [FenceImage]
    let textures: any = []

    Promise.all(
      fenceImages.map(async (image) => {
        let texture = await PIXI.Texture.fromURL(image.src)
        textures.push(texture as any)
      }),
    )
    return textures
  }, [])

  return (
    <AnimatedSprite
      anchor={new PIXI.Point(0.5, 0.5)}
      width={267}
      height={72}
      textures={fenceTextures}
      rotation={props.angle}
      x={props.x}
      animationSpeed={ANIMATION_SPEED}
      loop={true}
      y={props.y}
    />
  )
}
