import { PlayerRace } from 'dng-shared'
import { LevelProgression } from '..'
import { MeleeWeaponFactory } from '../../item'
import { Level } from '../../levels/level'
import { MOBItems, MOBSkills, MOBUpdateNotes, Player } from '../../mob'

export class Barbarian<T> extends Player<T> {
  constructor(
    name: string,
    race: PlayerRace,
    raceProgression: LevelProgression[],
    team: number,
    id: number,
    connection: T
  ) {
    super(name, race, 'barbarian', startingSettings(), barbarianProgression, raceProgression, team, id, connection)
  }

  specialAbilityAction(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void {
    if (tick - this.lastSpecialAbilityTick >= this.ticksPerSpecialAbility) {
      if (this.specialAbilityActivate && this.specialAbilityX && this.specialAbilityY) {
        if (level.locationInBounds(this.specialAbilityX, this.specialAbilityY)) {
          // Calculate a path towards the spot
          this.moveGraph = level.findPath(
            { x: this.x, y: this.y },
            { x: this.specialAbilityX, y: this.specialAbilityY },
            this.moveSearchLimit
          )

          // Limit to a number of steps
          if (this.moveGraph.length > this.specialAbilityLength) {
            this.moveGraph = this.moveGraph.slice(0, this.specialAbilityLength)
          }
        }
        this.specialAbilityX = undefined
        this.specialAbilityY = undefined
        this.lastSpecialAbilityTick = tick
      }
    }

    // Barbarians charge and hit everything in their path
    if (this.specialAbilityActivate && !this.specialAbilityX && !this.specialAbilityY) {
      // Still spaces to move?
      if (this.moveGraph.length > 0) {
        const moveToX = this.moveGraph[0][0]
        const moveToY = this.moveGraph[0][1]
        // Remove the move just made
        this.moveGraph.shift()

        // Only move if the location is open
        if (!level.locationIsBlocked(moveToX, moveToY)) {
          // Set the next x/y from the path
          this.x = moveToX
          this.y = moveToY
          this.destinationX = moveToX
          this.destinationY = moveToY

          level.grabConsumable(this)

          // Find any monsters in melee range and attack for free
          const mobsInRange = level.allMobsInRange(level.monsters, this.x, this.y, 1)
          mobsInRange.forEach((m) => {
            this.makeMeleeAttack(m, tick, level, notes, false)
          })
        } else {
          // Blocked. Recalc a new path to the end
          // If the end spot is unreachable, the charge ends.
          if (this.moveGraph.length > 0) {
            // Calculate a path towards the spot
            const lastSpot = this.moveGraph.pop() as [number, number]
            this.moveGraph = level.findPath(
              { x: this.x, y: this.y },
              { x: lastSpot[0], y: lastSpot[1] },
              this.moveSearchLimit
            )
          } else {
            this.moveGraph = []
            this.specialAbilityActivate = false
          }
        }
      } else {
        this.specialAbilityActivate = false
      }
    }
  }
}

const startingSettings: () => Partial<MOBSkills> & Partial<MOBItems> = () => ({
  maxHealth: 12,
  meleeItem: MeleeWeaponFactory('axe', 'Fury'),
  ticksPerMeleeAction: 5,
  ticksPerRangedAction: 25,
  ticksPerSpellAction: 30,
  ticksPerSpecialAbility: 50, // 5 seconds per charge
  ticksPausedAfterMelee: 4,
  ticksPausedAfterRanged: 20,
  ticksPausedAfterSpell: 20,
  meleeDamageBonus: 1,
  meleeDefense: 4,
  rangedDefense: 3,
  magicDefense: 3
})

const barbarianProgression: LevelProgression[] = [
  {
    level: 2,
    upgrades: {
      meleeDamageBonus: 1,
      maxHealth: 2,
      maxAtionPoints: 5
    }
  },
  {
    level: 3,
    upgrades: {
      meleeHitBonus: 1,
      meleeDamageBonus: 1,
      maxHealth: 2,
      maxAtionPoints: 5,
      meleeDefense: 1
    }
  },
  {
    level: 4,
    upgrades: {
      meleeDamageBonus: 1,
      maxHealth: 2,
      maxAtionPoints: 5,
      meleeDefense: 1,
      rangedDefense: 1,
      magicDefense: 1
    }
  },
  {
    level: 5,
    upgrades: {
      meleeHitBonus: 1,
      meleeDamageBonus: 1,
      maxHealth: 2,
      maxAtionPoints: 5
    }
  },
  {
    level: 6,
    upgrades: {
      meleeDamageBonus: 1,
      maxHealth: 2,
      maxAtionPoints: 5,
      meleeDefense: 1
    }
  },
  {
    level: 7,
    upgrades: {
      meleeHitBonus: 1,
      meleeDamageBonus: 1,
      maxHealth: 2,
      maxAtionPoints: 5,
      meleeDefense: 1,
      rangedDefense: 1,
      magicDefense: 1
    }
  },
  {
    level: 8,
    upgrades: {
      meleeDamageBonus: 1,
      maxHealth: 2,
      maxAtionPoints: 5
    }
  },
  {
    level: 9,
    upgrades: {
      meleeHitBonus: 1,
      meleeDamageBonus: 1,
      maxHealth: 2,
      maxAtionPoints: 5,
      meleeDefense: 1
    }
  },
  {
    level: 10,
    upgrades: {
      meleeHitBonus: 2,
      meleeDamageBonus: 2,
      maxHealth: 4,
      maxAtionPoints: 10,
      meleeDefense: 1,
      rangedDefense: 1,
      magicDefense: 1
    }
  }
]
