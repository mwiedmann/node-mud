import { MOBType } from './monsters'
import { Level } from './level'
import { Dice, rollDice } from './combat'
import { MOBSkills, PlayerProfession, PlayerRace } from './players'
import { Moved } from './map'

abstract class MOB implements MOBSkills {
  constructor(public type: MOBType, public team: number, public id: number, public name?: string) {}
  x = 0
  y = 0
  destinationX = 0
  destinationY = 0
  tetherX = 0
  tetherY = 0
  tetherRange?: number

  dead = false

  health = 10
  maxAtionPoints = 100
  actionPoints = 100
  actionPointsGainedPerTick = 1
  actionPointCostPerMove = 1
  actionPointsCostPerAction = 5

  mode: 'hunt' | 'move' = 'hunt'
  huntRange = 4

  ticksPerMove = 3
  ticksPerAction = 5

  lastMoveTick = 0
  lastActionTick = 0

  lastState = ''

  moveGraph: number[][] = []

  meleeHitBonus = 0
  meleeDamageDie: Dice = 'd4'
  meleeDamageBonus = 0
  rangedHitBonus = 0
  rangedDamageDie: Dice = 'd4'
  rangedDamageBonus = 0

  physicalDefense = 10
  magicDefense = 10

  activityLog: string[] = []

  addActivity(activity: string) {
    this.activityLog.push(activity)
  }

  meleeAttackRoll() {
    return rollDice('d20', 1, this.meleeHitBonus)
  }

  meleeDamageRoll() {
    return rollDice('d4', 1, this.meleeDamageBonus)
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

  update(tick: number, level: Level<unknown>): Moved | undefined {
    if (this.dead) {
      return undefined
    }

    this.actionPoints += this.actionPointsGainedPerTick

    if (this.actionPoints > this.maxAtionPoints) {
      this.actionPoints = this.maxAtionPoints
    }

    this.takeAction(tick, level)
    return this.moveTowardsDestination(tick, level)
  }

  checkDestinationBounds(level: Level<unknown>) {
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

  moveTowardsDestination(tick: number, level: Level<unknown>): Moved | undefined {
    const startX = this.x
    const startY = this.y

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
      if (!level.locationIsBlocked(moveToX, moveToY)) {
        // Set the next x/y from the path
        this.x = moveToX
        this.y = moveToY

        // Remove the move just made
        this.moveGraph.shift()

        this.actionPoints -= this.actionPointCostPerMove
        this.lastMoveTick = tick
      } else {
        // The next step in the path is blocked
        // Let's just clear it so it will be recalculated
        // Most likely another MOB moved in the way
        this.moveGraph = []
        this.destinationX = this.x
        this.destinationY = this.y
      }
    }

    // Return if the MOB actually moved
    return startX !== this.x || startY !== this.y
      ? { fromX: startX, fromY: startY, toX: this.x, toY: this.y }
      : undefined
  }

  takeAction(tick: number, level: Level<unknown>) {
    if (tick - this.lastActionTick >= this.ticksPerAction && this.actionPoints >= this.actionPointsCostPerAction) {
      const mobToAttack =
        this.type === 'player' ? level.monsterInRange(this.x, this.y, 1) : level.playerInRange(this.x, this.y, 1)

      if (mobToAttack) {
        const attackResult = this.meleeAttackRoll()

        if (attackResult.total >= mobToAttack.physicalDefense) {
          const dmgRoll = this.meleeDamageRoll()
          console.log(this.name, 'hit', mobToAttack.name, 'roll:', attackResult.total, 'dmg:', dmgRoll.total)

          mobToAttack.takeDamage(dmgRoll.total)

          if (mobToAttack.dead) {
            level.removeMonster(mobToAttack.x, mobToAttack.y)
          }
        } else {
          console.log(this.name, 'missed', mobToAttack.name, 'roll:', attackResult.total)
        }

        this.actionPoints -= this.actionPointsCostPerAction
        this.lastActionTick = tick
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
  constructor(type: MOBType, team: number, id: number, name?: string) {
    super(type, team, id, name)

    this.huntRange = 5
  }
  moveRange = 10

  moveTowardsDestination(tick: number, level: Level<unknown>): Moved | undefined {
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
      // Check if the monster is tethered to a spot
      // This will force them to return to this spot when it walks out of range
      const nextLocation =
        this.tetherRange !== undefined
          ? Math.abs(this.x - this.tetherX) > this.tetherRange || Math.abs(this.y - this.tetherY) > this.tetherRange
            ? { x: this.tetherX, y: this.tetherY }
            : level.getRandomLocation({ range: this.moveRange, x: this.x, y: this.y })
          : level.getRandomLocation({ range: this.moveRange, x: this.x, y: this.y })

      this.setDestination(nextLocation.x, nextLocation.y)

      this.moveGraph = level.findPath({ x: this.x, y: this.y }, { x: this.destinationX, y: this.destinationY })

      // Check if not reachable
      if (this.moveGraph.length === 0) {
        this.setDestination(this.x, this.y)
      }
    }

    return super.moveTowardsDestination(tick, level)
  }
}

export class Player<T> extends MOB {
  constructor(
    name: string,
    public race: PlayerRace,
    public profession: PlayerProfession,
    team: number,
    id: number,
    public connection: T
  ) {
    super('player', team, id, name)
    this.huntRange = 1
  }

  moveTowardsDestination(tick: number, level: Level<unknown>): Moved | undefined {
    if (
      this.mode === 'hunt' &&
      tick - this.lastMoveTick >= this.ticksPerMove &&
      this.actionPoints >= this.actionPointCostPerMove
    ) {
      // If the player is hunting, look for close monsters
      const monster = level.monsterInRange(this.x, this.y, this.huntRange)

      if (monster) {
        this.setDestination(monster.x, monster.y)
      }
    }

    return super.moveTowardsDestination(tick, level)
  }
}
