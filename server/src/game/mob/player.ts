import { Level } from '../level'
import { LevelProgression, MOBSkills } from '../characters'
import { inRange } from '../util'
import { MOB, MOBUpdateNotes } from './mob'
import { PlayerProfession, PlayerRace } from 'dng-shared'

export class Player<T> extends MOB {
  constructor(
    name: string,
    public race: PlayerRace,
    public profession: PlayerProfession,
    public professionProgression: LevelProgression[],
    public raceProgression: LevelProgression[],
    team: number,
    id: number,
    public connection: T
  ) {
    super('player', team, id, name)
    this.huntRange = 1
  }

  moveSearchLimit = 20
  lastTickReceivedState = 0

  levelsGained: { level: number; xp: number; gained?: boolean }[] = [
    { level: 1, xp: 0, gained: true },
    { level: 2, xp: 20 }, // 20: 1
    { level: 3, xp: 60 }, // 25: 1,2
    { level: 4, xp: 120 }, // 30: 2
    { level: 5, xp: 250 }, // 35: 2,3
    { level: 6, xp: 450 }, // 40: 3
    { level: 7, xp: 800 }, // 45: 3,4
    { level: 8, xp: 1300 }, // 50: 4
    { level: 9, xp: 2200 }, // 55: 4,5
    { level: 10, xp: 4000 } // 75: 5
  ]

  gainXP(points: number): void {
    // Only players can gain XP (for now)
    this.xp += points

    this.levelsGained.forEach((l) => {
      if (!l.gained && this.xp >= l.xp) {
        l.gained = true
        this.addActivity({ level: 'great', message: `LEVEL UP!!!` })

        // Get and apply the upgrades for this level for the character's profession
        console.log('Profession Upgrades')
        const professionUpgrade = this.professionProgression.find((p) => p.level === l.level)
        this.applyLevelProgression(professionUpgrade?.upgrades)

        // Get and apply the upgrades for this level for the character's race
        console.log('Race Upgrades')
        const raceUpgrade = this.raceProgression.find((p) => p.level === l.level)
        this.applyLevelProgression(raceUpgrade?.upgrades)

        this.init()
      }
    })
  }

  applyLevelProgression(upgrades?: Partial<MOBSkills>): void {
    // If there are upgrades for the level, apply each one
    // Each upgrade is a number added to an existing MOBSkill
    if (upgrades) {
      Object.entries(upgrades).forEach(([key, value]) => {
        console.log('Upgrading', key, value)
        console.log('Before', this[key as keyof MOBSkills])
        this[key as keyof MOBSkills] += value as number
        console.log('After', this[key as keyof MOBSkills])
      })
    }
  }

  specialAbilityAction(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void {
    if (tick - this.lastSpecialAbilityTick >= this.ticksPerSpecialAbility) {
      // Check the wizard's teleport
      if (this.profession === 'wizard' && this.specialAbilityX && this.specialAbilityY) {
        if (
          !level.locationIsBlocked(this.specialAbilityX, this.specialAbilityY) &&
          inRange(this.visibleRange, this.x, this.y, this.specialAbilityX, this.specialAbilityY)
        ) {
          notes.notes.push('Teleporting')
          // Simply teleport the wizard there.
          this.x = this.specialAbilityX
          this.y = this.specialAbilityY
          this.setDestination(this.x, this.y)
          this.lastSpecialAbilityTick = tick
          this.specialAbilityX = undefined
          this.specialAbilityY = undefined
          this.specialAbilityActivate = false
          notes.notes.push('Wizard teleporting')
        } else {
          notes.notes.push('Teleporting was blocked or out of range')
          this.specialAbilityX = undefined
          this.specialAbilityY = undefined
        }
      }
      // The illusionist can turn invisible
      else if (this.profession === 'illusionist' && this.specialAbilityActivate) {
        this.invisible = true
        this.specialAbilityActivate = false
        this.lastSpecialAbilityTick = tick
      }
      // The barbarian charges towards a spot
      else if (
        this.profession === 'barbarian' &&
        this.specialAbilityActivate &&
        this.specialAbilityX &&
        this.specialAbilityY
      ) {
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
        this.specialAbilityX = undefined
        this.specialAbilityY = undefined
        this.lastSpecialAbilityTick = tick
      }
      // A Cleric's Divine Aura smites all enemies he can see.
      // Unholy enemies are attacked twice at no cost to the Cleric.
      else if (this.profession === 'cleric' && this.specialAbilityActivate) {
        const mobsInRange = level.allMobsInRange(level.monsters, this.x, this.y, this.visibleRange, undefined, true)
        mobsInRange.forEach((m) => {
          if (m.isUnholy) {
            this.makeMeleeSpellAttack(m, tick, level, notes, false)
            this.makeMeleeSpellAttack(m, tick, level, notes, false)
          } else {
            this.makeMeleeSpellAttack(m, tick, level, notes)
          }
        })
        this.lastSpecialAbilityTick = tick
        this.specialAbilityActivate = false
      }
      // The Ranger can shoot all enemies he can see.
      else if (this.profession === 'ranger' && this.specialAbilityActivate) {
        const range = this.bestRangedWeapon()?.range || 0
        const mobsInRange = level.allMobsInRange(level.monsters, this.x, this.y, range, undefined, true)
        mobsInRange.forEach((m) => {
          this.makeMeleeSpellAttack(m, tick, level, notes, false)
        })
        this.lastSpecialAbilityTick = tick
        this.specialAbilityActivate = false
      }
    }

    // The rogue can camouflage into nearby walls.
    // The more walls, the better
    if (this.profession === 'rogue') {
      // If the rogue is not currently camouflaged, see if he can hide.
      // Ability must be off coooldown, rogue must be near a wall, and not in sight of any monsters
      if (!this.invisible && tick - this.lastSpecialAbilityTick >= this.ticksPerSpecialAbility) {
        const wallCount = level.surroundingWallsCount(this.x, this.y)
        if (wallCount > 0 && !level.playerIsSpotted(this)) {
          this.invisible = true
          this.lastSpecialAbilityTick = tick
        }
      } // If currently camouflaged, check if still near a wall
      else if (this.invisible) {
        this.lastSpecialAbilityTick = tick
        const wallCount = level.surroundingWallsCount(this.x, this.y)
        if (wallCount === 0) {
          // Not near any walls, camouflage is removed
          this.invisible = false
        }
      }
    }

    // Barbarians charge and hit everything in their path
    if (
      this.profession === 'barbarian' &&
      this.specialAbilityActivate &&
      !this.specialAbilityX &&
      !this.specialAbilityY
    ) {
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

  moveTowardsDestination(tick: number, level: Level<unknown>): MOBUpdateNotes {
    const notes: MOBUpdateNotes = { notes: [], moved: undefined }

    // if (
    //   this.mode === 'hunt' &&
    //   tick - this.lastMoveTick >= this.ticksPerMove &&
    //   this.actionPoints >= this.actionPointCostPerMove
    // ) {
    //   // If the player is hunting, look for close monsters
    //   const monster = level.monsterInRange(this.x, this.y, this.huntRange)

    //   if (monster) {
    //     this.setDestination(monster.x, monster.y)
    //   }
    // }

    return super.moveTowardsDestination(tick, level, notes)
  }
}