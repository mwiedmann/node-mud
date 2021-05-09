import { PlayerRace } from 'dng-shared'
import { LevelProgression } from '..'
import { MeleeWeaponFactory } from '../../item'
import { Level } from '../../levels/level'
import { createPlayer, MOBItems, MOBSkills, MOBUpdateNotes, Player } from '../../mob'

export function createWarrior<T>(
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
    'warrior',
    startingSettings(),
    warriorProgression,
    raceProgression,
    team,
    id,
    connection
  )

  return {
    ...player,
    specialAbilityAction(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void {
      // TODO: The Warrior still needs a special ability
    }
  }
}

const startingSettings: () => Partial<MOBSkills> & Partial<MOBItems> = () => ({
  maxHealth: 11,
  meleeItem: MeleeWeaponFactory('broadsword', 'Vengence'),
  ticksPerMeleeAction: 5,
  ticksPerSpellAction: 30,
  ticksPerSpecialAbility: 100, // 10 seconds per ???
  ticksPausedAfterMelee: 5,
  meleeHitBonus: 1,
  meleeDefense: 5,
  rangedDefense: 5,
  magicDefense: 4
})

const warriorProgression: LevelProgression[] = [
  {
    level: 2,
    upgrades: {
      meleeHitBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 3,
      meleeDefense: 1,
      rangedDefense: 1
    }
  },
  {
    level: 3,
    upgrades: {
      meleeHitBonus: 1,
      meleeDamageBonus: 1,
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
      meleeHitBonus: 1,
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
      maxHealth: 1,
      maxAtionPoints: 3,
      meleeDefense: 1,
      rangedDefense: 1
    }
  },
  {
    level: 6,
    upgrades: {
      meleeHitBonus: 1,
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
      meleeHitBonus: 1,
      maxHealth: 1,
      maxAtionPoints: 3,
      meleeDefense: 1,
      rangedDefense: 1
    }
  },
  {
    level: 9,
    upgrades: {
      meleeHitBonus: 1,
      meleeDamageBonus: 1,
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
      maxHealth: 2,
      maxAtionPoints: 6,
      meleeDefense: 1,
      rangedDefense: 1,
      magicDefense: 1
    }
  }
]
