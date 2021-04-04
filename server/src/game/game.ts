import { randomConsumables, randomDungeon, randomMeleeWeapons, randomMonsters } from './map'
import { MOBUpdateNotes, Player } from './mob'
import { Level } from './levels/level'
import { performance } from 'perf_hooks'
import { monsterSettings, MonsterType } from './mob/monsterFactory'
import { playerFactory } from './characters'
import { PlayerProfession, PlayerRace, SquareType } from 'dng-shared'
import { nextId } from './id'
import { createTownLevel } from './levels/town'
import { Stairs } from './levels/stairs'

export class Game<T> {
  constructor() {
    const level = new Level<T>(nextId())
    const map = randomDungeon(200, 100)
    level.setWalls(map, SquareType.Wall) // This will also create the map search graph

    // Create a stairway back up to town in the middle of the level (town will connect when it is created)
    const stairs: Stairs = {
      id: nextId(),
      x: 100,
      y: 50
    }
    level.stairs.set(stairs.id, stairs)

    // Add some level 1 mosnters
    Object.entries(monsterSettings)
      .filter(([_, value]) => value.level === 1)
      .map(([key]) => key as MonsterType)
      .forEach((monsterName) => {
        randomMonsters(monsterName, 30, level)
      })

    // Need to reupdate the graph after adding monsters
    level.updateGraph()

    // Create the town level (connected to the stairs on the 1st level)
    const townLevel = createTownLevel<T>(stairs)

    // Add the levels to the game
    this.levels.set(townLevel.id, townLevel)
    this.levels.set(level.id, level)

    // Players start in town
    this.startingLevelId = townLevel.id
  }

  tick = 1
  players = new Map<T, Player<T>>()
  levels = new Map<number, Level<T>>()
  startingLevelId: number

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
        const stairs = l.stairsCheck(p.x, p.y)
        if (stairs) {
          // Player is standing on stairs
          // See if stairs go up or down
          const stairsId = stairs.stairsDown || stairs.stairsUp
          if (!stairsId) {
            throw new Error('Invalid stairs have no up or down id')
          }
          // Find the connecting stairs. Search all levels
          const { level: newLevel, stairs: connectingStairs } = this.findStairs(stairsId)

          // Move the player to the new level

          // Remove from old level
          l.players.delete(p.id)

          // Add to new level
          newLevel.players.set(p.id, p)

          // For now just put the player 1 square away so they don't loop on the stairs
          // TODO: Look for empty space around stairs
          p.x = connectingStairs.x + 1
          p.y = connectingStairs.y
          p.haltEverything() // Stop their movement and any active special abilities

          // Player is on a new level, need to send new map to client
          p.movedLevels = true
        }
      })
    })

    return perfList
  }

  findStairs(stairsId: number): { level: Level<T>; stairs: Stairs } {
    const iterator = this.levels[Symbol.iterator]()

    for (const [, level] of iterator) {
      const stairs = level.stairs.get(stairsId)
      if (stairs) {
        return { level, stairs }
      }
    }

    throw new Error(`Could not find stairs ${stairsId}`)
  }

  getFirstLevel(): Level<T> {
    const level = this.levels.get(this.startingLevelId)

    if (!level) {
      throw new Error('Game does not have starting level')
    }

    return level
  }

  login(
    name: string,
    race: PlayerRace,
    profession: PlayerProfession,
    connection: T
  ): { player: Player<T>; level: Level<T> } {
    const level = this.getFirstLevel()
    const player = playerFactory(race, profession, name, 1, connection)

    const startingLocation = level.findOpenLocation()
    player.x = startingLocation.x
    player.y = startingLocation.y
    player.setDestination(startingLocation.x, startingLocation.y)

    this.players.set(connection, player)
    level.players.set(player.id, player)

    return { player, level }
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

  setSpecialAbilityLocation(connection: T, x: number, y: number): void {
    const player = this.players.get(connection)

    if (!player) {
      console.log('No player found')
      return
    }

    player.setSpecialAbility(x, y)
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
