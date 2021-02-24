import { addRandomWalls, createEmptyMap } from './map'
import { Creature, Player } from './mob'
import { Level } from './level'

export class Game<T> {
  constructor() {
    const level = new Level<T>()

    // Just create a random map for now
    const map = createEmptyMap()
    addRandomWalls(map, 500)
    map[0][0] = 0 // Clear starting spot

    level.setMap(map) // This will also create the map search graph

    for (let i = 0; i < 200; i++) {
      const creature = new Creature('Orc', 2, 10, this.getNextId(), 'monster')
      const startingLocation = level.getRandomLocation()
      creature.x = startingLocation.x
      creature.y = startingLocation.y
      creature.setDestination(startingLocation.x, startingLocation.y)

      level.creatures.set(creature.id, creature)
    }

    this.levels.set(1, level)
  }

  nextId = 1
  tick = 1
  players = new Map<T, Player<T>>()
  levels = new Map<number, Level<T>>()

  getNextId(): number {
    return this.nextId++
  }

  update(): void {
    this.tick++
    this.levels.forEach((l) => {
      l.creatures.forEach((c) => {
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
    const player = new Player(name, 1, 10, this.getNextId(), connection)

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
