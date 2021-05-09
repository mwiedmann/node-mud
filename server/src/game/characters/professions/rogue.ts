import { PlayerRace } from 'dng-shared'
import { LevelProgression } from '..'
import { MeleeWeaponFactory, RangedWeaponFactory } from '../../item'
import { Level } from '../../levels/level'
import { createPlayer, MOBItems, MOBSkills, MOBUpdateNotes, Player } from '../../mob'

export function createRogue<T>(
  name: string,
  race: PlayerRace,
  raceProgression: LevelProgression[],
  team: number,
  id: number,
  connection: T
): Player<T> {
  const player = createPlayer(
    name,
    race,
    'rogue',
    startingSettings(),
    rogueProgression,
    raceProgression,
    team,
    id,
    connection
  )

  return {
    ...player,
    specialAbilityAction(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void {
      // The rogue can camouflage into nearby walls.
      // The more walls, the better
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
  }
}

const startingSettings: () => Partial<MOBSkills> & Partial<MOBItems> = () => ({
  maxHealth: 8,
  meleeItem: MeleeWeaponFactory('dagger', 'Stick'),
  rangedItem: RangedWeaponFactory('shortbow', 'Stinger'),
  ticksPerRangedAction: 17,
  // 1 seconds per camouflage
  // If not currently spotted, the rogue only needs a second to hide
  ticksPerSpecialAbility: 10,
  ticksPausedAfterRanged: 10,
  ticksPausedAfterMelee: 8,
  hitBonusWhenInvisible: 4,
  damageBonusWhenInvisible: 2,
  meleeHitBonus: 1,
  meleeDefense: 4,
  rangedDefense: 5,
  magicDefense: 4
})

const rogueProgression: LevelProgression[] = [
  {
    level: 2,
    upgrades: {
      rangedHitBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 4,
      damageBonusWhenInvisible: 1,
      rangedDefense: 1
    }
  },
  {
    level: 3,
    upgrades: {
      rangedDamageBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 4,
      damageBonusWhenInvisible: 1,
      rangedDefense: 1,
      meleeDefense: 1,
      magicDefense: 1
    }
  },
  {
    level: 4,
    upgrades: {
      meleeHitBonus: 1,
      meleeDamageBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 4,
      damageBonusWhenInvisible: 1,
      rangedDefense: 1,
      meleeDefense: 1,
      magicDefense: 1
    }
  },
  {
    level: 5,
    upgrades: {
      rangedHitBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 4,
      damageBonusWhenInvisible: 1,
      rangedDefense: 1
    }
  },
  {
    level: 6,
    upgrades: {
      rangedDamageBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 4,
      damageBonusWhenInvisible: 1,
      rangedDefense: 1,
      meleeDefense: 1,
      magicDefense: 1
    }
  },
  {
    level: 7,
    upgrades: {
      meleeHitBonus: 1,
      meleeDamageBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 4,
      damageBonusWhenInvisible: 1,
      rangedDefense: 1,
      meleeDefense: 1,
      magicDefense: 1
    }
  },
  {
    level: 8,
    upgrades: {
      rangedHitBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 4,
      damageBonusWhenInvisible: 1,
      rangedDefense: 1
    }
  },
  {
    level: 9,
    upgrades: {
      rangedDamageBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 4,
      damageBonusWhenInvisible: 1,
      rangedDefense: 1,
      meleeDefense: 1,
      magicDefense: 1
    }
  },
  {
    level: 10,
    upgrades: {
      meleeHitBonus: 1,
      meleeDamageBonus: 1,
      rangedHitBonus: 1,
      rangedDamageBonus: 1,
      maxHealth: 2,
      maxAtionPoints: 8,
      damageBonusWhenInvisible: 1,
      meleeDefense: 1,
      rangedDefense: 1,
      magicDefense: 1
    }
  }
]
