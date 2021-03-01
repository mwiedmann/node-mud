import WebSocket from 'ws'
import { createGame, Game } from '../game'
import { Player } from '../game/mob'
import { tickSettings } from './tick'
import { performance } from 'perf_hooks'

let game: Game<WebSocket>

export const startServer = (): void => {
  game = createGame()

  const wss = new WebSocket.Server({ port: 3001 })

  setInterval(updateGame, tickSettings.timePerTick)

  console.log('Game started. Listening for players.')

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        if (typeof message === 'string') {
          const obj: MessageBase = JSON.parse(message)

          switch (obj.type) {
            case 'login':
              loginPlayer(ws, obj)
              break

            case 'logout':
              logoutPlayer(ws)
              break

            case 'setDestination':
              setDestination(ws, obj)
              break

            default:
              console.error('Invalid message type')
          }
        }
      } catch (ex) {
        console.log(ex)
      }
    })
  })
}

const updateGame = () => {
  try {
    const perfStart = performance.now()

    const disconnectedPlayers: Player<WebSocket>[] = []
    game.update()
    game.levels.forEach((l) => {
      l.players.forEach((p) => {
        // Check if the player is still connected
        if (p.connection.readyState === WebSocket.CLOSED) {
          disconnectedPlayers.push(p)
          return
        }
        const state = p.getState()
        if (state) {
          p.connection.send(state)
        }

        l.monsters.forEach((c) => {
          const state = c.getState()
          if (state) {
            p.connection.send(state)
          }
        })
      })
    })

    // Logout any disconnected players
    disconnectedPlayers.forEach((p) => {
      console.log('Logging out disconnected player', p.id)
      game.logout(p.connection)
    })

    // Check the performance
    // We strive for tickSettings.timePerTick ms per loop (currently 100 or 10 per a second)
    // Anything less than this and the game will not lag
    // A few spikes here and there are ok
    // We warn for over 80 for now so we can keep an eye on it
    if (performance.now() - perfStart > 80) {
      console.warn(`Slow performance. Update loop took ${performance.now() - perfStart} ms.`)
    }
  } catch (ex) {
    console.log(ex)
  }
}

type MessageLogin = {
  type: 'login'
  name: string
}

type MessageLogout = {
  type: 'logout'
}

type MessageSetDestination = {
  type: 'setDestination'
  x: number
  y: number
}

type MessageBase = MessageLogin | MessageLogout | MessageSetDestination

type PlayerConnection = {
  id: number
  name: string
  ws: WebSocket
}

const loginPlayer = (ws: WebSocket, { name }: MessageLogin) => {
  const player = game.login(name, ws)
  console.log(`Logged in player: ${name}, id: ${player.id}`)
  ws.send(JSON.stringify({ name, id: player.id }))
  ws.send(
    JSON.stringify({
      type: 'map',
      data: game.levels.get(1)?.walls
    })
  )
}

const logoutPlayer = (ws: WebSocket) => {
  const player = game.logout(ws)
  if (player) {
    console.log(`Logged out player: ${player.name}, id: ${player.id}`)
  } else {
    console.error('Could not find player to log out')
  }

  ws.close()
}

const setDestination = (ws: WebSocket, { x, y }: MessageSetDestination) => {
  game.setDestination(ws, x, y)
}
