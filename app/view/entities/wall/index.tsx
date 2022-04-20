import React, { useMemo } from 'react';
import * as PIXI from 'pixi.js';
import { AnimatedSprite } from '../../entities/AnimatedSprite';
// import WallImage5 from './sprites/Wall(5.2).png';
// import WallImage3 from './sprites/Wall(3.2).jpg';
// import WallImage2 from './sprites/Wall(2.2).png';
import WallImage from './sprites/WallSec.png'

import RedWallImage from './sprites/RedWallSec.jpg'
import BlueWallImage from './sprites/BlueWallSec.jpg'

interface IProps {
  x: number;
  y: number;
  xLength: number;
  yLength: number;
  angle: number;
  team: number;
  health: number;
}
 
 
export const Wall = (props: IProps) => {
  const fenceTextures = useMemo(() => {
    let textures: any = []
    switch(props.team){
      case 1:
        if(props.health > 0){
          textures = [PIXI.Texture.from(RedWallImage.src)]
        } else{
          textures = [PIXI.Texture.from(WallImage.src)]
        }
        break
      case 2:
        textures = [PIXI.Texture.from(BlueWallImage.src)]
        break
      default:
        textures = [PIXI.Texture.from(WallImage.src)]
    }
    return textures
  }, [props.health]);

  return (
    <AnimatedSprite
      key={Math.floor(Math.random() * 100000)}
      anchor={new PIXI.Point(0, 0)}
      width={props.xLength}
      height={props.yLength}
      textures={fenceTextures}
      x={props.x}
      rotation={props.angle}
      loop={true}
      y={props.y}
      
    />
  )

}
