// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { NewDungeon } from 'random-dungeon-generator'

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
