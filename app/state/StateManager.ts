import { ColyseusService } from '../../lib/colyseus'
import { Room } from 'colyseus.js';

import { GameState } from '../../common';

import { useRouter } from 'next/router'

export class StateManager {
  room!: Room<GameState>;

  constructor(
    private readonly colyseus: ColyseusService,
    private readonly lobby: string,
    private readonly token: string
  ) { }

  async joinRoom(mode: string) {
    try {
      this.room = await this.colyseus.client.joinOrCreate(mode || 'arena', { token: this.token })
    } catch {
      try {
        this.room = await this.colyseus.client.joinById(mode || 'arena', { token: this.token })
      } catch (error) {
        alert('We couldn\'t join this room. Check that the ID is correct.')
        window.location.href = '/'
      }
    }
  }

}

