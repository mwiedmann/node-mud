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
      level.updateMaps()
    }

    // Players start in town
    this.startingLevelId = townLevel.id
  }

  tick = 1
  players = new Map<T, Player<T>>()
  levels = new Map<number, Level<T>>()
  startingLevelId: number

  /**
   * Run the game simulation one tick
   * @returns Update notes and performance time
   */
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

  /**
   * Search all levels for this stairs Id
   * @param stairsId Staris Id to find
   * @returns Level and stairs
   */
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

  /**
   * Get the starting level for the game
   * @returns Level
   */
  getStartingLevel(): Level<T> {
    const level = this.levels.get(this.startingLevelId)

    if (!level) {
      throw new Error('Game does not have starting level')
    }

    return level
  }

  /**
   * Register a player with the game
   * @param name Name
   * @param race Race
   * @param profession Profession
   * @param connection Connection to the player
   * @returns Player and starting Level
   */
  registerPlayer(
    name: string,
    race: PlayerRace,
    profession: PlayerProfession,
    connection: T
  ): { player: Player<T>; level: Level<T> } {
    const level = this.getStartingLevel()
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

  /**
   * Remove a player from the game
   * @param connection Player's connection
   * @returns Removed player
   */
  unregisterPlayer(connection: T): Player<T> | null {
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

  /**
   * Set a player's destination
   * @param connection Player connection
   * @param x X location
   * @param y Y location
   */
  playerSetDestination(connection: T, x: number, y: number): void {
    const player = this.players.get(connection)

    if (!player) {
      console.warn('No player found')
      return
    }

    player.setDestination(x, y)
  }

  /**
   * Set a player's special ability location
   * @param connection Player connection
   * @param x X location
   * @param y Y location
   */
  playerSetSpecialAbilityLocation(connection: T, x: number, y: number): void {
    const player = this.players.get(connection)

    if (!player) {
      console.warn('No player found')
      return
    }

    player.setSpecialAbility(this.tick, x, y)
  }

  /**
   * Have a player attempt to pick up an item
   * @param connection Player connection
   * @param x X location of item
   * @param y Y location of item
   */
  playerGetItem(connection: T, x: number, y: number): void {
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

  /**
   * Toggle a player's melee attack
   * @param connection Player connection
   */
  playerMeleeToggle(connection: T): void {
    const player = this.players.get(connection)

    if (!player) {
      console.warn('No player found')
      return
    }

    player.meleeOn = !player.meleeOn
  }

  /**
   * Toggle a player's ranged attack
   * @param connection Player connection
   */
  playerRangedToggle(connection: T): void {
    const player = this.players.get(connection)

    if (!player) {
      console.warn('No player found')
      return
    }

    player.rangedOn = !player.rangedOn
  }

  /**
   * Toggle a player's spell casting
   * @param connection Player connection
   */
  playerSpellToggle(connection: T): void {
    const player = this.players.get(connection)

    if (!player) {
      console.warn('No player found')
      return
    }

    player.spellOn = !player.spellOn
  }
}

/**
 * Create a Game
 * @returns New Game
 */
export const createGame = <T>(): Game<T> => {
  return new Game()
}
