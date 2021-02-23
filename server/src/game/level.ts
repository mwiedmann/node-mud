import { AStarFinder } from "astar-typescript"
import { SquareType } from "./map"
import { Creature, Player } from "./mob"

export class Level<T> {
  map: SquareType[][] = []
  players: Map<number, Player<T>> = new Map()
  creatures: Map<number, Creature> = new Map()
  graph!: AStarFinder

  setMap(map: SquareType[][]) {
    this.map = map
    this.graph = new AStarFinder({
      grid: {
        matrix: map
      },
      diagonalAllowed: false,
      heuristic: 'Chebyshev'
    })
  }

  getRandomLocation({ range, x, y }: { range?: number, x?: number, y?: number } = {}) {
    x = x ?? Math.floor(this.map[0].length / 2)
    y = y ?? Math.floor(this.map.length / 2)
    range = range ?? 999999

    const xMin = Math.max(x - range, 0)
    const yMin = Math.max(y - range, 0)
    const xMax = Math.min(x + range, this.map[0].length - 1)
    const yMax = Math.min(y + range, this.map.length - 1)

    return {
      x: xMin + Math.floor(Math.random() * ((xMax + 1) - xMin)),
      y: yMin + Math.floor(Math.random() * ((yMax + 1) - yMin))
    }
  }
}