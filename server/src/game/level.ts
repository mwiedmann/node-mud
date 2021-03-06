import { AStarFinder } from 'astar-typescript'
import { Consumable } from './consumable'
import { Item } from './item'
import { createMapWithMonsters, findOpenSpace, Moved, getPrintableMap, SquareType } from './map'
import { MOB, Monster, Player } from './mob'

export class Level<T> {
  walls: SquareType[][] = []
  wallsAndMobs: SquareType[][] = []
  players: Map<number, Player<T>> = new Map()
  monsters: Map<number, Monster> = new Map()
  items: Map<string, Consumable | Item> = new Map()

  private createMapWithRangeBlockers(
    start: { x: number; y: number },
    end: { x: number; y: number },
    range: number
  ): AStarFinder {
    // To limit how far A* ends up searching, we create a "barrier" around startx/y at a distance of "range"
    // This prevents scenarios where a monster tries to move "just a few squares" to the other side of a wall but the search
    // path ends up winding all around the maze. This is really expensive and not needed so we are limiting the scope of the search.
    const minX = Math.max(start.x - (range + 1), 0)
    const maxX = Math.min(start.x + (range + 1), this.wallsAndMobs[0].length - 1)
    const minY = Math.max(start.y - (range + 1), 0)
    const maxY = Math.min(start.y + (range + 1), this.wallsAndMobs.length - 1)

    // Add fake walls by adding a number to form the barrier
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (x === minX || x === maxX || y === minY || y === maxY) {
          this.wallsAndMobs[y][x] += 100
        }
      }
    }

    // Create the search graph
    const graph = new AStarFinder({
      grid: {
        matrix: this.wallsAndMobs
      },
      diagonalAllowed: true,
      includeStartNode: false
      // includeEndNode: false
      // heuristic: 'Chebyshev'
    })

    // Remove fake walls by removing the barrier number. This will restore the original value
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (x === minX || x === maxX || y === minY || y === maxY) {
          this.wallsAndMobs[y][x] -= 100
        }
      }
    }

    return graph
  }

  findPath(start: { x: number; y: number }, end: { x: number; y: number }, range: number): number[][] {
    const graph = this.createMapWithRangeBlockers(start, end, range)

    // Get the start and end nodes and set them to walkable
    // We want to ignore those blocking spaces
    const startNode = graph.getGrid().getGridNodes()[start.y][start.x]
    const endNode = graph.getGrid().getGridNodes()[end.y][end.x]

    startNode.setIsWalkable(true)
    endNode.setIsWalkable(true)

    const path = graph.findPath(start, end)

    return path
  }

  moveMonster(moveData: Moved): void {
    this.wallsAndMobs[moveData.fromY][moveData.fromX] = this.walls[moveData.fromY][moveData.fromX] // In case there was something there rather than force to Empty
    this.wallsAndMobs[moveData.toY][moveData.toX] = SquareType.Monster
  }

  removeMonster(x: number, y: number): void {
    this.wallsAndMobs[y][x] = this.walls[y][x]
  }

  setWalls(map: SquareType[][]): void {
    this.walls = map
    this.updateGraph()
  }

  updateGraph(): void {
    this.wallsAndMobs = createMapWithMonsters(this.walls, this.monsters)
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

  grabConsumable(player: MOB): Consumable | undefined {
    const key = `${player.x},${player.y}`
    const c = this.items.get(key)

    if (c instanceof Consumable && !c.gone) {
      c.apply(player)

      // Leave it in the list so the UI will get an update that it has been consumed later.
      // TODO: If/when should we remove it? Do they "respawn"
      // this.consumables.delete(key)
      return c
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
