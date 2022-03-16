import React, { useMemo } from 'react'
import { IPlayer } from '../../../state/types'
import * as PIXI from 'pixi.js-legacy'
import { AnimatedSprite } from '../AnimatedSprite'
import { CustomPIXIComponent } from 'react-pixi-fiber'

import dragon1 from './sprites/dragon2.png'
import dragon2 from './sprites/dragon3.png'
import dragon3 from './sprites/dragon4.png'
import dragon4 from './sprites/dragon5.png'

import lightDragon1 from './sprites/lightDragon2.png'
import lightDragon2 from './sprites/lightDragon3.png'
import lightDragon3 from './sprites/lightDragon4.png'
import lightDragon4 from './sprites/lightDragon5.png'

import goldDragon1 from './sprites/goldDragon2.png'
import goldDragon2 from './sprites/goldDragon3.png'
import goldDragon3 from './sprites/goldDragon4.png'
import goldDragon4 from './sprites/goldDragon5.png'

import blueDragon1 from './sprites/blueDragon2.png'
import blueDragon2 from './sprites/blueDragon3.png'
import blueDragon3 from './sprites/blueDragon4.png'
import blueDragon4 from './sprites/blueDragon5.png'

import redDragon1 from './sprites/redDragon2.png'
import redDragon2 from './sprites/redDragon3.png'
import redDragon3 from './sprites/redDragon4.png'
import redDragon4 from './sprites/redDragon5.png'

import blankDragon from './sprites/blankDragon.png'
import { Player } from '../../../../common/Player'
import { FireballView } from '../fireball'

interface IProps {
  key: string
  player: Player
  team: number
  celebration: boolean
}

type TeamOrbProps = {
  x: number
  y: number
  radius: number
  zIndex?: number
}

function propsEqual(oldProps: TeamOrbProps, newProps: TeamOrbProps) {
  return (
    oldProps.radius === newProps.radius &&
    oldProps.zIndex === newProps.zIndex &&
    oldProps.x === newProps.x &&
    oldProps.y === newProps.y
  )
}

export const TeamOrb = CustomPIXIComponent<PIXI.Graphics, TeamOrbProps>(
  {
    customDisplayObject: (props) => new PIXI.Graphics(),

    /* const fireballTextures = useMemo(() => {
      //Create textures from spites
      let fireballImages = [dragon1,dragon2,dragon3, dragon4];
      let textures: PIXI.AnimatedSprite["textures"] = [];
      dragonImages.forEach(image =>{
        let texture = PIXI.Texture.from(image);
         textures.push(texture);
      });
      return textures;
    }, []);  */

    customApplyProps: (instance, oldProps, newProps) => {
      if (newProps.zIndex) {
        instance.zIndex = newProps.zIndex
      }
      if (!propsEqual(oldProps, newProps)) {
        const teamColor = 0xff0000
        instance.clear()
        instance.beginFill(teamColor, 1) // Red
        instance.drawCircle(newProps.x, newProps.y, newProps.radius)
        instance.endFill()
      }
    },
  },
  'TeamOrb',
)

const ANIMATION_SPEED = 0.08

export const Dragon = (props: IProps) => {
  const dragonTextures = useMemo(() => {
    // TODO: Create textures from spites
    let dragonImages
    if (props.team == 0) {
      switch (props.player.skinType) {
        case 'light':
          dragonImages = [
            lightDragon1,
            lightDragon2,
            lightDragon3,
            lightDragon4,
          ]
          break
        case 'gold':
          dragonImages = [goldDragon1, goldDragon2, goldDragon3, goldDragon4]
          break
        default:
          dragonImages = [dragon1, dragon2, dragon3, dragon4]
      }
    } else if (props.team == 1) {
      dragonImages = [redDragon1, redDragon2, redDragon3, redDragon4]
    } else {
      dragonImages = [blueDragon1, blueDragon2, blueDragon3, blueDragon4]
    }
    //let dragonImages = [blankDragon];
    let textures: any = []

    Promise.all(
      dragonImages.map(async (image) => {
        let texture = await PIXI.Texture.fromURL(image.src)
        textures.push(texture)
      }),
    )
    return textures
  }, [])

  const fireballs = props.player.fireballs.map((fb, i) => (
    <FireballView key={`${i}`} fireball={fb} />
  ))

  var yS = 5
  if (Math.abs(props.player.angle) < Math.PI / 2) {
    yS = -5
  }

  return (
    <>
      {dragonTextures.length > 0 && (
        <AnimatedSprite
          anchor={new PIXI.Point(0.5, 0.5)}
          width={90}
          height={90}
          textures={dragonTextures}
          rotation={
            props.celebration
              ? Math.random() * 400
              : props.player.angle + Math.PI
          }
          x={props.player.x}
          animationSpeed={ANIMATION_SPEED}
          loop={true}
          y={props.player.y}
          xScale={5}
          yScale={yS}
        />
      )}

      {fireballs}
    </>
  )
}
