import { PlayerRace } from 'dng-shared'
import { LevelProgression } from '..'
import { Player } from '../../mob'

export class Rogue<T> extends Player<T> {
  constructor(
    name: string,
    race: PlayerRace,
    raceProgression: LevelProgression[],
    team: number,
    id: number,
    connection: T
  ) {
    super(name, race, 'rogue', rogueProgression, raceProgression, team, id, connection)
  }
}

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
