import React, { useMemo } from 'react'
import { Fireball } from '../../../state/types'
import * as PIXI from 'pixi.js-legacy'
import { AnimatedSprite } from '../AnimatedSprite'
import { CustomPIXIComponent } from 'react-pixi-fiber'

import fireball1 from './sprites/fireball1.png'
import fireball2 from './sprites/fireball2.png'
import fireball3 from './sprites/fireball3.png'
import fireball4 from './sprites/fireball4.png'

import iceball1 from './sprites/iceball1.png'
import iceball2 from './sprites/iceball2.png'
import iceball3 from './sprites/iceball3.png'
import iceball4 from './sprites/iceball4.png'

import electricball1 from './sprites/electricball1.png'
import electricball2 from './sprites/electricball2.png'
import electricball3 from './sprites/electricball3.png'
import electricball4 from './sprites/electricball4.png'

import poisonball1 from './sprites/poisonball1.png'
import poisonball2 from './sprites/poisonball2.png'
import poisonball3 from './sprites/poisonball3.png'
import poisonball4 from './sprites/poisonball4.png'

import mudball1 from './sprites/mudball1.png'
import mudball2 from './sprites/mudball2.png'
import mudball3 from './sprites/mudball3.png'
import mudball4 from './sprites/mudball4.png'

import blankBall from './sprites/blankBall.png'

/*import {
  CustomPIXIComponent,
} from "react-pixi-fiber";
*/
interface IProps {
  key: string
  fireball: Fireball
}

const ANIMATION_SPEED = 0.15

export const FireballView = (props: IProps) => {
  const fireballTextures = useMemo(() => {
    //Create textures from sprites

    let fireballImages = []
    switch (props.fireball.type) {
      case 'ice':
        fireballImages = [iceball1, iceball2, iceball3, iceball4]
        break
      case 'electric':
        fireballImages = [
          electricball1,
          electricball2,
          electricball3,
          electricball4,
        ]
        break
      case 'poison':
        fireballImages = [poisonball1, poisonball2, poisonball3, poisonball4]
        break
      case 'mud':
        fireballImages = [mudball1, mudball2, mudball3, mudball4]
        break
      default:
        fireballImages = [fireball1, fireball2, fireball3, fireball4]
    }
    //fireballImages = [blankBall];
    let textures: PIXI.AnimatedSprite['textures'] = []
    fireballImages.forEach((image) => {
      let texture = PIXI.Texture.from(image.src)
      textures.push(texture)
    })
    return textures
  }, [])

  return (
    <>
      <AnimatedSprite
        anchor={new PIXI.Point(0.5, 0.733)}
        width={props.fireball.width}
        height={props.fireball.height}
        x={props.fireball.x}
        y={props.fireball.y}
        textures={fireballTextures}
        rotation={props.fireball.angle + Math.PI / 2}
        animationSpeed={ANIMATION_SPEED}
        loop={true}
      />
    </>
  )
}
