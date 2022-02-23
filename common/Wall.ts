import { Schema, type } from '@colyseus/schema'

export class Wall extends Schema {
  @type('number')
  x: number = 0

  @type('number')
  y: number = 0

  @type('number')
  xLength: number = 0

  @type('number')
  yLength: number = 0

  @type('number')
  angle: number = 0

  @type('string')
  key: string

  @type('number')
  health: number = 10

  @type('boolean')
  isRotated: boolean = false

  gamemode: string

  constructor(
    x: number = 1000,
    y: number = 1000,
    xLen: number,
    yLen: number,
    isRotated: boolean,
    health: number,
    gamemode: string,
    key?: string,
  ) {
    super()
    this.x = x
    this.y = y
    this.xLength = xLen
    this.yLength = yLen
    this.health = health
    this.gamemode = gamemode
    this.isRotated = isRotated
    this.key = key
    if (isRotated == true) {
      this.angle = Math.PI / 2
    }
  }

  /*checkHit(objectX: number, objectY: number, radius: number, isFireball: boolean) {
		if(this.health<=0){
            if(objectX+radius>this.x && objectX+radius<this.x+this.xLength){
                if(objectY+radius>this.y && objectY+radius<this.y+this.yLength){
                    //this will diminish the wall only in CTC
                    if(isFireball){
                        if(this.gamemode == "CTC"){
                            this.health-=1;
                        }
                    }
                    return true;
                }
            }
        }
        return false;
	} */
}
