// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { NewDungeon } from 'random-dungeon-generator'
import { Level } from './level'
import { monsterFactory, MonsterType } from './monsters'

export enum SquareType {
  Empty = 0,
  Wall = 1
}

const mapWidth = 200
const mapHeight = 100

export const createEmptyMap = (): SquareType[][] => {
  const map: SquareType[][] = new Array(mapHeight)
  for (let y = 0; y < mapHeight; y++) {
    map[y] = new Array(mapWidth).fill(SquareType.Empty)
  }

  return map
}

export const addRandomWalls = (map: SquareType[][], wallCount: number): void => {
  for (let i = 0; i < wallCount; i++) {
    const x = Math.floor(Math.random() * map[0].length)
    const y = Math.floor(Math.random() * map.length)

    map[y][x] = SquareType.Wall
  }
}

export const randomDungeon = (): number[][] => {
  const options = {
    width: mapWidth,
    height: mapHeight,
    minRoomSize: 5,
    maxRoomSize: 20
  }
  const dungeon = NewDungeon(options) as number[][]

  for (let y = 0; y < dungeon.length; y++) {
    for (let x = 0; x < dungeon[y].length; x++) {
      if (dungeon[y][x] > 1) {
        dungeon[y][x] = 0
      }
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

export const findOpenSpace = (level: Level<unknown>): { x: number; y: number } => {
  let attempts = 0
  let location: { x: number; y: number }
  do {
    location = level.getRandomLocation()
    attempts++
    if (attempts > 500) {
      throw new Error(`Could not find an empty location after ${attempts} attempts.`)
    }
  } while (level.map[location.y][location.x] > 0 || level.locationContainsMob(location.y, location.x))
  return location
}
