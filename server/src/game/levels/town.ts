import { floorRanges, wallRanges } from 'dng-shared'
import { nextId } from '../id'
import { addBorderToMap, createEmptyMap } from '../map'
import { Level } from './level'
import { Stairs } from './stairs'

const width = 10
const height = 10

export const createTownLevel = <T>(): { level: Level<T>; stairs: Stairs } => {
  const level = new Level<T>(nextId())

  const map = createEmptyMap(10, 10, floorRanges.brownPebble.start, floorRanges.brownPebble.length)
  addBorderToMap(
    map,
    { x: 0, y: 0 },
    { x: width - 1, y: height - 1 },
    wallRanges.whiteBrick.start,
    wallRanges.whiteBrick.length
  )

  // Create the town stairs down into the dungeon
  // Need to connect the stairs once the next level is created
  const stairs: Stairs = {
    id: nextId(),
    x: Math.ceil(width / 2),
    y: Math.ceil(height / 2),
    stairsDown: 999 // This will be updated once the next level is created and we have a stairsId
  }
  // Add the stairs to the level
  level.stairs.set(stairs.id, stairs)

  level.setWalls(map)

  return { level, stairs }
}
