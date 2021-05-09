import { PlayerRace } from 'dng-shared'
import { LevelProgression } from '..'
import { MeleeWeaponFactory, RangedSpell } from '../../item'
import { Level } from '../../levels/level'
import { createPlayer, MOBItems, MOBSkills, MOBUpdateNotes, Player } from '../../mob'
import { inRange } from '../../util'

export function createWizard<T>(
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
    'wizard',
    startingSettings(),
    wizardProgression,
    raceProgression,
    team,
    id,
    connection
  )

  return {
    ...player,
    specialAbilityAction(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void {
      if (tick - this.lastSpecialAbilityTick >= this.ticksPerSpecialAbility) {
        // Check the wizard's teleport
        if (this.specialAbilityX && this.specialAbilityY) {
          if (
            level.locationInBounds(this.specialAbilityX, this.specialAbilityY) &&
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
            this.specialAbilityActivate = false
          }
        }
      }
    }
  }
}

const startingSettings: () => Partial<MOBSkills> & Partial<MOBItems> = () => ({
  maxHealth: 7,
  meleeItem: MeleeWeaponFactory('staff', 'Darkwood'),
  rangedSpell: new RangedSpell('energy blast', {}, 6, 'd6'),
  ticksPerMeleeAction: 10,
  ticksPerRangedAction: 25,
  ticksPerSpellAction: 15,
  ticksPerSpecialAbility: 25, // 2.5 seconds per teleport
  ticksPausedAfterMelee: 12,
  ticksPausedAfterRanged: 15,
  spellDamageBonus: 1,
  meleeDefense: 3,
  rangedDefense: 3,
  magicDefense: 5
})

const wizardProgression: LevelProgression[] = [
  {
    level: 2,
    upgrades: {
      maxHealth: 1,
      spellHitBonus: 1,
      spellDamageBonus: 1,
      maxAtionPoints: 2,
      magicDefense: 1
    }
  },
  {
    level: 3,
    upgrades: {
      maxHealth: 1,
      spellHitBonus: 1,
      maxAtionPoints: 2,
      magicDefense: 1
    }
  },
  {
    level: 4,
    upgrades: {
      maxHealth: 1,
      spellHitBonus: 1,
      spellDamageBonus: 1,
      maxAtionPoints: 2,
      magicDefense: 1,
      meleeDefense: 1,
      rangedDefense: 1
    }
  },
  {
    level: 5,
    upgrades: {
      maxHealth: 1,
      spellHitBonus: 1,
      maxAtionPoints: 2,
      magicDefense: 1
    }
  },
  {
    level: 6,
    upgrades: {
      maxHealth: 1,
      spellHitBonus: 1,
      spellDamageBonus: 1,
      maxAtionPoints: 2,
      magicDefense: 1
    }
  },
  {
    level: 7,
    upgrades: {
      maxHealth: 1,
      spellHitBonus: 1,
      maxAtionPoints: 2,
      magicDefense: 1,
      meleeDefense: 1,
      rangedDefense: 1
    }
  },
  {
    level: 8,
    upgrades: {
      maxHealth: 1,
      spellHitBonus: 1,
      spellDamageBonus: 1,
      maxAtionPoints: 2,
      magicDefense: 1
    }
  },
  {
    level: 9,
    upgrades: {
      maxHealth: 1,
      spellHitBonus: 1,
      maxAtionPoints: 2,
      magicDefense: 1
    }
  },
  {
    level: 10,
    upgrades: {
      maxHealth: 2,
      spellHitBonus: 2,
      spellDamageBonus: 2,
      maxAtionPoints: 4,
      magicDefense: 1,
      meleeDefense: 1,
      rangedDefense: 1
    }
  }
]
