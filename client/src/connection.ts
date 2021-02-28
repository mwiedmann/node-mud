import { gameState, SquareType } from './init'

type MapMessage = {
  type: 'map'
  data: SquareType[][]
}

type WelcomeMessage = {
  type: 'welcome'
  data: string
}

type PlayerMessage = {
  type: 'player'
  data: {
    x: number
    y: number
    activityLog: string[]
  }
}

type MonsterMessage = {
  type: 'monster'
  data: {
    id: number
    subType: string
    x: number
    y: number
    dead: boolean
    activityLog: string[]
  }
}

type BaseMessage = WelcomeMessage | MapMessage | PlayerMessage | MonsterMessage

class ConnectionManager {
  connection!: WebSocket

  openConnection() {
    console.log('Opening connection')

    this.connection = new WebSocket('ws://localhost:3001')

    this.connection.onopen = () => {
      console.log('Connection Opened!')

      this.connection.send(JSON.stringify({ type: 'login', name: 'Joe Blow' }))
    }

    this.connection.onerror = (error) => {
      console.error(`WebSocket error: ${error}`)
    }

    this.connection.onmessage = (e) => {
      const message: BaseMessage = JSON.parse(e.data)

      console.log('Got message', message)

      switch (message.type) {
        case 'map':
          gameState.map = message.data
          gameState.mapUpdate = true
          break

        case 'player':
          gameState.player.x = message.data.x
          gameState.player.y = message.data.y
          gameState.player.activityLog = message.data.activityLog
          break

        case 'monster':
          let monster = gameState.monsters.get(message.data.id)

          if (!monster) {
            monster = { ...message.data }
            gameState.monsters.set(monster.id, monster)
          } else {
            monster.x = message.data.x
            monster.y = message.data.y
            monster.dead = message.data.dead
            monster.activityLog = message.data.activityLog
          }
          break
      }
    }

    this.connection.onclose = (e) => {
      console.log('Conection closed')
    }
  }

  logout() {
    this.connection.send(JSON.stringify({ type: 'logout' }))
    this.connection.close()
  }

  setDestination(x: number, y: number) {
    this.connection.send(JSON.stringify({ type: 'setDestination', x, y }))
  }
}

export const connectionManager = new ConnectionManager()
