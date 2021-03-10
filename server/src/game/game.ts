import { randomConsumables, randomDungeon, randomMeleeWeapons, randomMonsters } from './map'
import { MOBUpdateNotes, Player } from './mob'
import { Level } from './level'
import { playerFactory } from './players'
import { performance } from 'perf_hooks'
import { monsterSettings, MonsterType } from './monsters'

export class Game<T> {
  constructor() {
    const level = new Level<T>()

    // Just create a random map for now
    // const map = createEmptyMap()
    // addRandomWalls(map, 500)
    // map[0][0] = 0 // Clear starting spot

    const map = randomDungeon(200, 100)
    level.setWalls(map) // This will also create the map search graph

    // Add some level 1 mosnters
    Object.entries(monsterSettings)
      .filter(([_, value]) => value.level === 1)
      .map(([key]) => key as MonsterType)
      .forEach((monsterName) => {
        randomMonsters(monsterName, 30, level)
      })

    randomConsumables('healing', 20, level)

    randomMeleeWeapons('axe', 10, level)
    randomMeleeWeapons('battleaxe', 10, level)
    randomMeleeWeapons('broadsword', 10, level)
    randomMeleeWeapons('dagger', 10, level)
    randomMeleeWeapons('greatsword', 10, level)
    randomMeleeWeapons('longsword', 10, level)
    randomMeleeWeapons('mace', 10, level)
    randomMeleeWeapons('shortsword', 10, level)
    randomMeleeWeapons('spear', 10, level)
    randomMeleeWeapons('staff', 10, level)

    // Need to reupdate the graph after adding monsters
    level.updateGraph()

    this.levels.set(1, level)
  }

  tick = 1
  players = new Map<T, Player<T>>()
  levels = new Map<number, Level<T>>()

  update(): { notes: MOBUpdateNotes; time: number }[] {
    const perfList: { notes: MOBUpdateNotes; time: number }[] = []

    this.tick++
    this.levels.forEach((l) => {
      l.monsters.forEach((c) => {
        const monsterStartTime = performance.now()
        const monsterNotes = c.update(this.tick, l)

        // If the monster moved, we need to update the master map (used for path finding)
        if (monsterNotes.moved) {
          l.moveMonster(monsterNotes.moved)
        }
        perfList.push({
          notes: monsterNotes,
          time: Math.floor(performance.now() - monsterStartTime)
        })
      })
      l.players.forEach((p) => {
        p.update(this.tick, l)
      })
    })

    return perfList
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
    const player = playerFactory('human', 'ranger', name, 1, connection)

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

  getItem(connection: T, x: number, y: number): void {
    const player = this.players.get(connection)

    if (!player) {
      console.log('No player found')
      return
    }

    this.levels.forEach((l) => {
      if (l.players.has(player.id)) {
        l.grabItem(player)
      }
    })
  }
}

export const createGame = <T>(): Game<T> => {
  return new Game()
}
