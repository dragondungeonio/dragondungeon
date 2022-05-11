import React, { useMemo } from 'react'
import * as PIXI from 'pixi.js'
import { AnimatedSprite } from '../AnimatedSprite'
import batImage1 from './sprites/bat1.png'
import batImage2 from './sprites/bat2.png'
import batImage3 from './sprites/bat3.png'
import batImage4 from './sprites/bat4.png'
import batImage5 from './sprites/bat5.png'
import batImage6 from './sprites/bat6.png'
import batImage7 from './sprites/bat7.png'

interface IProps {
  key: string
  x: number
  y: number
  rot: number
}

let ANIMATION_SPEED = 0
export const Bat = (props: IProps) => {
  ANIMATION_SPEED = Math.random() / 10
  const coinTextures = useMemo(() => {
    //Create textures from spites
    let coinImages = [batImage1, batImage2, batImage3, batImage4]
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
      width={45}
      height={45}
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
