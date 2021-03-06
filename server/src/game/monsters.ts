import { nextId } from './id'
import { Monster } from './mob'
import { MOBSkills } from './players'

export type MOBType =
  | 'player'
  | 'slime'
  | 'bat'
  | 'snake'
  | 'orc'
  | 'skeleton'
  | 'goblin'
  | 'zombie'
  | 'spider'
  | 'kobold'
  | 'giant-rat'
  | 'lizardman'
  | 'gnoll'
  | 'ogre'
  | 'ghoul'
  | 'harpy'
  | 'insect-swarm'
  | 'gelatinous-cube'
  | 'troll'
  | 'wraith'
  | 'yeti'
  | 'centaur'
  | 'elemental'
  | 'imp'
  | 'banshee'
  | 'demon'
  | 'mummy'
  | 'giant'
  | 'griffon'
  | 'minotaur'
  | 'manitcore'
  | 'dragon'
  | 'lich'
  | 'beholder'
  | 'vampire'
  | 'mind-flayer'
  | 'devil'

export type MonsterType = Exclude<MOBType, 'player'>

const baseMonsterScores: MOBSkills = {
  level: 1,
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

/*
HPs: 1-4, 5-8, 9-12, 13-16, 17-20
DEF: 4-6, 7-9, 10-12, 13-15, 16-18
ticks: 2=fast, 3=normal, 4=slow
*/

export const monsterSettings: { [K in MonsterType]: Partial<MOBSkills> & Pick<MOBSkills, 'level'> } = {
  // Level 1 - HP: 1-4, DEF: 4-6
  slime: {
    level: 1,
    maxHealth: 1,
    ticksPerMove: 8,
    physicalDefense: 4
  },
  bat: {
    level: 1,
    maxHealth: 2,
    ticksPerMove: 2,
    physicalDefense: 5
  },
  snake: {
    level: 1,
    maxHealth: 2,
    ticksPerMove: 4,
    physicalDefense: 4
  },
  orc: {
    level: 1,
    maxHealth: 3,
    ticksPerMove: 6,
    physicalDefense: 5
  },
  skeleton: {
    level: 1,
    maxHealth: 3,
    ticksPerMove: 4,
    physicalDefense: 5
  },
  goblin: {
    level: 1,
    maxHealth: 4,
    ticksPerMove: 3,
    physicalDefense: 6
  },

  // Level 2 - HP: 5-8, DEF: 7-9
  zombie: {
    level: 2,
    maxHealth: 5,
    ticksPerMove: 5,
    physicalDefense: 7
  },
  kobold: {
    level: 2,
    maxHealth: 5,
    ticksPerMove: 3,
    physicalDefense: 7
  },
  'giant-rat': {
    level: 2,
    maxHealth: 6,
    ticksPerMove: 2,
    physicalDefense: 8
  },
  spider: {
    level: 2,
    maxHealth: 7,
    ticksPerMove: 4,
    physicalDefense: 8
  },
  lizardman: {
    level: 2,
    maxHealth: 7,
    ticksPerMove: 3,
    physicalDefense: 9
  },
  gnoll: {
    level: 2,
    maxHealth: 8,
    ticksPerMove: 3,
    physicalDefense: 9
  },

  // Level 3 - HP: 9-12, DEF: 10-12
  ogre: {
    level: 3,
    maxHealth: 9,
    ticksPerMove: 3,
    physicalDefense: 10
  },
  ghoul: {
    level: 3,
    maxHealth: 9,
    ticksPerMove: 5,
    physicalDefense: 11
  },
  harpy: {
    level: 3,
    maxHealth: 10,
    ticksPerMove: 2,
    physicalDefense: 10
  },
  'insect-swarm': {
    level: 3,
    maxHealth: 11,
    ticksPerMove: 3,
    physicalDefense: 12
  },
  'gelatinous-cube': {
    level: 3,
    maxHealth: 12,
    ticksPerMove: 6,
    physicalDefense: 12
  },
  troll: {
    level: 3,
    maxHealth: 12,
    ticksPerMove: 4,
    physicalDefense: 12
  },
  // Level 4 - HO: 13-16, DEF: 13-15
  wraith: {
    level: 4,
    maxHealth: 13,
    ticksPerMove: 4,
    physicalDefense: 13
  },
  yeti: {
    level: 4,
    maxHealth: 13,
    ticksPerMove: 3,
    physicalDefense: 14
  },
  centaur: {
    level: 4,
    maxHealth: 14,
    ticksPerMove: 2,
    physicalDefense: 13
  },
  elemental: {
    level: 4,
    maxHealth: 14,
    ticksPerMove: 3,
    physicalDefense: 14
  },
  imp: {
    level: 4,
    maxHealth: 15,
    ticksPerMove: 2,
    physicalDefense: 15
  },
  banshee: {
    level: 4,
    maxHealth: 16,
    ticksPerMove: 5,
    physicalDefense: 15
  },
  // Level 5 HP: 17-20, DEF: 16-18
  demon: {
    level: 5,
    maxHealth: 17,
    ticksPerMove: 3,
    physicalDefense: 16
  },
  giant: {
    level: 5,
    maxHealth: 17,
    ticksPerMove: 5,
    physicalDefense: 18
  },
  mummy: {
    level: 5,
    maxHealth: 18,
    ticksPerMove: 6,
    physicalDefense: 17
  },
  griffon: {
    level: 5,
    maxHealth: 19,
    ticksPerMove: 2,
    physicalDefense: 16
  },
  manitcore: {
    level: 5,
    maxHealth: 20,
    ticksPerMove: 2,
    physicalDefense: 17
  },
  minotaur: {
    level: 5,
    maxHealth: 20,
    ticksPerMove: 3,
    physicalDefense: 18
  },

  // Legendary Monsters 20+ 20+
  dragon: {
    level: 6,
    maxHealth: 25,
    ticksPerMove: 2,
    physicalDefense: 20
  },
  lich: {
    level: 6,
    maxHealth: 21,
    ticksPerMove: 4,
    physicalDefense: 21
  },
  vampire: {
    level: 6,
    maxHealth: 22,
    ticksPerMove: 3,
    physicalDefense: 22
  },
  beholder: {
    level: 6,
    maxHealth: 21,
    ticksPerMove: 5,
    physicalDefense: 22
  },
  'mind-flayer': {
    level: 6,
    maxHealth: 20,
    ticksPerMove: 4,
    physicalDefense: 21
  },
  devil: {
    level: 6,
    maxHealth: 24,
    ticksPerMove: 3,
    physicalDefense: 23
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
