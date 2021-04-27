import { Consumable, ConsumableTypes } from './consumable'
import { MeleeType, MeleeWeaponFactory } from './item'
import { Level } from './levels/level'
import { Monster } from './mob'
import { monsterFactory, monsterGroups, MonsterType } from './mob/monsterFactory'
import { SquareType } from 'dng-shared'
import { inRange, randomPick, randomRange } from './util'

export type Moved = {
  fromX: number
  fromY: number
  toX: number
  toY: number
}

export const getPrintableMap = (map: SquareType[][]): string => {
  return map.reduce((prev, next) => {
    return prev + next.join(' ') + '\n'
  }, '')
}

export const createEmptyMap = (
  mapWidth: number,
  mapHeight: number,
  floorTileStart = 0,
  floorTypeCount = 0
): number[][] => {
  const map: SquareType[][] = new Array(mapHeight)
  for (let y = 0; y < mapHeight; y++) {
    map[y] = new Array(mapWidth)
      .fill(0)
      .map((_) => (floorTypeCount ? floorTileStart + Math.floor(Math.random() * floorTypeCount) : floorTileStart))
  }

  return map
}

export const addBorderToMap = (
  map: number[][],
  start: { x: number; y: number },
  end: { x: number; y: number },
  borderPieceTileStart: number,
  borderPieceTypeCount: number
): void => {
  for (let y = start.y; y <= end.y; y++) {
    for (let x = start.x; x <= end.x; x++) {
      if (x === start.x || x === end.x || y === start.y || y === end.y) {
        map[y][x] = borderPieceTileStart + Math.floor(Math.random() * borderPieceTypeCount)
      }
    }
  }
}

export const createMapWithMonsters = (wallMap: SquareType[][], monsters: Map<number, Monster>): SquareType[][] => {
  const mapWidth = wallMap[0].length
  const mapHeight = wallMap.length

  // First create a map with the monster locations
  const monsterMap = createEmptyMap(wallMap[0].length, wallMap.length)
  const monIterator = monsters[Symbol.iterator]()
  for (const [, monster] of monIterator) {
    if (!monster.dead) {
      monsterMap[monster.y][monster.x] = SquareType.Monster
    }
  }

  const combinedMap: SquareType[][] = new Array(mapHeight)
  // Create a new map that combines the monster map and wall maps
  for (let y = 0; y < mapHeight; y++) {
    combinedMap[y] = new Array(mapWidth).fill(SquareType.Empty)
    for (let x = 0; x < mapWidth; x++) {
      combinedMap[y][x] = wallMap[y][x] > 0 ? wallMap[y][x] : monsterMap[y][x]
    }
  }

  return combinedMap
}

export const addRandomWalls = (map: SquareType[][], wallCount: number): void => {
  for (let i = 0; i < wallCount; i++) {
    const x = Math.floor(Math.random() * map[0].length)
    const y = Math.floor(Math.random() * map.length)

    map[y][x] = SquareType.Wall
  }
}

export const randomMonsters = (type: MonsterType, count: number, level: Level<unknown>): void => {
  for (let i = 0; i < count; i++) {
    const monster = monsterFactory(type)

    // This helps stagger the movements of all the monsters
    monster.lastMoveTick = Math.floor(Math.random() * monster.ticksPerMove) + 1

    const stairsUp = level.getStairsUp()
    const location = findOpenSpace(level, stairsUp && { x: stairsUp.x, y: stairsUp.y, range: 20 })

    monster.setSpawn(location.x, location.y)
    monster.setDestination(location.x, location.y)

    level.monsters.set(monster.id, monster)
  }
}

export const randomGroup = (type: MonsterType, groupMin: number, groupMax: number, level: Level<unknown>): void => {
  const stairsUp = level.getStairsUp()
  const location = findOpenSpace(level, stairsUp && { x: stairsUp.x, y: stairsUp.y, range: 20 })

  const leader = monsterFactory(type)
  // This helps stagger the movements of all the monsters
  leader.lastMoveTick = Math.floor(Math.random() * leader.ticksPerMove) + 1
  leader.setSpawn(location.x, location.y)
  leader.setDestination(location.x, location.y)

  level.monsters.set(leader.id, leader)

  // Get the types of followers for this monster and get a random group size
  const followers = monsterGroups[type]
  const groupSize = randomRange(groupMin, groupMax)

  // Create minions for this monster
  for (let i = 0; i < groupSize; i++) {
    const minion = monsterFactory(randomPick(followers))

    const minionLocation = findOpenSpace(level, undefined, {
      range: 4,
      x: leader.x,
      y: leader.y
    })
    minion.setSpawn(minionLocation.x, minionLocation.y)
    minion.setDestination(minionLocation.x, minionLocation.y)
    level.monsters.set(minion.id, minion)
  }

  // Add a healing potion around
  const c = new Consumable()
  c.type = 'healing'
  c.health = leader.level * 3
  const potionLocation = findOpenSpace(level, undefined, {
    range: 2,
    x: leader.x,
    y: leader.y
  })
  c.x = potionLocation.x
  c.y = potionLocation.y

  level.items.set(c.key(), c)
}

export const randomConsumables = (type: ConsumableTypes, count: number, level: Level<unknown>): void => {
  for (let i = 0; i < count; i++) {
    const c = new Consumable()
    c.type = type
    c.health = 5

    const stairsUp = level.getStairsUp()
    const location = findOpenSpace(level, stairsUp && { x: stairsUp.x, y: stairsUp.y, range: 15 })

    c.x = location.x
    c.y = location.y

    level.items.set(c.key(), c)
  }
}

export const randomMeleeWeapons = (subType: MeleeType, count: number, level: Level<unknown>): void => {
  for (let i = 0; i < count; i++) {
    const c = MeleeWeaponFactory(subType)

    const stairsUp = level.getStairsUp()
    const location = findOpenSpace(level, stairsUp && { x: stairsUp.x, y: stairsUp.y, range: 15 })

    c.x = location.x
    c.y = location.y

    level.items.set(c.key(), c)
  }
}

export const findOpenSpace = (
  level: Level<unknown>,
  avoid?: { x: number; y: number; range: number },
  near?: { range: number; x: number; y: number }
): { x: number; y: number } => {
  let attempts = 0
  let location: { x: number; y: number }
  do {
    location = level.getRandomLocation(near)
    attempts++
    if (attempts > 500) {
      throw new Error(`Could not find an empty location after ${attempts} attempts.`)
    }
  } while (
    level.wallsAndMobs[location.y][location.x] > 0 ||
    (avoid && inRange(avoid.range, location.x, location.y, avoid.x, avoid.y))
  )
  return location
}
