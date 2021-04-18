import { PlayerRace } from 'dng-shared'
import { LevelProgression } from '..'
import { Player } from '../../mob'

export class Warrior<T> extends Player<T> {
  constructor(
    name: string,
    race: PlayerRace,
    raceProgression: LevelProgression[],
    team: number,
    id: number,
    connection: T
  ) {
    super(name, race, 'warrior', warriorProgression, raceProgression, team, id, connection)
  }
}

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
