import { PlayerRace } from 'dng-shared'
import { LevelProgression } from '..'
import { MeleeWeaponFactory, RangedWeaponFactory } from '../../item'
import { Level } from '../../levels/level'
import { MOBItems, MOBSkills, MOBUpdateNotes, Player } from '../../mob'

export class Ranger<T> extends Player<T> {
  constructor(
    name: string,
    race: PlayerRace,
    raceProgression: LevelProgression[],
    team: number,
    id: number,
    connection: T
  ) {
    super(name, race, 'ranger', startingSettings(), rangerProgression, raceProgression, team, id, connection)
  }

  specialAbilityAction(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void {
    if (tick - this.lastSpecialAbilityTick >= this.ticksPerSpecialAbility) {
      // The Ranger can shoot an exploding arrow that hits all in range
      if (this.specialAbilityActivate && this.specialAbilityX && this.specialAbilityY) {
        const range = this.bestRangedWeapon()?.range || 0
        const mobsInRange = level.allMobsInRange(
          level.monsters,
          this.specialAbilityX,
          this.specialAbilityY,
          range,
          2,
          true
        )

        // Only activate the ability if there are mobs in range
        if (mobsInRange.length > 0) {
          mobsInRange.forEach((m) => {
            this.makeRangedAttack(m, tick, level, notes, {
              hasCost: false,
              fromX: this.specialAbilityX,
              fromY: this.specialAbilityY
            })
          })
          this.lastSpecialAbilityTick = tick
          this.specialAbilityActivate = false
        }
      }
    }
  }
}

const startingSettings: () => Partial<MOBSkills> & Partial<MOBItems> = () => ({
  maxHealth: 9,
  meleeItem: MeleeWeaponFactory('shortsword', 'Needle'),
  rangedItem: RangedWeaponFactory('shortbow', 'Snipe'),
  ticksPerRangedAction: 15,
  ticksPerSpecialAbility: 50, // 5 seconds per ranged flurry
  ticksPausedAfterMelee: 6,
  ticksPausedAfterRanged: 8,
  rangedHitBonus: 1,
  meleeDefense: 4,
  rangedDefense: 5,
  magicDefense: 3
})

const rangerProgression: LevelProgression[] = [
  {
    level: 2,
    upgrades: {
      rangedHitBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 2,
      rangedDefense: 1
    }
  },
  {
    level: 3,
    upgrades: {
      rangedDamageBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 2,
      rangedDefense: 1,
      meleeDefense: 1
    }
  },
  {
    level: 4,
    upgrades: {
      meleeHitBonus: 1,
      meleeDamageBonus: 1,
      rangedHitBonus: 1,
      rangedDamageBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 2,
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
      maxAtionPoints: 2,
      rangedDefense: 1
    }
  },
  {
    level: 6,
    upgrades: {
      rangedDamageBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 2,
      rangedDefense: 1,
      meleeDefense: 1
    }
  },
  {
    level: 7,
    upgrades: {
      meleeHitBonus: 1,
      meleeDamageBonus: 1,
      rangedHitBonus: 1,
      rangedDamageBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 2,
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
      maxAtionPoints: 2,
      rangedDefense: 1
    }
  },
  {
    level: 9,
    upgrades: {
      rangedDamageBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 2,
      rangedDefense: 1,
      meleeDefense: 1
    }
  },
  {
    level: 10,
    upgrades: {
      meleeHitBonus: 1,
      meleeDamageBonus: 1,
      rangedHitBonus: 2,
      rangedDamageBonus: 2,
      maxHealth: 2,
      maxAtionPoints: 4,
      meleeDefense: 1,
      rangedDefense: 1,
      magicDefense: 1
    }
  }
]
