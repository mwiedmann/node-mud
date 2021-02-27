import { AStarFinder } from 'astar-typescript'
import { SquareType } from './map'
import { Monster, Player } from './mob'

export class Level<T> {
  map: SquareType[][] = []
  players: Map<number, Player<T>> = new Map()
  monsters: Map<number, Monster> = new Map()
  graph!: AStarFinder

  setMap(map: SquareType[][]): void {
    this.map = map
    this.graph = new AStarFinder({
      grid: {
        matrix: map
      },
      diagonalAllowed: false,
      heuristic: 'Chebyshev'
    })
  }

  getRandomLocation({ range, x, y }: { range?: number; x?: number; y?: number } = {}): { x: number; y: number } {
    x = x ?? Math.floor(this.map[0].length / 2)
    y = y ?? Math.floor(this.map.length / 2)
    range = range ?? 999999

    const xMin = Math.max(x - range, 0)
    const yMin = Math.max(y - range, 0)
    const xMax = Math.min(x + range, this.map[0].length - 1)
    const yMax = Math.min(y + range, this.map.length - 1)

    return {
      x: xMin + Math.floor(Math.random() * (xMax + 1 - xMin)),
      y: yMin + Math.floor(Math.random() * (yMax + 1 - yMin))
    }
  }

  adjecentMonster(x: number, y: number): Monster | undefined {
    const iterator = this.monsters[Symbol.iterator]()

    for (const m of iterator) {
      if (!m[1].dead && Math.abs(m[1].x - x) <= 1 && Math.abs(m[1].y - y) <= 1) {
        return m[1]
      }
    }

    return undefined
  }

  adjecentPlayer(x: number, y: number): Player<unknown> | undefined {
    const iterator = this.players[Symbol.iterator]()

    for (const p of iterator) {
      if (!p[1].dead && Math.abs(p[1].x - x) <= 1 && Math.abs(p[1].y - y) <= 1) {
        return p[1]
      }
    }

    return undefined
  }
}
