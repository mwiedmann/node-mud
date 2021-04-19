import { PlayerRace } from 'dng-shared'
import { LevelProgression } from '..'
import { MeleeWeaponFactory, RangedSpell } from '../../item'
import { MOBItems, MOBSkills, Player } from '../../mob'

export class Wizard<T> extends Player<T> {
  constructor(
    name: string,
    race: PlayerRace,
    raceProgression: LevelProgression[],
    team: number,
    id: number,
    connection: T
  ) {
    super(name, race, 'wizard', startingSettings(), wizardProgression, raceProgression, team, id, connection)
  }
}

const startingSettings: () => Partial<MOBSkills> & Partial<MOBItems> = () => ({
  maxHealth: 7,
  meleeItem: MeleeWeaponFactory('staff', 'Darkwood'),
  rangedSpell: new RangedSpell('energy blast', {}, 6, 'd6'),
  ticksPerMeleeAction: 10,
  ticksPerRangedAction: 25,
  ticksPerSpellAction: 15,
  ticksPerSpecialAbility: 30, // 3 seconds per teleport
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
