import {
	Room,
	Client
} from 'colyseus';

import {
	GameState,
	Player,
	IInputs,
	Coin,
	Maths,
	Countdown,
	Fireball,
	CircleBat,
	LineSkull
} from '../common';

import * as admin from 'firebase-admin';
import { v4 } from "uuid";

const botnames = require('./botnames.json');
const MAX_COINS_HELD = 10;

export class TutorialRoom extends Room<GameState> {
	counter = 0;
	botTimeout = 0;
	maxClients = 1;
	tutorialStarted = false;
	tutorialCoinCollected = true;
	tutorialCoinCollectCheck = false;
	tutorialCoinBarFull = true;
	tutorialScoreIsNonZero = true;
	tutorialScoreIsNonZeroCheck = false;
	tutorialCoinBarFullCheck = false;
	redTeamIds = [];
	blueTeamIds = [];

	gameInt;


	onCreate() {
		this.setState(new GameState())
		this.registerMessages();
		this.startGameLoop();
		this.state.countdown = new Countdown(90, 0);// should be '5, 0'
		const spokes = 2;//of center rotating bats
		for(var j = 0; j < spokes; j++){
			for(var i = 0; i < 3; i++){
				this.state.bats.set(v4(), new CircleBat(this.state.bats.size, 1000, 1000, .02, 90*i + 90, (Math.PI*2/spokes)*j));
			}
		}
		this.state.skulls.set(v4(), new LineSkull(this.state.skulls.size, 320, 1000, 5, 1360, 0));
		this.state.skulls.set(v4(), new LineSkull(this.state.skulls.size, 1000, 320, 5, 1360, Math.PI/2));
	}

	async onJoin(client: Client, options: { token: string }, _2: any) {
		const user = await admin.auth().verifyIdToken(options.token);

		this.state.players[client.id] = new Player("fire", "default", 0);

		if (user.name == null) {
			const adjectives = require('../../wordlists/adjectives.json');
			const nouns = require('../../wordlists/nouns.json');
			const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
			const noun = nouns[Math.floor(Math.random() * nouns.length)];
			this.state.players[client.id].onlineName = `${adjective}-${noun}`.toLowerCase();
		} else {
			this.state.players[client.id].onlineName = user.name;
		}
		this.state.players[client.id].onlineID = user.uid;
	}

	onLeave(client: Client, _consent: boolean) {
		if (!this.state.players[client.sessionId]) {
			return;
		}
		this.state.players.delete(client.sessionId);
	}

	registerMessages() {
		this.onMessage("input", (client: Client, message: IInputs) => {
			if (!this.tutorialStarted) {
				this.runTutorial(client);
				this.tutorialStarted = true;
			}
			this.state.players[client.sessionId].inputs(message);
			//console.log("got player input");
		})
	}

	runTutorial(client: Client) {
		client.send("hint", "Welcome to DRAGON DUNGEON! Use the W, A, S, and D keys to move!");
		setTimeout(() => client.send("hint", "The goal of DRAGON DUNGEON is to collect as many coins as possible within 5 minutes."), 1000);
		setTimeout(() => {
			client.send("hint", "Try collecting a coin now!");
			this.tutorialCoinCollected = false;
			this.tutorialCoinBarFull = false;
			this.tutorialScoreIsNonZero = false;
			setInterval(() => {
				if (this.tutorialCoinCollected && !this.tutorialCoinCollectCheck) {
					client.send("hint", "Great job! Keep trying to collect coins.");
					this.tutorialCoinCollected = false;
					this.tutorialCoinCollectCheck = true;
				}
				if (this.tutorialCoinBarFull && !this.tutorialCoinBarFullCheck) {
					client.send("hint", "b Looks like your coin bar is full! Let's take those coins to the bank.");
					setTimeout(() => client.send("hint", "b The bank is in the center of the map."), 1000);
					this.tutorialCoinBarFull = false;
					this.tutorialCoinBarFullCheck = true;
				}
				if (this.tutorialScoreIsNonZero && !this.tutorialScoreIsNonZeroCheck) {
					client.send("hint", "Looks like you got this. Now, let's destroy some other dragons.");
					setTimeout(() => client.send("hint", "This is Botty McBotFace. Use the spacebar to take away his coins."), 1000);
					this.state.players.set(v4(), new Player("fire", "light", 0));
					this.tutorialScoreIsNonZero = false;
					this.tutorialScoreIsNonZeroCheck = true;
				}
			}, 1000)
		}, 2000);
	}

	startGameLoop() {
		this.gameInt = setInterval(() => {
			if(!this.state.gameOver){
			this.clock.tick();
			this.tick();
			}
		}, 1000 / 60);
	}

	gameOver(){
		this.clock.clear();
		clearInterval(this.gameInt);
		this.state.gameOver = true;
		this.state.players.forEach((player: Player) => {
			player.dead = true;
		});
	}

	spawnCoin() {
		var num = Math.random();
		var size = 20;
		if (num >= .75) {
			size += 5;
			if (num >= .95) {
				size += 5;
				if (num >= .995) {
					size = 100;
				}
			}
		}
		var newX;
		var newY;
		do {
			newX = Math.random() * 4000;
			newY = Math.random() * 4000;

		} while ((Maths.checkWalls(newX, newY, size) || (newX > 700 && newY > 700 && newX < 1300 && newY < 1300)) && size != 100)
		var teamNum;	
		if(this.state.gamemode == 'CTC'){
			teamNum = 1;
		}
		//this is temporary, change when CTC is more set up
		else{
			teamNum = 0;
		}
		this.state.coins.set(v4(), new Coin(this.state.coins.size, newX, newY, size, teamNum));
	}

