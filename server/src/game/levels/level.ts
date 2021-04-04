import { AStarFinder } from 'astar-typescript'
import { intersect, SquareType } from 'dng-shared'
import { Consumable } from '../consumable'
import { Item } from '../item'
import { createMapWithMonsters, findOpenSpace, Moved, getPrintableMap } from '../map'
import { MOB, Monster, Player } from '../mob'
import { Stairs } from './stairs'

export class Level<T> {
  constructor(public id: number) {}

  walls: SquareType[][] = []
  wallsAndMobs: SquareType[][] = []
  players: Map<number, Player<T>> = new Map()
  monsters: Map<number, Monster> = new Map()
  items: Map<string, Consumable | Item> = new Map()
  stairs: Map<number, Stairs> = new Map()

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

  setWalls(map: number[][], minWallValue: number): void {
    const mapWidth = map[0].length
    const mapHeight = map.length

    // Create a wall map of 0/1 for navigation
    this.walls = new Array(mapHeight)
    for (let y = 0; y < mapHeight; y++) {
      this.walls[y] = new Array(mapWidth).fill(SquareType.Empty)
      for (let x = 0; x < mapWidth; x++) {
        this.walls[y][x] = map[y][x] >= minWallValue ? SquareType.Wall : SquareType.Empty
      }
    }

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

  tileIsBlocked(startX: number, startY: number, endX: number, endY: number): boolean {
    // Can the player see this tile?
    const line = {
      startX: startX + 0.5,
      startY: startY + 0.5,
      endX: endX + 0.5,
      endY: endY + 0.5
    }

    const adj = 0.01 // We shrink the walls a tad to allow steeper angles to get by. A 45 degree check fails without this.
    for (let y = Math.min(endY, startY); y <= Math.max(endY, startY); y++) {
      for (let x = Math.min(endX, startX); x <= Math.max(endX, startX); x++) {
        const isStart = x === startX && y === startY
        const isEnd = x === endX && y === endY
        const hasTile = !isStart && !isEnd && this.walls[y][x] > 0
        if (hasTile) {
          // See if this tile is blocking any lines of sight
          if (
            intersect(line.startX, line.startY, line.endX, line.endY, x + adj, y + adj, x + (1 - adj), y + adj) ||
            intersect(line.startX, line.startY, line.endX, line.endY, x + adj, y + adj, x + adj, y + (1 - adj)) ||
            intersect(
              line.startX,
              line.startY,
              line.endX,
              line.endY,
              x + (1 - adj),
              y + adj,
              x + (1 - adj),
              y + (1 - adj)
            ) ||
            intersect(
              line.startX,
              line.startY,
              line.endX,
              line.endY,
              x + adj,
              y + (1 - adj),
              x + (1 - adj),
              y + (1 - adj)
            )
          ) {
            // console.log('Blocked', x, y)
            return true
          }
        }
      }
    }

    return false
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

  grabItem(player: MOB): Item | undefined {
    const key = `${player.x},${player.y}`
    const item = this.items.get(key)

    if (item instanceof Item && !item.gone) {
      const itemToDrop = player.removeItem(item.type)
      if (itemToDrop) {
        itemToDrop.x = player.x
        itemToDrop.y = player.y
        this.items.set(key, itemToDrop)
        console.log('Player droped', itemToDrop.getDescription())
      }

      player.useItem(item)
      console.log('Player picked up', item.getDescription())

      // Leave it in the list so the UI will get an update that it has been consumed later.
      // TODO: If/when should we remove it? Do they "respawn"
      // this.consumables.delete(key)
      return item
    } else {
      console.log('No item found at', player.x, player.y)
    }

    return undefined
  }

  isMobInRange(mob: MOB, x: number, y: number, range: number, minRange?: number, checkCanSee?: boolean): boolean {
    return (
      !mob.dead && // Not dead...duh
      !mob.invisible && // Not in range if you can't see it
      Math.abs(mob.x - x) <= range && // Check ranges
      Math.abs(mob.y - y) <= range &&
      // Min range use to limit how close (e.g. ranged attacks can't be used point blank)
      (!minRange || Math.abs(mob.x - x) >= minRange || Math.abs(mob.y - y) >= minRange) &&
      (!checkCanSee || range === 1 || !this.tileIsBlocked(x, y, mob.x, mob.y))
    )
  }

  findMobInRange<T extends MOB>(
    mobMap: Map<number, T>,
    x: number,
    y: number,
    range: number,
    minRange?: number,
    checkCanSee?: boolean
  ): T | undefined {
    const iterator = mobMap[Symbol.iterator]()

    for (const m of iterator) {
      const mob = m[1]
      if (this.isMobInRange(mob, x, y, range, minRange, checkCanSee)) {
        return mob
      }
    }

    return undefined
  }

  allMobsInRange<T extends MOB>(
    mobMap: Map<number, T>,
    x: number,
    y: number,
    range: number,
    minRange?: number,
    checkCanSee?: boolean
  ): T[] {
    const mobList: T[] = []
    const iterator = mobMap[Symbol.iterator]()

    for (const m of iterator) {
      const mob = m[1]
      if (this.isMobInRange(mob, x, y, range, minRange, checkCanSee)) {
        mobList.push(mob)
      }
    }

    return mobList
  }

  locationIsSpotted<T extends MOB>(mobMap: Map<number, T>, x: number, y: number): boolean {
    const iterator = mobMap[Symbol.iterator]()

    for (const m of iterator) {
      const mob = m[1]
      if (
        !mob.dead && // Not dead...duh
        Math.abs(mob.x - x) <= mob.visibleRange && // Check site range before trying more expensive "tileIsBlocked" calc
        Math.abs(mob.y - y) <= mob.visibleRange &&
        !this.tileIsBlocked(mob.x, mob.y, x, y) // Can the MOB actually "see" the spot
      ) {
        return true
      }
    }
    return false
  }

  playerIsSpotted(player: Player<unknown>): boolean {
    return this.locationIsSpotted(this.monsters, player.x, player.y)
  }

  locationInBounds(x: number, y: number): boolean {
    // Make sure the requested cell is in bounds
    return x < this.wallsAndMobs[0].length && x >= 0 && y < this.wallsAndMobs.length && y >= 0
  }

  monsterInRange(x: number, y: number, range: number, minRange?: number, checkCanSee?: boolean): Monster | undefined {
    return this.findMobInRange(this.monsters, x, y, range, minRange, checkCanSee)
  }

  surroundingWallsCount(centerX: number, centerY: number): number {
    let count = 0
    for (let y = -1; y <= 1; y++) {
      for (let x = -1; x <= 1; x++) {
        if (this.locationInBounds(centerX + x, centerY + y) && this.walls[centerY + y][centerX + x] > 0) {
          count++
        }
      }
    }
    return count
  }

  playerInRange(
    x: number,
    y: number,
    range: number,
    minRange?: number,
    checkCanSee?: boolean
  ): Player<unknown> | undefined {
    return this.findMobInRange(this.players, x, y, range, minRange, checkCanSee)
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

  stairsCheck(x: number, y: number): Stairs | undefined {
    const iterator = this.stairs[Symbol.iterator]()

    for (const s of iterator) {
      const stairs = s[1]
      if (stairs.x === x && stairs.y === y) {
        return stairs
      }
    }
  }
}
