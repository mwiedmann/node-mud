import { MOB, MOBUpdateNotes } from '.'
import { Level } from '../../levels/level'

export function moveDestinationInBounds(this: MOB, level: Level<unknown>): void {
  // Make sure the requested cell is in bounds
  if (this.destinationX >= level.wallsAndMobs[0].length) {
    this.destinationX = level.wallsAndMobs[0].length - 1
  }
  if (this.destinationX < 0) {
    this.destinationX = 0
  }
  if (this.destinationY >= level.wallsAndMobs.length) {
    this.destinationY = level.wallsAndMobs.length - 1
  }
  if (this.destinationY < 0) {
    this.destinationY = 0
  }
}

export function moveTowardsDestination(this: MOB, tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void {
  const startX = this.x
  const startY = this.y

  this.moveDestinationInBounds(level)

  if (
    (this.destinationX !== this.x || this.destinationY !== this.y) &&
    tick - this.lastMoveTick >= this.ticksPerMove &&
    this.actionPoints >= this.actionPointCostPerMove
  ) {
    // See if we need to calculate the move graph
    if (this.moveGraph.length === 0) {
      notes.notes.push('Finding path')
      // Use the A* Algorithm to find a path
      this.moveGraph = level.findPath(
        { x: this.x, y: this.y },
        { x: this.destinationX, y: this.destinationY },
        this.moveSearchLimit
      )
    }

    const moveToX = this.moveGraph.length > 0 ? this.moveGraph[0][0] : this.x
    const moveToY = this.moveGraph.length > 0 ? this.moveGraph[0][1] : this.y

    // Only move if the location is open
    if (!level.locationIsBlocked(moveToX, moveToY)) {
      // Set the next x/y from the path
      this.x = moveToX
      this.y = moveToY

      if (this.type === 'player') {
        level.grabConsumable(this)
      }

      // Remove the move just made
      this.moveGraph.shift()

      this.actionPoints -= this.actionPointCostPerMove
      this.lastMoveTick = tick
    } else {
      // The next step in the path is blocked
      // Let's just clear it so it will be recalculated
      // Most likely another MOB moved in the way
      notes.notes.push(`location blocked ${moveToX} ${moveToY}`)
      this.moveGraph = []
      this.destinationX = this.x
      this.destinationY = this.y
    }
  }

  // Return if the MOB actually moved
  notes.moved =
    startX !== this.x || startY !== this.y ? { fromX: startX, fromY: startY, toX: this.x, toY: this.y } : undefined
}

export function setDestination(this: MOB, x: number, y: number): void {
  this.destinationX = x
  this.destinationY = y

  this.moveGraph = []
}

export function haltEverything(this: MOB): void {
  this.moveGraph = []
  this.destinationX = this.x
  this.destinationY = this.y
  this.specialAbilityX = undefined
  this.specialAbilityY = undefined
  this.specialAbilityActivate = false
}
