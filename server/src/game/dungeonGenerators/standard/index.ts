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

  const map = createEmptyMap(mapWidth, mapHeight, floorTileStart, floorTypeCount)

  dng.rooms.forEach((r) => {
    for (let y = r.pos.y; y < r.pos.y + r.size.y; y++) {
      for (let x = r.pos.x; x < r.pos.x + r.size.x; x++) {
        const tileX = x - r.pos.x
        const tileY = y - r.pos.y
        const tileType = r.tiles[tileY][tileX]

        if (tileType === Tiles.wall || tileType === Tiles.blank) {
          map[y][x] = wallTileStart + Math.floor(Math.random() * wallTypeCount)
        }
      }
    }
  })

  const stairs = dng.getStairs()

  return { map, stairsUp: stairs.up as XY, stairsDown: stairs.down as XY }
}
