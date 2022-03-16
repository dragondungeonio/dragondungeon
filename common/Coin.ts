import { Schema, type } from "@colyseus/schema";

export class Coin extends Schema {
	@type("number")
	key: number | string;

	@type("number")
	x: number = 1;

	@type("number")
	y: number = 1;

	@type("number")
	size: number = 20;

	@type("number")
	team: number = 0;

	constructor(key: number, x: number, y: number, size: number, teamNum: number) {
		super()
		this.x = x;
		this.y = y;
		this.key = key;
		this.size = size;
		this.team = teamNum;
	}

	public getSize(){
		return this.size;
	}

	checkHit(dragonX: number, dragonY: number, teamNum: number) {
		if( teamNum == this.team && !(teamNum == 0 && this.team == 0) ){return false;}
		if (Math.sqrt((Math.pow((this.x) - (dragonX), 2)) + (Math.pow((this.y) - (dragonY), 2))) < 30+this.size) {
			return true;
		} else {
			return false
		}

	}

}