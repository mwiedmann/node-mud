import { PlayerRace } from 'dng-shared'
import { LevelProgression } from '..'
import { MeleeSpell, MeleeWeaponFactory } from '../../item'
import { Level } from '../../levels/level'
import { MOBItems, MOBSkills, MOBUpdateNotes, Player } from '../../mob'

export class Cleric<T> extends Player<T> {
  constructor(
    name: string,
    race: PlayerRace,
    raceProgression: LevelProgression[],
    team: number,
    id: number,
    connection: T
  ) {
    super(name, race, 'cleric', startingSettings(), clericProgression, raceProgression, team, id, connection)
  }

  specialAbilityAction(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void {
    if (tick - this.lastSpecialAbilityTick >= this.ticksPerSpecialAbility) {
      // A Cleric's Divine Aura smites all enemies he can see.
      // Unholy enemies are attacked twice at no cost to the Cleric.
      if (this.specialAbilityActivate) {
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
    }
  }
}

const startingSettings: () => Partial<MOBSkills> & Partial<MOBItems> = () => ({
  maxHealth: 10,
  meleeItem: MeleeWeaponFactory('mace', 'Atonement'),
  meleeSpell: new MeleeSpell('divine smite', {}, 'd6'),
  ticksPerRangedAction: 25,
  ticksPerSpecialAbility: 40, // 4 seconds per Divine Smite
  ticksPausedAfterRanged: 15,
  spellHitBonus: 1,
  meleeDefense: 4,
  rangedDefense: 4,
  magicDefense: 4
})

const clericProgression: LevelProgression[] = [
  {
    level: 2,
    upgrades: {
      spellHitBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 3
    }
  },
  {
    level: 3,
    upgrades: {
      meleeHitBonus: 1,
      meleeDamageBonus: 1,
      spellDamageBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 3,
      meleeDefense: 1,
      rangedDefense: 1,
      magicDefense: 1
    }
  },
  {
    level: 4,
    upgrades: {
      spellHitBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 3,
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
      spellDamageBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 3
    }
  },
  {
    level: 6,
    upgrades: {
      spellHitBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 3,
      meleeDefense: 1,
      rangedDefense: 1,
      magicDefense: 1
    }
  },
  {
    level: 7,
    upgrades: {
      meleeHitBonus: 1,
      meleeDamageBonus: 1,
      spellDamageBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 3,
      meleeDefense: 1,
      rangedDefense: 1,
      magicDefense: 1
    }
  },
  {
    level: 8,
    upgrades: {
      spellHitBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 3
    }
  },
  {
    level: 9,
    upgrades: {
      meleeHitBonus: 1,
      meleeDamageBonus: 1,
      spellDamageBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 3,
      meleeDefense: 1,
      rangedDefense: 1,
      magicDefense: 1
    }
  },
  {
    level: 10,
    upgrades: {
      meleeHitBonus: 2,
      meleeDamageBonus: 2,
      spellDamageBonus: 2,
      maxHealth: 2,
      maxAtionPoints: 6,
      meleeDefense: 1,
      rangedDefense: 1,
      magicDefense: 1
    }
  }
]
