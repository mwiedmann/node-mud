import { MOBType } from './monsters'
import { Level } from './level'
import { distance } from './util'
import { rollDice } from './combat'

abstract class MOB {
  constructor(
    public type: MOBType,
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

  mode: 'hunt' | 'move' = 'hunt'
  huntRange = 4

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

  activityLog: string[] = []

  addActivity(activity: string) {
    this.activityLog.push(activity)
  }

  meleeAttackRoll() {
    return rollDice('d20', 1, this.attacks.meleeHitBonus)
  }

  meleeDamageRoll() {
    return rollDice('d4', 1, this.attacks.meleeDamageBonus)
  }

  takeDamage(dmg: number) {
    this.health -= dmg

    this.addActivity(`${dmg} damage`)

    if (this.health <= 0) {
      this.addActivity('DEAD')
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
        this.moveGraph = level.findPath({ x: this.x, y: this.y }, { x: this.destinationX, y: this.destinationY })
      }

      const moveToX = this.moveGraph.length > 0 ? this.moveGraph[0][0] : this.x
      const moveToY = this.moveGraph.length > 0 ? this.moveGraph[0][1] : this.y

      // Only move if the location is open
      if (!level.locationContainsMob(moveToX, moveToY)) {
        // Set the next x/y from the path
        this.x = this.moveGraph.length > 0 ? this.moveGraph[0][0] : this.x

        this.y = this.moveGraph.length > 0 ? this.moveGraph[0][1] : this.y

        // Remove the move just made
        this.moveGraph.shift()

        this.actionPoints -= this.actionPointCostPerMove
        this.lastMoveTick = tick
      }
    }
  }

  takeAction(tick: number, level: Level<unknown>) {
    if (this.actionPoints >= this.actionPointsCostPerAction) {
      const mobToAttack =
        this.type === 'player' ? level.monsterInRange(this.x, this.y, 1) : level.playerInRange(this.x, this.y, 1)

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
      data: {
        subType: this.type,
        id: this.id,
        x: this.x,
        y: this.y,
        ap: this.actionPoints,
        dead: this.dead,
        activityLog: this.activityLog
      }
    })

    // Reset the log after the state is gathered
    this.activityLog = []

    if (this.lastState !== state) {
      this.lastState = state
      return state
    }

    return undefined
  }
}

export class Monster extends MOB {
  constructor(type: MOBType, team: number, health: number, id: number, name?: string) {
    super(type, team, health, id, name)

    this.huntRange = 5
  }
  moveRange = 10

  moveTowardsDestination(tick: number, level: Level<unknown>): void {
    // If it's time to move, see if there are any close players
    if (tick - this.lastMoveTick >= this.ticksPerMove && this.actionPoints >= this.actionPointCostPerMove) {
      // Look for a close player
      const player = level.playerInRange(this.x, this.y, this.huntRange)

      if (player) {
        this.setDestination(player.x, player.y)
      }
    }

    // If already at the desired spot, pick a new spot
    if (this.destinationX === this.x && this.destinationY === this.y) {
      const nextLocation = level.getRandomLocation({ range: this.moveRange, x: this.x, y: this.y })

      this.setDestination(nextLocation.x, nextLocation.y)

      this.moveGraph = level.findPath({ x: this.x, y: this.y }, { x: this.destinationX, y: this.destinationY })

      // Check if not reachable
      if (this.moveGraph.length === 0) {
        this.setDestination(this.x, this.y)
      }
    }

    super.moveTowardsDestination(tick, level)
  }
}

export class Player<T> extends MOB {
  constructor(name: string, team: number, health: number, id: number, public connection: T) {
    super('player', team, health, id, name)
    this.huntRange = 2
  }

  moveTowardsDestination(tick: number, level: Level<unknown>): void {
    if (
      this.mode === 'hunt' &&
      tick - this.lastMoveTick >= this.ticksPerMove &&
      this.actionPoints >= this.actionPointCostPerMove
    ) {
      // If the player is hunting, look for close monsters
      const monster = level.monsterInRange(this.x, this.y, this.huntRange)

      if (monster) {
        // console.log('Player has taret', monster.x, monster.y, 'Current spot', this.x, this.y)
        this.setDestination(monster.x, monster.y)
      }
    }

    super.moveTowardsDestination(tick, level)
  }
}
