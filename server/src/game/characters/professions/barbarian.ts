import { PlayerRace } from 'dng-shared'
import { LevelProgression } from '..'
import { Player } from '../../mob'

export class Barbarian<T> extends Player<T> {
  constructor(
    name: string,
    race: PlayerRace,
    raceProgression: LevelProgression[],
    team: number,
    id: number,
    connection: T
  ) {
    super(name, race, 'barbarian', barbarianProgression, raceProgression, team, id, connection)
  }
}

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
