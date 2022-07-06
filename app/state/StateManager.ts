import { ColyseusService } from '../../lib/colyseus'
import { Room } from 'colyseus.js';

import { GameState } from '../../common';

export class StateManager {
  room!: Room<GameState>;

  constructor(
    private readonly colyseus: ColyseusService,
    private readonly lobby: string,
    private readonly token: string
  ) { }

  async joinRoom() {
    try {
      this.room = await this.colyseus.client.joinOrCreate(window.localStorage.gameType || 'arena', { token: this.token })
    } catch (error) {
      throw new Error(error)
    }
  }

}

