import { createEmptyMap } from '../../map'
import Dungeon from './dungeon'
import Tiles from './tiles'

export type XY = { x: number; y: number }

export const randomDungeon = (
  mapWidth: number,
  mapHeight: number,
  floorTileStart: number,
  floorTypeCount: number,
  wallTileStart: number,
  wallTypeCount: number
): {
  map: number[][]
  stairsDown: XY
  stairsUp: XY
} => {
  const dng = new Dungeon(mapWidth, mapHeight)
  dng.generate()

  // Start the entire dungeon as solid walls
  // We will then carve out rooms
  const map = createEmptyMap(mapWidth, mapHeight, wallTileStart, wallTypeCount)

  dng.rooms.forEach((r) => {
    for (let y = r.pos.y; y < r.pos.y + r.size.y; y++) {
      for (let x = r.pos.x; x < r.pos.x + r.size.x; x++) {
        const tileX = x - r.pos.x
        const tileY = y - r.pos.y
        const tileType = r.tiles[tileY][tileX]

        // Turn all non-wall/blanks into floor spaces
        if (tileType !== Tiles.wall) {
          map[y][x] = floorTileStart + Math.floor(Math.random() * floorTypeCount)
        }
      }
    }
  })

  const stairs = dng.getStairs()

  return { map, stairsUp: stairs.up as XY, stairsDown: stairs.down as XY }
}
