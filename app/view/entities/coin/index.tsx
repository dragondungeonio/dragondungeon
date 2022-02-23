import React, {useMemo} from 'react';
import * as PIXI from 'pixi.js';
import {AnimatedSprite} from '../AnimatedSprite';
import coinImage1 from './sprites/coin1.png';
import coinImage2 from './sprites/coin2.png';

import redCoinImage1 from './sprites/redCoin1.png';
import redCoinImage2 from './sprites/redCoin2.png';

import blueCoinImage1 from './sprites/blueCoin1.png';
import blueCoinImage2 from './sprites/blueCoin2.png';

interface IProps {
    key: string;
    x: number;
    y: number;
    size: number;
    team: number;
}


let ANIMATION_SPEED = 0;
export const Coin = (props: IProps) => {
  ANIMATION_SPEED = Math.random()/10;
  const coinTextures = useMemo(() => {
    //Create textures from spites
    let coinImages = [];
    switch(props.team){
      case 1:
        coinImages = [redCoinImage1, redCoinImage2];
        break;
      case 2:
        coinImages = [blueCoinImage1, blueCoinImage2];
        break;
      default:
        coinImages = [coinImage1, coinImage2];
    }
    
    let textures: PIXI.AnimatedSprite["textures"] = [];
    coinImages.forEach(image =>{
      let texture = PIXI.Texture.from(image.src);
       textures.push(texture);
    });
    return textures;
  }, []);

  
  return (
    <AnimatedSprite
    anchor={new PIXI.Point(0.5, 0.5)}
    width ={props.size * 3}
    height = {props.size * 2}
    textures = {coinTextures}
    x={props.x}
    animationSpeed = {ANIMATION_SPEED}
    loop= {true}
    y={props.y}
    />
    )
 
}
