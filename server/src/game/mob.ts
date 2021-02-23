import { throws } from "assert"
import { Level } from "./level"

abstract class MOB {
  constructor(public name: string, public team: number, public health: number, public id: number, public mobType: string) {}
  x = 0
  y = 0
  destinationX = 0
  destinationY = 0

  maxAtionPoints = 100
  actionPoints = 100
  actionPointsGainedPerTick = 1
  actionPointCostPerMove = 1

  ticksPerMove = 1

  lastMoveTick = 0

  lastState = ''

  moveGraph: number[][] = []

  update(tick: number, level: Level<unknown>) {
    this.actionPoints += this.actionPointsGainedPerTick

    if (this.actionPoints > this.maxAtionPoints) {
      this.actionPoints = this.maxAtionPoints
    }

    this.moveTowardsDestination(tick, level)
  }

  checkDestinationBounds(level: Level<unknown>) {
    // Make sure the requested cell is in bounds
    if (this.destinationX >= level.map[0].length) {
      this.destinationX = level.map[0].length - 1
    }
    if (this.destinationX < 0) {
      this.destinationX = 0
    }
    if (this.destinationY >= level.map.length) {
      this.destinationY = level.map.length - 1
    }
    if (this.destinationY < 0) {
      this.destinationY = 0
    }
  }

  moveTowardsDestination(tick: number, level: Level<unknown>) {
    this.checkDestinationBounds(level)

    if (
      (this.destinationX !== this.x || this.destinationY !== this.y) &&
      tick - this.lastMoveTick >= this.ticksPerMove &&
      this.actionPoints >= this.actionPointCostPerMove
    ) {
      // See if we need to calculate the move graph
      if (this.moveGraph.length === 0) {
        // Use the A* Algorithm to find a path
        this.moveGraph = level.graph.findPath({ x: this.x, y: this.y }, { x: this.destinationX, y: this.destinationY })
      }

      // Set the next x/y from the path
      this.x = this.moveGraph.length > 0
        ? this.moveGraph[0][0]
        : this.x

      this.y = this.moveGraph.length > 0
        ? this.moveGraph[0][1]
        : this.y

      // Remove the move just made
      this.moveGraph.shift()

      this.actionPoints-= this.actionPointCostPerMove
      this.lastMoveTick = tick
    }
  }

  setDestination(x: number, y: number) {
    this.destinationX = x
    this.destinationY = y

    this.moveGraph = []
  }

  getState() {
    const state = JSON.stringify({
      type: this.mobType,
      data: { id: this.id, x: this.x, y: this.y, ap: this.actionPoints }
    })
    
    if (this.lastState !== state) {
      this.lastState = state
      return state
    }

    return undefined
  }
}

export class Creature extends MOB {
  moveRange = 3

  moveTowardsDestination(tick: number, level: Level<unknown>) {
    if (this.destinationX === this.x || this.destinationY === this.y) {
      const nextLocation = level.getRandomLocation({ range: this.moveRange, x: this.x, y: this.y })
      this.setDestination(nextLocation.x, nextLocation.y)

      this.moveGraph = level.graph.findPath({ x: this.x, y: this.y }, { x: this.destinationX, y: this.destinationY })

      // Check if not reachable
      if (this.moveGraph.length === 0) {
        this.destinationX = this.x
        this.destinationY = this.y
        this.moveGraph = []
      }
    }

    super.moveTowardsDestination(tick, level)
  }
}

export class Player<T> extends MOB {
  constructor(name: string, team: number, health: number, id: number, public connection: T) {
    super(name, team, health, id, 'player')
  }
}
