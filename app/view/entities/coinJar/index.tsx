import React, {useMemo} from 'react';
import * as PIXI from 'pixi.js';
import {AnimatedSprite} from '../AnimatedSprite';
import jarImage1 from './sprites/coinJar1.png';
import jarImage2 from './sprites/coinJar2.png';
import jarImage3 from './sprites/coinJar3.png';
import jarImage4 from './sprites/coinJar4.png';
import jarImage5 from './sprites/coinJar5.png';

import redJarImage1 from './sprites/redCoinJar1.png';
import redJarImage2 from './sprites/redCoinJar2.png';
import redJarImage3 from './sprites/redCoinJar3.png';
import redJarImage4 from './sprites/redCoinJar4.png';
import redJarImage5 from './sprites/redCoinJar5.png';

import blueJarImage1 from './sprites/blueCoinJar1.png';
import blueJarImage2 from './sprites/blueCoinJar2.png';
import blueJarImage3 from './sprites/blueCoinJar3.png';
import blueJarImage4 from './sprites/blueCoinJar4.png';
import blueJarImage5 from './sprites/blueCoinJar5.png';

interface IProps {
    key: string;
    x: number;
    y: number;
    team: number;
}


let ANIMATION_SPEED = 0;
export const CoinJar = (props: IProps) => {
  ANIMATION_SPEED = Math.random()/10;
  const jarTextures = useMemo(() => {
    //Create textures from spites
    let jarImages = [];
    switch(props.team){
      case 1:
        jarImages = [redJarImage1, redJarImage2, redJarImage3, redJarImage4, redJarImage5];
        break
      case 2:
        jarImages = [blueJarImage1, blueJarImage2, blueJarImage3, blueJarImage4, blueJarImage5];
        break
      default:
        jarImages = [jarImage1, jarImage2, jarImage3, jarImage4, jarImage5];
    }
    let textures = [];
    jarImages.forEach(image =>{
      let texture = PIXI.Texture.from(image.src);
       textures.push(texture);
    });
    return textures;
  }, []);

  return (
    <AnimatedSprite
    anchor={new PIXI.Point(0.5, 0.5)}
    width ={100}
    height = {100}
    textures = {jarTextures}
    x={props.x}
    animationSpeed = {ANIMATION_SPEED}
    loop= {true}
    y={props.y}
    />
    )
 
}
