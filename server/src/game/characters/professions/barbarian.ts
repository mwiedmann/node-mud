import { PlayerRace } from 'dng-shared'
import { LevelProgression } from '..'
import { MeleeWeaponFactory } from '../../item'
import { MOBItems, MOBSkills, Player } from '../../mob'

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
