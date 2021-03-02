import { AStarFinder } from 'astar-typescript'
import { createMapWithMonsters, findOpenSpace, Moved, SquareType } from './map'
import { Monster, Player } from './mob'

export class Level<T> {
  walls: SquareType[][] = []
  wallsAndMobs: SquareType[][] = []
  players: Map<number, Player<T>> = new Map()
  monsters: Map<number, Monster> = new Map()
  private graph!: AStarFinder

  findPath(start: { x: number; y: number }, end: { x: number; y: number }): number[][] {
    // Get the start and end nodes and set them to walkable
    // We want to ignore those blocking spaces
    const startNode = this.graph.getGrid().getGridNodes()[start.y][start.x]
    const endNode = this.graph.getGrid().getGridNodes()[end.y][end.x]
    const startWalkable = startNode.getIsWalkable()
    const endWalkable = endNode.getIsWalkable()
    startNode.setIsWalkable(true)
    endNode.setIsWalkable(true)

    const path = this.graph.findPath(start, end)

    // Put the nodes back as they were
    startNode.setIsWalkable(startWalkable)
    endNode.setIsWalkable(endWalkable)

    return path
  }

  moveMonster(moveData: Moved): void {
    this.graph.getGrid().getGridNodes()[moveData.fromY][moveData.fromX].setIsWalkable(true)
    this.graph.getGrid().getGridNodes()[moveData.toY][moveData.toX].setIsWalkable(false)
    this.wallsAndMobs[moveData.fromY][moveData.fromX] = this.walls[moveData.fromY][moveData.fromX] // In case there was something there rather than force to Empty
    this.wallsAndMobs[moveData.toY][moveData.toX] = SquareType.Monster
  }

  removeMonster(x: number, y: number): void {
    this.graph.getGrid().getGridNodes()[y][x].setIsWalkable(true)
    this.wallsAndMobs[y][x] = this.walls[y][x]
  }

  setWalls(map: SquareType[][]): void {
    this.walls = map
    this.updateGraph()
  }

  updateGraph(): void {
    this.wallsAndMobs = createMapWithMonsters(this.walls, this.monsters)

    this.graph = new AStarFinder({
      grid: {
        matrix: this.wallsAndMobs
      },
      diagonalAllowed: true,
      includeStartNode: false
      // includeEndNode: false
      // heuristic: 'Chebyshev'
    })
  }

  getRandomLocation({ range, x, y }: { range?: number; x?: number; y?: number } = {}): { x: number; y: number } {
    x = x ?? Math.floor(this.wallsAndMobs[0].length / 2)
    y = y ?? Math.floor(this.wallsAndMobs.length / 2)
    range = range ?? 999999

    const xMin = Math.max(x - range, 0)
    const yMin = Math.max(y - range, 0)
    const xMax = Math.min(x + range, this.wallsAndMobs[0].length - 1)
    const yMax = Math.min(y + range, this.wallsAndMobs.length - 1)

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

  locationIsBlocked(x: number, y: number): boolean {
    if (this.wallsAndMobs[y][x] > 0) {
      return true
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
