import { nextId } from './id'
import { Monster } from './mob'
import { MOBSkills } from './players'

export type MOBType = 'player' | 'orc' | 'ogre' | 'dragon'
export type MonsterType = Exclude<MOBType, 'player'>

const baseMonsterScores: MOBSkills = {
  maxHealth: 10,
  maxAtionPoints: 100,
  actionPointsGainedPerTick: 1,
  actionPointCostPerMove: 1,
  actionPointsCostPerAction: 20,

  ticksPerMove: 3,
  ticksPerAction: 5,

  meleeHitBonus: 0,
  meleeDamageDie: 'd4',
  meleeDamageBonus: 0,
  rangedHitBonus: 0,
  rangedDamageDie: 'd4',
  rangedDamageBonus: 0,

  physicalDefense: 10,
  magicDefense: 10,

  tetherRange: undefined
}

const monsterSettings: { [K in MonsterType]: Partial<MOBSkills> } = {
  orc: {
    maxHealth: 3,
    ticksPerMove: 6,
    physicalDefense: 5
  },
  ogre: {
    maxHealth: 8,
    ticksPerMove: 7,
    physicalDefense: 10
  },
  dragon: {
    maxHealth: 25,
    ticksPerMove: 2,
    physicalDefense: 15
  }
}

export const monsterFactory = (type: MonsterType): Monster => {
  const monster = new Monster(type, 2, nextId(), type)
  const monsterStartingValues = monsterSettings[type]

  const startingSettings: MOBSkills = { ...baseMonsterScores, ...monsterStartingValues }

  Object.keys(startingSettings).forEach((k) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = monster as any

    // Not sure why this doesn't work without the any
    // monster implements MOBSkills
    m[k as keyof MOBSkills] = startingSettings[k as keyof MOBSkills]
  })

  monster.init()

  return monster
}
