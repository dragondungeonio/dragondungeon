import { Client } from 'colyseus'
import { GameState, IInputs } from '../common'
import CoreRoom from './CoreRoom'

export class TutorialRoom extends CoreRoom {
    constructor() {
        let state = new GameState()
        super(state)
      }

    async onJoin(client: Client, options: { token: string }, _2: any): Promise<void> {
        super.onJoin(client, options, _2)
        setTimeout(() => {
            client.send('chatlog', 'Welcome to dragondungeon.io!')
            setTimeout(() => {
                client.send('chatlog', 'Use the mouse to move and <img src="/prompts/mnk/Space_Key_Dark.png" height="50px" width="50px" style="vertical-align:middle" /> to shoot')
                super.onMessage('input', (clientm: Client, message: IInputs) => {
                    if (clientm == client && message.space == true) {
                        client.send('chatlog', 'Great job!')
                    }
                    try {
                        this.state.players[client.sessionId].inputs(message)
                    } catch {}
                })
            }, 1000)
        }, 3000)
    }
}
  