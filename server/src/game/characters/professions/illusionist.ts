import { PlayerRace } from 'dng-shared'
import { LevelProgression } from '..'
import { MeleeWeaponFactory, RangedSpell } from '../../item'
import { MOBItems, MOBSkills, Player } from '../../mob'

export class Illusionist<T> extends Player<T> {
  constructor(
    name: string,
    race: PlayerRace,
    raceProgression: LevelProgression[],
    team: number,
    id: number,
    connection: T
  ) {
    super(name, race, 'illusionist', startingSettings(), illusionistProgression, raceProgression, team, id, connection)
  }
}

const startingSettings: () => Partial<MOBSkills> & Partial<MOBItems> = () => ({
  maxHealth: 7,
  meleeItem: MeleeWeaponFactory('staff', 'Willow'),
  rangedSpell: new RangedSpell('mind strike', {}, 6, 'd6'),
  ticksPerMeleeAction: 10,
  ticksPerRangedAction: 25,
  ticksPerSpellAction: 15,
  ticksPerSpecialAbility: 30, // 3 seconds per invisible
  ticksPausedAfterMelee: 12,
  ticksPausedAfterRanged: 15,
  hitBonusWhenInvisible: 5,
  damageBonusWhenInvisible: 2,
  spellHitBonus: 1,
  meleeDefense: 3,
  rangedDefense: 4,
  magicDefense: 5
})

const illusionistProgression: LevelProgression[] = [
  {
    level: 2,
    upgrades: {
      maxHealth: 1,
      spellDamageBonus: 1,
      maxAtionPoints: 4,
      damageBonusWhenInvisible: 1,
      magicDefense: 1
    }
  },
  {
    level: 3,
    upgrades: {
      maxHealth: 1,
      spellHitBonus: 1,
      maxAtionPoints: 4,
      hitBonusWhenInvisible: 1,
      magicDefense: 1,
      rangedDefense: 1
    }
  },
  {
    level: 4,
    upgrades: {
      maxHealth: 1,
      spellDamageBonus: 1,
      maxAtionPoints: 2,
      damageBonusWhenInvisible: 1,
      magicDefense: 1,
      rangedDefense: 1,
      meleeDefense: 1
    }
  },
  {
    level: 5,
    upgrades: {
      maxHealth: 1,
      spellHitBonus: 1,
      maxAtionPoints: 4,
      hitBonusWhenInvisible: 1,
      magicDefense: 1
    }
  },
  {
    level: 6,
    upgrades: {
      maxHealth: 1,
      spellDamageBonus: 1,
      maxAtionPoints: 4,
      damageBonusWhenInvisible: 1,
      magicDefense: 1,
      rangedDefense: 1
    }
  },
  {
    level: 7,
    upgrades: {
      maxHealth: 1,
      spellHitBonus: 1,
      maxAtionPoints: 4,
      hitBonusWhenInvisible: 1,
      magicDefense: 1,
      rangedDefense: 1,
      meleeDefense: 1
    }
  },
  {
    level: 8,
    upgrades: {
      maxHealth: 1,
      spellDamageBonus: 1,
      maxAtionPoints: 4,
      damageBonusWhenInvisible: 1,
      magicDefense: 1
    }
  },
  {
    level: 9,
    upgrades: {
      maxHealth: 1,
      spellHitBonus: 1,
      maxAtionPoints: 4,
      hitBonusWhenInvisible: 1,
      magicDefense: 1,
      rangedDefense: 1
    }
  },
  {
    level: 10,
    upgrades: {
      maxHealth: 2,
      spellHitBonus: 1,
      spellDamageBonus: 1,
      maxAtionPoints: 8,
      hitBonusWhenInvisible: 1,
      damageBonusWhenInvisible: 1,
      meleeDefense: 1,
      rangedDefense: 1,
      magicDefense: 1
    }
  }
]
