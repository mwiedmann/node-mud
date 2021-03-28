import WebSocket from 'ws'
import { createGame, Game } from '../game'
import { Player } from '../game/mob'
import { tickSettings } from './tick'
import { performance } from 'perf_hooks'
import { PlayerProfession, PlayerRace } from 'dng-shared'

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

            case 'getItem':
              getItem(ws, obj)
              break

            case 'setSpecialAbilityLocation':
              setSpecialAbilityLocation(ws, obj)
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

    const updatePerfStart = performance.now()
    const updatePerfList = game.update()
    const updatePerfTotal = performance.now() - updatePerfStart

    const playerPerfStart = performance.now()
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

        l.items.forEach((c) => {
          const state = c.getState(game.tick, p.lastTickReceivedState)
          if (state) {
            p.connection.send(state)
          }
        })

        p.usingItems().forEach((i) => {
          const state = i.getState(game.tick, p.lastTickReceivedState)
          if (state) {
            p.connection.send(state)
          }
        })

        p.lastTickReceivedState = game.tick
      })
    })
    const playerPerfTotal = performance.now() - playerPerfStart

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
      console.warn(
        `Slow performance`,
        `Total: ${Math.floor(performance.now() - perfStart)} ms`,
        `update(): ${Math.floor(updatePerfTotal)} ms`,
        updatePerfList.filter((u) => u.time > 2).map((u) => `${u.notes.notes.join(' : ')} | ${Math.floor(u.time)} ms`)
      )
    }
  } catch (ex) {
    console.log(ex)
  }
}

type MessageLogin = {
  type: 'login'
  name: string
  race: PlayerRace
  profession: PlayerProfession
}

type MessageLogout = {
  type: 'logout'
}

type MessageSetDestination = {
  type: 'setDestination'
  x: number
  y: number
}

type MessageSetSpecialAbilityLocation = {
  type: 'setSpecialAbilityLocation'
  x: number
  y: number
}

type MessageGetItem = {
  type: 'getItem'
  x: number
  y: number
}

type MessageBase =
  | MessageLogin
  | MessageLogout
  | MessageSetDestination
  | MessageGetItem
  | MessageSetSpecialAbilityLocation

type PlayerConnection = {
  id: number
  name: string
  ws: WebSocket
}

const loginPlayer = (ws: WebSocket, { name, race, profession }: MessageLogin) => {
  const player = game.login(name, race, profession, ws)
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

const setSpecialAbilityLocation = (ws: WebSocket, { x, y }: MessageSetSpecialAbilityLocation) => {
  game.setSpecialAbilityLocation(ws, x, y)
}

const getItem = (ws: WebSocket, { x, y }: MessageGetItem) => {
  game.getItem(ws, x, y)
}
