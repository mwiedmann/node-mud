import { addRandomWalls, createEmptyMap } from './map'
import { Player } from './mob'
import { Level } from './level'
import { nextId } from './id'
import { monsterFactory } from './monsters'

export class Game<T> {
  constructor() {
    const level = new Level<T>()

    // Just create a random map for now
    const map = createEmptyMap()
    addRandomWalls(map, 500)
    map[0][0] = 0 // Clear starting spot

    level.setMap(map) // This will also create the map search graph

    for (let i = 0; i < 10; i++) {
      const monster = i < 60 ? monsterFactory('orc') : i < 90 ? monsterFactory('ogre') : monsterFactory('dragon')

      // This helps stagger the movements of all the monsters
      monster.lastMoveTick = Math.floor(Math.random() * monster.ticksPerMove) + 1
      const startingLocation = level.getRandomLocation()
      monster.x = startingLocation.x
      monster.y = startingLocation.y
      monster.setDestination(startingLocation.x, startingLocation.y)

      level.monsters.set(monster.id, monster)
    }

    this.levels.set(1, level)
  }

  tick = 1
  players = new Map<T, Player<T>>()
  levels = new Map<number, Level<T>>()

  update(): void {
    this.tick++
    this.levels.forEach((l) => {
      l.monsters.forEach((c) => {
        c.update(this.tick, l)
      })
      l.players.forEach((p) => {
        p.update(this.tick, l)
      })
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
    const player = new Player(name, 1, 50, nextId(), connection)

    const startingLocation = level.getRandomLocation()
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