	createCoin(x: number, y: number) {
		var rand;
		var newX;
		var newY;
		do {
			rand = Maths.getRandomInt(0, 62) / 10;
			newX = x + 100 * Math.cos(rand);
			newY = y + 100 * Math.sin(rand);
		} while (Maths.checkWalls(newX, newY, 20))
		this.state.coins.set(v4(), new Coin(this.state.coins.size, newX, newY, 20, 0));
	}
	moveBot(bot: Player, right: boolean, left: boolean, up: boolean, down: boolean) {
		let space = Math.random() > 0.7;
		let angle = Math.random() * (Math.PI * 2);
		bot.inputs({
			left: left,
			up: up,
			right: right,
			down: down,
			shoot: false,
			autoshoot: false,
			angle: angle,
			space: space
		});
	}



	tick() {
		this.counter++;
		const dx = this.clock.deltaTime;
		this.state.countdown.elaspseTime();
		if (this.state.countdown.done) {
			this.gameOver();
		}

		for (let i = this.state.coins.size; i < this.state.players.size * 150; i++) {
			this.spawnCoin();
		}

		for(let bat of this.state.bats.values()){
			bat.move();
		}

		for(let skull of this.state.skulls.values()){
			skull.move();
		}


		for (let id of this.state.players.keys()) {

			this.state.players[id].tick(dx);

			for (let id2 of this.state.players.keys()) {
				for (let i = 0; i < this.state.players[id2].fireballs.length; i++) {
					if (id != id2) {
						if (this.state.players[id2].fireballs[i].checkHit(this.state.players[id].x, this.state.players[id].y, this.state.players[id].team)) {
						    this.state.players[id2].hitsDealt ++;
							this.state.players[id].hitsRecived ++;
							var fireBall = this.state.players[id2].fireballs[i];
							const coinChance = .2; // the possibility of removing a coin on collision with a fireball, this is done to spread out the coins more
							const lifetimeRemove = 1; // the lifetime decreace of the fireball for every coin it removes from a dragon (as if  it is heavier)

							this.state.players[id].push(fireBall.angle - Math.PI, fireBall.speed)
							//console.log(this.state.players[id].x + "    " + this.state.players[id].y)
							if (this.state.players[id].coins > 0 && Math.random() < coinChance) {
								this.state.players[id].coins--;
								fireBall.lifetime -= lifetimeRemove;
								if (fireBall.type == "poison" && this.state.players[id2].coins < 10) {
									this.state.players[id2].coins++;
									this.state.players[id2].coinsPickedUp++;
								} else {
									this.createCoin(this.state.players[id].x, this.state.players[id].y);
								}
							}


							switch (fireBall.type) {
								case "electric":
									if (this.state.players[id2].fireballs.length < 10 && Math.random() > .9) {
										const angle = Math.random() * 6.28;
										const newX = this.state.players[id].x + 50 * Math.cos(angle);
										const newY = this.state.players[id].y + 50 * Math.sin(angle);
										if (!Maths.checkWalls(newX, newY, 22.5)) {
											this.state.players[id2].fireballs.push(new Fireball(newX, newY, angle + Math.PI, 7, "electric", 20, 0));

										}
									}
									break;
								case "mud":
									fireBall.width += 1;
									fireBall.height += 1.87;
									//fireBall.speed += .05;
									break;
								case "ice":
									this.state.players[id].deceleration = 2;
									break;
							}
						}
					}
				}

			}

			if (this.state.coinJar.checkHit(this.state.players[id].x, this.state.players[id].y, 0)) {
				// when a player has collided with the coinjar
				this.state.players[id].score += this.state.players[id].coins;// add coins to players score
				this.state.players[id].coins = 0;// remove coins
			}

			for(let cid of this.state.coins.keys()){
				if (this.state.coins[cid].checkHit(this.state.players[id].x, this.state.players[id].y, 0) && this.state.players[id].coins < 10) {
					this.tutorialCoinCollected = true;
					var coins = this.state.players[id].coins;
					switch (this.state.coins[cid].getSize()) {
						case (20):
							coins++;
							break;
						case (25):
							coins += 2;
							break;
						case (30):
							coins += 4;
							break;
						case (100):
							this.state.players[id].score += 50;
							this.state.players[id].coinsPickedUp += 50;
							break;
					}
					console.log(this.state.players[id].coinsPickedUp);
					if (this.state.players[id].coinsPickedUp == 9) {
						this.tutorialCoinBarFull = true;
					}
					this.state.players[id].coinsPickedUp += Math.min(coins, 10)-this.state.players[id].coins;
					this.state.players[id].coins = Math.min(coins,10);
					this.state.coins.delete(cid);
				}
			}

			for(let bat of this.state.bats.values()){
				if(bat.checkHit(this.state.players[id].x, this.state.players[id].y)){
					this.state.players[id].deceleration = 2 ;
					this.state.players[id].fireballCooldown += .2;
					break;
				}
			}
			
			for(let skull of this.state.skulls.values()){
				if(skull.checkHit(this.state.players[id].x, this.state.players[id].y)){
					this.state.players[id].push(skull.angle, skull.speed*1.2);
					if(Math.random() < .2 && this.state.players[id].coins > 0){
						this.state.players[id].coins --;
						if(Math.random() < .5 && this.state.players[id].score > 0){
							this.state.players[id].score --;
						}
					}
					break;
				}
			}
		}
	}
}