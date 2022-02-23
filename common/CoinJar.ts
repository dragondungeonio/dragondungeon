import { Schema, type } from "@colyseus/schema";

export class CoinJar extends Schema {

	@type("number")
	x: number = 0;

	@type("number")
	y: number = 0;

	@type("number")
	team: number = 0;

	constructor(x: number, y: number, teamNum: number) {
		super()
		this.x = x
		this.y = y
		this.team = teamNum
	}

	checkHit(dragonX: number, dragonY: number, teamNum: number) {
		if( teamNum != this.team ){return false;}
		if (Math.sqrt(Math.pow(this.x - dragonX, 2) + Math.pow(this.y - dragonY, 2)) < 95) {
			return true;
		} else {
			return false
		}
	}

}