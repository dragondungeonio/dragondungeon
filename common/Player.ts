import { ArraySchema, Schema, type } from '@colyseus/schema'
import { Geometry, Maths } from '.'
import { Bar } from './Bar'
import { Fireball } from './Fireball'
import { IInputs } from './IInputs'

export class Player extends Schema {
  @type([Fireball])
  fireballs = new ArraySchema<Fireball>()

  @type('number')
  botTimeout: number = Math.random() * 5000

  @type('number')
  fireballCount: number = 0

  @type('number')
  health: number = 10

  @type('number')
  x: number = 1500

  @type('number')
  y: number = 1500

  @type('number')
  angle: number = Math.PI

  @type('number')
  score: number = 0

  @type('number')
  coins: number = 0

  @type([Bar])
  bar = new Bar('', this.x, this.y)

  @type('string')
  onlineName!: string

  @type('string')
  onlineID!: string

  @type('string')
  ballType: string

  @type('number')
  skinType: number

  @type('number')
  speed: number = 25

  @type('number')
  deceleration: number = 1

  @type('boolean')
  isBot!: boolean

  @type('boolean')
  autoshootOn: boolean = false

  @type('boolean')
  dead: boolean = false

  @type('number')
  hitsRecived: number = 0

  @type('number')
  hitsDealt: number = 0

  @type('number')
  coinsPickedUp: number = 0

  @type('number')
  team: number = 0

  @type('boolean')
  turboModeAllowed: boolean = true

  @type('boolean')
  turboMode: boolean = false

  direction: Geometry.Vector = new Geometry.Vector(0, 0)

  activeInputs: IInputs = {
    left: false,
    up: false,
    right: false,
    down: false,
    shoot: false,
    autoshoot: false,
    angle: 0.0,
    space: false,
    turbo: false,
  }
  colyseusClient: any
  constructor(ballType: string, skinType: number, teamNum: number) {
    super()
    this.team = teamNum
    this.ballType = ballType
    this.skinType = skinType
    //this.setPosition();
  }

  /* setPosition(){
		var newX = 0;
		var newY = 0;
		do {
			newX = Math.random()*100;
			newY = Math.random()*100;
		}while (Maths.checkWalls(newX, newY, 45) ||  (newX > 500 && newY > 500 && newX < 3500 && newY < 3500))
		this.x = newX;
		this.y = newY;
	} */

  inputs(i: IInputs) {
    if (i.turbo && this.turboModeAllowed) {
      this.turboModeAllowed = false
      this.turboMode = true
      this.speed = 200
      this.colyseusClient.send('chatlog', 'Turbo Mode Activated!')
      if (Math.random() < 0.6) {
        this.colyseusClient.send('sfx', '/audio/turbomode.m4a')
      }
      setTimeout(() => {
        this.speed = 20
        this.turboMode = false
      }, 300)
      setTimeout(() => {
        this.turboModeAllowed = true
      }, 2000)
    }
    if (i.autoshoot && !this.activeInputs.autoshoot) {
      this.autoshootOn = !this.autoshootOn
    }
    this.activeInputs = Object.assign({}, this.activeInputs, i)
    const resDirection = new Geometry.Vector(0, 0)
    resDirection.x += Math.sin(this.activeInputs.angle - Math.PI / 2)
    resDirection.y += Math.cos(this.activeInputs.angle + Math.PI / 2)
    this.direction = resDirection
    //this.angle = Math.atan2(i.mouseX - this.x, i.mouseY - this.y)
    this.angle = i.angle
  }

  fireballCooldown: number = 0
  tick(dx: number) {
    const ticks = dx / 50
    /* if (this.direction.x !== 0 || this.direction.y !== 0) {
			this.move(this.direction.x, this.direction.y, (this.speed+this.coins) * (1/this.deceleration) * ticks)
			if(this.deceleration > 1){
				this.deceleration *= .9;
			}
		}*/
    this.fireballCooldown -= ticks
    //i temp changed this line bc idk what the checkwalls does exactly
    //old: if ((this.autoshootOn || this.activeInputs.space) && this.fireballCooldown <= 0 && !Maths.checkWalls(this.x + 45 * Math.cos(this.angle + Math.PI),this.y + 45 * Math.sin(this.angle + Math.PI), 22.5)) {
    if (
      (this.autoshootOn || this.activeInputs.space) &&
      this.fireballCooldown <= 0
    ) {
      switch (this.ballType) {
        case 'electric':
          this.fireballCooldown = 20
          break
        case 'poison':
          this.fireballCooldown = 20
          break
        case 'ice':
          this.fireballCooldown = 17
          break
        case 'mud':
          this.fireballCooldown = 17
          break
        default:
          this.fireballCooldown = 17
      }
      const fireball = new Fireball(
        this.x,
        this.y,
        this.angle,
        this.ballType,
        40,
        this.team,
      )
      this.fireballs.push(fireball)
    }
    /*
		for (let fireball of this.fireballs) {
			fireball.lifetime -= ticks;

			var newX = fireball.x + (fireball.speed * Math.cos(fireball.angle - Math.PI));
			var newY = fireball.y + (fireball.speed * Math.sin(fireball.angle - Math.PI));
			if(!Maths.checkWalls(newX, fireball.y, 22.5)){
				fireball.x = newX;
			}else{
				fireball.lifetime -= .3;
			}
			if(!Maths.checkWalls(fireball.x, newY, 22.5)){
				fireball.y = newY;
			}else{
				fireball.lifetime -= .3;
			}
		}
		*/
    for (var i = 0; i < this.fireballs.length; i++) {
      if (this.fireballs[i].lifetime <= 0) {
        this.fireballs.splice(i, 1)
      }
    }

    this.bar.x = this.x
    this.bar.y = this.y
  }

  /*move(dirX: number, dirY: number, speed: number) {
		const magnitude = Maths.normalize2D(dirX, dirY);
		const speedX = Maths.round2Digits(dirX * (speed / magnitude));
		const speedY = Maths.round2Digits(dirY * (speed / magnitude));
		const newX = this.x + speedX;
		const newY = this.y + speedY;
		if(!Maths.checkWalls(this.x, newY, 45)){
			this.y = newY;
		} 
		if(!Maths.checkWalls(newX, this.y, 45)){
			this.x = newX;
		}
		
	}*/
}
