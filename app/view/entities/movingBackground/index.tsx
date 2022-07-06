import React, { useMemo } from 'react'
import * as PIXI from 'pixi.js'
import { AnimatedSprite } from '../../entities/AnimatedSprite'
import TileImage1 from './sprites/tile1.png'
import TileImage2 from './sprites/tile2.png'
import TileImage3 from './sprites/tile3.png'
import TileImage4 from './sprites/tile4.png'
import TileImage5 from './sprites/tile5.png'
import TileImage6 from './sprites/tile6.png'
import DirtTile from './sprites/dirt.png'
import TechnoTile from './sprites/techno.png'

interface IProps {
  x: number
  y: number
  map: string
}

let ANIMATION_SPEED = 0
export const MovingBackground = (props: IProps) => {
  ANIMATION_SPEED = Math.random() / 100
  let tileImages
  const tileTextures = useMemo(() => {
    switch (props.map) {
      case 'techno':
        tileImages = [TechnoTile]
      case 'dirt':
        tileImages = [DirtTile]
      default:
        tileImages = [
          TileImage1,
          TileImage2,
          TileImage3,
          TileImage4,
          TileImage5,
          TileImage6,
        ]
    }
    let textures: PIXI.AnimatedSprite['textures'] = [
      PIXI.Texture.from(
        tileImages[Math.floor(Math.random() * tileImages.length)].src,
      ),
    ]
    return textures
  }, [])

  if (window.localStorage.ddSpectatorMode != 'true') {
    return (
      <AnimatedSprite
        anchor={new PIXI.Point(0.5, 0.5)}
        width={177 * 1.2}
        height={177 * 1.2}
        textures={tileTextures}
        x={props.x}
        animationSpeed={ANIMATION_SPEED}
        loop={true}
        y={props.y}
      />
    )
  } else {
    return null
  }
}
