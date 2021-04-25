import { findOpenSpace, randomConsumables, randomGroup, randomMeleeWeapons, randomMonsters } from './map'
import { MOBUpdateNotes, Player } from './mob'
import { Level } from './levels/level'
import { performance } from 'perf_hooks'
import { monsterSettings, MonsterType } from './mob/monsterFactory'
import { playerFactory } from './characters'
import { PlayerProfession, PlayerRace, wallRanges, floorRanges } from 'dng-shared'
import { nextId } from './id'
import { createTownLevel } from './levels/town'
import { Stairs } from './levels/stairs'
import { randomDungeon } from './dungeonGenerators/standard'

export class Game<T> {
  constructor() {
    const maxLevel = 6

    // Create the town level (connected to the stairs on the 1st level)
    const { level: townLevel, stairs: townStairs } = createTownLevel<T>()

    this.levels.set(townLevel.id, townLevel)
    let lastDownStairs = townStairs

    // Create a town with a 5 level dungeon
    for (let i = 2; i <= maxLevel; i++) {
      const level = new Level<T>(nextId())
      this.levels.set(level.id, level)

      const { map, stairsUp, stairsDown } = randomDungeon(
        100,
        100,
        floorRanges.blueMarble.start,
        floorRanges.blueMarble.length,
        wallRanges.grayBrick.start,
        wallRanges.grayBrick.length
      )

      // Create a stairway back up
      const stairsObjUp: Stairs = {
        id: nextId(),
        x: stairsUp.x,
        y: stairsUp.y,
        stairsUp: lastDownStairs.id
      }
      level.stairs.set(stairsObjUp.id, stairsObjUp)

      // Connect the previous down stairs to this up stairs
      lastDownStairs.stairsDown = stairsObjUp.id

      // If this is not the last level, create a stairway down
      if (i < maxLevel) {
        const stairsObjDown: Stairs = {
          id: nextId(),
          x: stairsDown.x,
          y: stairsDown.y,
          stairsDown: 999 // This will be set when the next level (and stairs) are created
        }
        level.stairs.set(stairsObjDown.id, stairsObjDown)

        // Track this as the last down stairs so it can be connected to the stairs on the next level
        lastDownStairs = stairsObjDown
      }

      level.setWalls(map) // This will also add stairs and create the map search graph

      // Add some mosnters. Monster level will equal dungeon level. Fix later.
      Object.entries(monsterSettings)
        .filter(([_, value]) => value.level === i)
        .map(([key]) => key as MonsterType)
        .forEach((monsterName) => {
          // randomMonsters(monsterName, 15, level)
          if (i === 6) {
            // Legendary level
            randomGroup(monsterName, 5, 7, level)
          } else {
            for (let k = 0; k < 3; k++) {
              randomGroup(monsterName, 3, 5, level)
            }
          }
        })

      // Need to reupdate the map/graph after adding monsters and stairs
      level.updateGraph()
    }

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
        if (p.dead) {
          return
        }
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

    const stairsUp = level.getStairsUp()
    const startingLocation = findOpenSpace(level, stairsUp && { x: stairsUp.x, y: stairsUp.y, range: 2 })
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
      console.warn('No player found')
      return
    }

    player.setDestination(x, y)
  }

  setSpecialAbilityLocation(connection: T, x: number, y: number): void {
    const player = this.players.get(connection)

    if (!player) {
      console.warn('No player found')
      return
    }

    player.setSpecialAbility(this.tick, x, y)
  }

  getItem(connection: T, x: number, y: number): void {
    const player = this.players.get(connection)

    if (!player) {
      console.warn('No player found')
      return
    }

    this.levels.forEach((l) => {
      if (l.players.has(player.id)) {
        l.grabItem(player)
      }
    })
  }

  meleeToggle(connection: T): void {
    const player = this.players.get(connection)

    if (!player) {
      console.warn('No player found')
      return
    }

    player.meleeOn = !player.meleeOn
  }

  rangedToggle(connection: T): void {
    const player = this.players.get(connection)

    if (!player) {
      console.warn('No player found')
      return
    }

    player.rangedOn = !player.rangedOn
  }

  spellToggle(connection: T): void {
    const player = this.players.get(connection)

    if (!player) {
      console.warn('No player found')
      return
    }

    player.spellOn = !player.spellOn
  }
}

export const createGame = <T>(): Game<T> => {
  return new Game()
}
