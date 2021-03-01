import { AStarFinder } from 'astar-typescript'
import { findOpenSpace, SquareType } from './map'
import { Monster, Player } from './mob'

export class Level<T> {
  map: SquareType[][] = []
  players: Map<number, Player<T>> = new Map()
  monsters: Map<number, Monster> = new Map()
  private graph!: AStarFinder

  findPath(start: { x: number; y: number }, end: { x: number; y: number }): number[][] {
    const path = this.graph.findPath(start, end)

    // The first node is the starting location, remove it
    if (path.length > 0) {
      path.shift()
    }

    return path
  }

  setMap(map: SquareType[][]): void {
    this.map = map
    this.graph = new AStarFinder({
      grid: {
        matrix: map
      },
      diagonalAllowed: true
      // heuristic: 'Chebyshev'
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

  findOpenLocation(): { x: number; y: number } {
    return findOpenSpace(this)
  }

  monsterInRange(x: number, y: number, range: number): Monster | undefined {
    const iterator = this.monsters[Symbol.iterator]()

    for (const m of iterator) {
      if (!m[1].dead && Math.abs(m[1].x - x) <= range && Math.abs(m[1].y - y) <= range) {
        return m[1]
      }
    }

    return undefined
  }

  playerInRange(x: number, y: number, range: number): Player<unknown> | undefined {
    const iterator = this.players[Symbol.iterator]()

    for (const p of iterator) {
      if (!p[1].dead && Math.abs(p[1].x - x) <= range && Math.abs(p[1].y - y) <= range) {
        return p[1]
      }
    }

    return undefined
  }

  locationContainsMob(x: number, y: number): boolean {
    const monIterator = this.monsters[Symbol.iterator]()

    for (const m of monIterator) {
      if (!m[1].dead && m[1].x === x && m[1].y === y) {
        return true
      }
    }

    const playerIterator = this.players[Symbol.iterator]()

    for (const p of playerIterator) {
      if (!p[1].dead && p[1].x === x && p[1].y === y) {
        return true
      }
    }

    return false
  }
}
