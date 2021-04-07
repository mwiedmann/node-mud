import { SquareType } from 'dng-shared'
import { nextId } from '../id'
import { addBorderToMap, createEmptyMap } from '../map'
import { Level } from './level'
import { Stairs } from './stairs'

const width = 10
const height = 10

export const createTownLevel = <T>(stairsDown: Stairs): Level<T> => {
  const level = new Level<T>(nextId())

  const map = createEmptyMap(10, 10, 8, 8)
  addBorderToMap(map, { x: 0, y: 0 }, { x: width - 1, y: height - 1 }, 96, 8)

  // Create the town stairs down into the dungeon
  const townStairs: Stairs = {
    id: nextId(),
    x: Math.ceil(width / 2),
    y: Math.ceil(height / 2),
    stairsDown: stairsDown.id
  }

  // Connect the dungeon stairs back up to the town
  stairsDown.stairsUp = townStairs.id

  // Add the stairs to the level
  level.stairs.set(townStairs.id, townStairs)

  level.setWalls(map)

  return level
}
