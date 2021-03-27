import { MOBType } from '../monsters'
import { Level } from '../level'
import { MOB, MOBUpdateNotes } from './mob'

export class Monster extends MOB {
  constructor(type: MOBType, team: number, id: number, name?: string) {
    super(type, team, id, name)

    this.huntRange = 9
  }
  moveRange = 5
  moveSearchLimit = 12
  playerRangeToActivate = 30

  specialAbilityAction(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void {
    // No specials for Monsters yet
  }

  update(tick: number, level: Level<unknown>): MOBUpdateNotes {
    if (this.dead) {
      return { notes: ['dead'], moved: undefined }
    }

    if (!level.playerInRange(this.x, this.y, this.playerRangeToActivate)) {
      return { notes: ['skipped'], moved: undefined }
    }

    return super.update(tick, level)
  }

  moveTowardsDestination(tick: number, level: Level<unknown>): MOBUpdateNotes {
    const notes: MOBUpdateNotes = { notes: [], moved: undefined }

    // If it's time to move, see if there are any close players
    if (tick - this.lastMoveTick >= this.ticksPerMove && this.actionPoints >= this.actionPointCostPerMove) {
      notes.notes.push('Looking for player')
      // Look for a close player
      const player = level.playerInRange(this.x, this.y, this.huntRange, undefined, true)

      if (player) {
        notes.notes.push('Found close player')
        this.setDestination(player.x, player.y)
      }
    }

    // If already at the desired spot, pick a new spot
    if (this.destinationX === this.x && this.destinationY === this.y) {
      notes.notes.push('At destination')

      // Check if the monster is tethered to a spot
      // This will force them to return to this spot when it walks out of range
      const nextLocation = level.getRandomLocation({ range: this.moveRange, x: this.x, y: this.y })

      // Need to prevent unreachable locations here because findPath will scan a large portion of the dungeon to get there
      // TODO: Can A* abort after a certain number of squares?
      this.setDestination(nextLocation.x, nextLocation.y)
      this.moveGraph = level.findPath(
        { x: this.x, y: this.y },
        { x: this.destinationX, y: this.destinationY },
        this.moveSearchLimit
      )

      // Check if not reachable
      if (this.moveGraph.length === 0) {
        notes.notes.push('Not reachable')
        this.setDestination(this.x, this.y)
      }
    }

    return super.moveTowardsDestination(tick, level, notes)
  }
}
