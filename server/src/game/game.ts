import { randomDungeon, randomMonsters } from './map'
import { Player } from './mob'
import { Level } from './level'
import { playerFactory } from './players'

export class Game<T> {
  constructor() {
    const level = new Level<T>()

    // Just create a random map for now
    // const map = createEmptyMap()
    // addRandomWalls(map, 500)
    // map[0][0] = 0 // Clear starting spot

    const map = randomDungeon()
    level.setWalls(map) // This will also create the map search graph

    // randomMonsters('orc', 1, level)

    randomMonsters('orc', 50, level)
    randomMonsters('ogre', 10, level)
    randomMonsters('dragon', 1, level)

    // Need to reupdate the graph after adding monsters
    level.updateGraph()

    this.levels.set(1, level)
  }

  tick = 1
  players = new Map<T, Player<T>>()
  levels = new Map<number, Level<T>>()

  update(): void {
    this.tick++
    this.levels.forEach((l) => {
      let atLeastOneMonsterMoved = false
      l.monsters.forEach((c) => {
        const monsterMoved = c.update(this.tick, l)
        if (monsterMoved) {
          atLeastOneMonsterMoved = true
        }
      })
      l.players.forEach((p) => {
        p.update(this.tick, l)
      })

      // TODO: This is expensive. Only do it if a monster has moved.
      if (atLeastOneMonsterMoved) {
        l.updateGraph()
      }
    })
  }

  getFirstLevel(): Level<T> {
    const level = this.levels.get(1)

    if (!level) {
      throw new Error('Game does not have level 1')
    }

    return level
  }

  login(name: string, connection: T): Player<T> {
    const level = this.getFirstLevel()
    const player = playerFactory('dwarf', 'warrior', name, 1, connection)

    const startingLocation = level.findOpenLocation()
    player.x = startingLocation.x
    player.y = startingLocation.y
    player.setDestination(startingLocation.x, startingLocation.y)

    this.players.set(connection, player)
    level.players.set(player.id, player)

    return player
  }

  logout(connection: T): Player<T> | null {
    const player = this.players.get(connection)

    if (!player) {
      return null
    }

    this.players.delete(connection)

    this.levels.forEach((l) => {
      l.players.delete(player.id)
    })

    return player
  }

  setDestination(connection: T, x: number, y: number): void {
    const player = this.players.get(connection)

    if (!player) {
      console.log('No player found')
      return
    }

    player.setDestination(x, y)
  }
}

export const createGame = <T>(): Game<T> => {
  return new Game()
}
