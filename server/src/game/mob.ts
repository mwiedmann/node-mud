import { MonsterType } from './monsters'
import { Level } from './level'
import { distance } from './util'
import { rollDice } from './combat'

abstract class MOB {
  constructor(
    public type: MonsterType,
    public team: number,
    public health: number,
    public id: number,
    public name?: string
  ) {}
  x = 0
  y = 0
  destinationX = 0
  destinationY = 0
  dead = false

  maxAtionPoints = 100
  actionPoints = 100
  actionPointsGainedPerTick = 1
  actionPointCostPerMove = 1
  actionPointsCostPerAction = 5

  ticksPerMove = 1
  ticksPerAction = 5

  lastMoveTick = 0

  lastState = ''

  moveGraph: number[][] = []

  attacks = {
    meleeHitBonus: 2,
    meleeDamageDie: 'd4',
    meleeDamageBonus: 1,
    rangedHitBonus: 1,
    rangedDamageDie: undefined,
    rangedDamageBoonus: undefined
  }

  defence = {
    melee: 10,
    ranaged: 10,
    magic: 10
  }

  meleeAttackRoll() {
    return rollDice('d20', 1, this.attacks.meleeHitBonus)
  }

  meleeDamageRoll() {
    return rollDice('d4', 1, this.attacks.meleeDamageBonus)
  }

  takeDamage(dmg: number) {
    this.health -= dmg

    if (this.health <= 0) {
      this.dead = true
      console.log(this.name, 'is dead!!!')
    }
  }

  update(tick: number, level: Level<unknown>) {
    if (this.dead) {
      return
    }

    this.actionPoints += this.actionPointsGainedPerTick

    if (this.actionPoints > this.maxAtionPoints) {
      this.actionPoints = this.maxAtionPoints
    }

    this.takeAction(tick, level)
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
      this.x = this.moveGraph.length > 0 ? this.moveGraph[0][0] : this.x

      this.y = this.moveGraph.length > 0 ? this.moveGraph[0][1] : this.y

      // Remove the move just made
      this.moveGraph.shift()

      this.actionPoints -= this.actionPointCostPerMove
      this.lastMoveTick = tick
    }
  }

  takeAction(tick: number, level: Level<unknown>) {
    if (this.actionPoints >= this.actionPointsCostPerAction) {
      const mobToAttack =
        this.type === 'player' ? level.adjecentMonster(this.x, this.y) : level.adjecentPlayer(this.x, this.y)

      if (mobToAttack) {
        const attackResult = this.meleeAttackRoll()

        if (attackResult.total >= mobToAttack.defence.melee) {
          const dmgRoll = this.meleeDamageRoll()
          console.log(this.name, 'hit', mobToAttack.name, 'roll:', attackResult.total, 'dmg:', dmgRoll.total)

          mobToAttack.takeDamage(dmgRoll.total)
        } else {
          console.log(this.name, 'missed', mobToAttack.name, 'roll:', attackResult.total)
        }

        this.actionPoints -= this.actionPointsCostPerAction
      }
    }
  }

  setDestination(x: number, y: number) {
    this.destinationX = x
    this.destinationY = y

    this.moveGraph = []
  }

  getState() {
    const state = JSON.stringify({
      type: this.type === 'player' ? 'player' : 'monster',
      data: { subType: this.type, id: this.id, x: this.x, y: this.y, ap: this.actionPoints, dead: this.dead }
    })

    if (this.lastState !== state) {
      this.lastState = state
      return state
    }

    return undefined
  }
}

export class Monster extends MOB {
  moveRange = 10

  moveTowardsDestination(tick: number, level: Level<unknown>): void {
    if (this.destinationX === this.x || this.destinationY === this.y) {
      const player = level.players.values().next().value

      // If the player is in range, move towards them
      const nextLocation =
        player && distance(this.x, this.y, player.x, player.y) <= this.moveRange
          ? { x: player.x, y: player.y }
          : level.getRandomLocation({ range: this.moveRange, x: this.x, y: this.y })

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
    super('player', team, health, id, name)
  }
}
