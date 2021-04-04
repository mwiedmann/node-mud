// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { NewDungeon } from 'random-dungeon-generator'
import { Consumable, ConsumableTypes } from './consumable'
import { MeleeType, MeleeWeaponFactory } from './item'
import { Level } from './levels/level'
import { Monster } from './mob'
import { monsterFactory, MonsterType } from './mob/monsterFactory'
import { SquareType } from 'dng-shared'

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

export const randomDungeon = (
  mapWidth: number,
  mapHeight: number,
  floorTileStart: number,
  floorTypeCount: number,
  wallTileStart: number,
  wallTypeCount: number
): number[][] => {
  const options = {
    width: mapWidth,
    height: mapHeight,
    minRoomSize: 5,
    maxRoomSize: 20
  }
  const dungeon = NewDungeon(options) as number[][]

  for (let y = 0; y < dungeon.length; y++) {
    for (let x = 0; x < dungeon[y].length; x++) {
      dungeon[y][x] =
        dungeon[y][x] === 1
          ? wallTileStart + Math.floor(Math.random() * wallTypeCount)
          : floorTileStart + Math.floor(Math.random() * floorTypeCount)
    }
  }

  return dungeon
}

export const randomMonsters = (type: MonsterType, count: number, level: Level<unknown>): void => {
  for (let i = 0; i < count; i++) {
    const monster = monsterFactory(type)

    // This helps stagger the movements of all the monsters
    monster.lastMoveTick = Math.floor(Math.random() * monster.ticksPerMove) + 1

    const location = findOpenSpace(level)

    monster.x = location.x
    monster.y = location.y

    monster.setDestination(location.x, location.y)

    level.monsters.set(monster.id, monster)
  }
}

export const randomConsumables = (type: ConsumableTypes, count: number, level: Level<unknown>): void => {
  for (let i = 0; i < count; i++) {
    const c = new Consumable()
    c.type = type
    c.health = 5

    const location = findOpenSpace(level)

    c.x = location.x
    c.y = location.y

    level.items.set(c.key(), c)
  }
}

export const randomMeleeWeapons = (subType: MeleeType, count: number, level: Level<unknown>): void => {
  for (let i = 0; i < count; i++) {
    const c = MeleeWeaponFactory(subType)

    const location = findOpenSpace(level)

    c.x = location.x
    c.y = location.y

    level.items.set(c.key(), c)
  }
}

export const findOpenSpace = (level: Level<unknown>): { x: number; y: number } => {
  let attempts = 0
  let location: { x: number; y: number }
  do {
    location = level.getRandomLocation()
    attempts++
    if (attempts > 500) {
      throw new Error(`Could not find an empty location after ${attempts} attempts.`)
    }
  } while (level.wallsAndMobs[location.y][location.x] > 0)
  return location
}
