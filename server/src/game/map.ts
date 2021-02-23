export enum SquareType {
  Empty = 0,
  Wall = 1
}

export const createEmptyMap = () => {
  const map: SquareType[][] = new Array(100)
  for (let y = 0; y < 100; y++) {
    map[y] = new Array(178).fill(SquareType.Empty)
  }

  return map
}

export const addRandomWalls = (map: SquareType[][], wallCount: number) => {
  for (let i = 0; i < wallCount; i++) {
    const x = Math.floor(Math.random() * map[0].length)
    const y = Math.floor(Math.random() * map.length)

    map[y][x] = SquareType.Wall
  }
}
