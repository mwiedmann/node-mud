import { nextId } from './id'
import { MeleeWeapon } from './item'
import { MOBItems, Monster } from './mob'
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
  | 'manticore'
  | 'dragon'
  | 'lich'
  | 'beholder'
  | 'vampire'
  | 'mind-flayer'
  | 'devil'

export type MonsterType = Exclude<MOBType, 'player'>

const baseMonsterScores: MOBSkills = {
  level: 1,
  visibleRange: 5,
  maxHealth: 10,
  maxAtionPoints: 100,
  actionPointsGainedPerTick: 1,
  actionPointCostPerMove: 1,
  actionPointsCostPerMeleeAction: 20,
  actionPointsCostPerRangedAction: 30,
  actionPointsCostPerSpellAction: 20,

  ticksPerMove: 3,
  ticksPerAction: 5,

  meleeHitBonus: 0,
  meleeDamageBonus: 0,
  rangedHitBonus: 0,
  rangedDamageBonus: 0,

  physicalDefense: 10,
  magicDefense: 10
}

/*
HPs: 1-4, 5-8, 9-12, 13-16, 17-20
DEF: 4-6, 7-9, 10-12, 13-15, 16-18
ticks: 2=fast, 3=normal, 4=slow
*/

export const monsterSettings: {
  [K in MonsterType]: Partial<MOBSkills> & Pick<MOBSkills, 'level'> & Partial<MOBItems>
} = {
  // Level 1 - HP: 1-4, DEF: 4-6
  slime: {
    level: 1,
    maxHealth: 1,
    ticksPerMove: 8,
    physicalDefense: 4,
    meleeItem: new MeleeWeapon('natural', 'acid', {}, 'd4')
  },
  bat: {
    level: 1,
    maxHealth: 2,
    ticksPerMove: 2,
    physicalDefense: 5,
    meleeItem: new MeleeWeapon('natural', 'bite', {}, 'd4')
  },
  snake: {
    level: 1,
    maxHealth: 2,
    ticksPerMove: 4,
    physicalDefense: 4,
    meleeItem: new MeleeWeapon('natural', 'poisonous bite', {}, 'd4')
  },
  orc: {
    level: 1,
    maxHealth: 3,
    ticksPerMove: 6,
    physicalDefense: 5,
    meleeItem: new MeleeWeapon('natural', 'short sword', {}, 'd4')
  },
  skeleton: {
    level: 1,
    maxHealth: 3,
    ticksPerMove: 4,
    physicalDefense: 5,
    meleeItem: new MeleeWeapon('natural', 'scimitar', {}, 'd4')
  },
  goblin: {
    level: 1,
    maxHealth: 4,
    ticksPerMove: 3,
    physicalDefense: 6,
    meleeItem: new MeleeWeapon('natural', 'mace', {}, 'd4')
  },

  // Level 2 - HP: 5-8, DEF: 7-9
  zombie: {
    level: 2,
    maxHealth: 5,
    ticksPerMove: 5,
    physicalDefense: 7,
    meleeItem: new MeleeWeapon('natural', 'rotting claws', {}, 'd4')
  },
  kobold: {
    level: 2,
    maxHealth: 5,
    ticksPerMove: 3,
    physicalDefense: 7,
    meleeItem: new MeleeWeapon('natural', 'spear', {}, 'd4')
  },
  'giant-rat': {
    level: 2,
    maxHealth: 6,
    ticksPerMove: 2,
    physicalDefense: 8,
    meleeItem: new MeleeWeapon('natural', 'bite', {}, 'd4')
  },
  spider: {
    level: 2,
    maxHealth: 7,
    ticksPerMove: 4,
    physicalDefense: 8,
    meleeItem: new MeleeWeapon('natural', 'poisonous bite', {}, 'd4')
  },
  lizardman: {
    level: 2,
    maxHealth: 7,
    ticksPerMove: 3,
    physicalDefense: 9,
    meleeItem: new MeleeWeapon('natural', 'trident', {}, 'd4')
  },
  gnoll: {
    level: 2,
    maxHealth: 8,
    ticksPerMove: 3,
    physicalDefense: 9,
    meleeItem: new MeleeWeapon('natural', 'sword', {}, 'd4')
  },

  // Level 3 - HP: 9-12, DEF: 10-12
  ogre: {
    level: 3,
    maxHealth: 9,
    ticksPerMove: 3,
    physicalDefense: 10,
    meleeItem: new MeleeWeapon('natural', 'club', {}, 'd4')
  },
  ghoul: {
    level: 3,
    maxHealth: 9,
    ticksPerMove: 5,
    physicalDefense: 11,
    meleeItem: new MeleeWeapon('natural', 'diseased breath', {}, 'd4')
  },
  harpy: {
    level: 3,
    maxHealth: 10,
    ticksPerMove: 2,
    physicalDefense: 10,
    meleeItem: new MeleeWeapon('natural', 'claws', {}, 'd4')
  },
  'insect-swarm': {
    level: 3,
    maxHealth: 11,
    ticksPerMove: 3,
    physicalDefense: 12,
    meleeItem: new MeleeWeapon('natural', 'stingers', {}, 'd4')
  },
  'gelatinous-cube': {
    level: 3,
    maxHealth: 12,
    ticksPerMove: 6,
    physicalDefense: 12,
    meleeItem: new MeleeWeapon('natural', 'acidic splash', {}, 'd4')
  },
  troll: {
    level: 3,
    maxHealth: 12,
    ticksPerMove: 4,
    physicalDefense: 12,
    meleeItem: new MeleeWeapon('natural', 'giant club', {}, 'd4')
  },
  // Level 4 - HO: 13-16, DEF: 13-15
  wraith: {
    level: 4,
    maxHealth: 13,
    ticksPerMove: 4,
    physicalDefense: 13,
    meleeItem: new MeleeWeapon('natural', 'necrotic energy', {}, 'd4')
  },
  yeti: {
    level: 4,
    maxHealth: 13,
    ticksPerMove: 3,
    physicalDefense: 14,
    meleeItem: new MeleeWeapon('natural', 'claws', {}, 'd4')
  },
  centaur: {
    level: 4,
    maxHealth: 14,
    ticksPerMove: 2,
    physicalDefense: 13,
    meleeItem: new MeleeWeapon('natural', 'kick', {}, 'd4')
  },
  elemental: {
    level: 4,
    maxHealth: 14,
    ticksPerMove: 3,
    physicalDefense: 14,
    meleeItem: new MeleeWeapon('natural', 'fire', {}, 'd4')
  },
  imp: {
    level: 4,
    maxHealth: 15,
    ticksPerMove: 2,
    physicalDefense: 15,
    meleeItem: new MeleeWeapon('natural', 'stinging tail', {}, 'd4')
  },
  banshee: {
    level: 4,
    maxHealth: 16,
    ticksPerMove: 5,
    physicalDefense: 15,
    meleeItem: new MeleeWeapon('natural', 'necrotic energy', {}, 'd4')
  },
  // Level 5 HP: 17-20, DEF: 16-18
  demon: {
    level: 5,
    maxHealth: 17,
    ticksPerMove: 3,
    physicalDefense: 16,
    meleeItem: new MeleeWeapon('natural', 'flaming sword', {}, 'd4')
  },
  giant: {
    level: 5,
    maxHealth: 17,
    ticksPerMove: 5,
    physicalDefense: 18,
    meleeItem: new MeleeWeapon('natural', 'spiked club', {}, 'd4')
  },
  mummy: {
    level: 5,
    maxHealth: 18,
    ticksPerMove: 6,
    physicalDefense: 17,
    meleeItem: new MeleeWeapon('natural', 'rotting flesh', {}, 'd4')
  },
  griffon: {
    level: 5,
    maxHealth: 19,
    ticksPerMove: 2,
    physicalDefense: 16,
    meleeItem: new MeleeWeapon('natural', 'beak', {}, 'd4')
  },
  manticore: {
    level: 5,
    maxHealth: 20,
    ticksPerMove: 2,
    physicalDefense: 17,
    meleeItem: new MeleeWeapon('natural', 'spiked tail', {}, 'd4')
  },
  minotaur: {
    level: 5,
    maxHealth: 20,
    ticksPerMove: 3,
    physicalDefense: 18,
    meleeItem: new MeleeWeapon('natural', 'horns', {}, 'd4')
  },

  // Legendary Monsters 20+ 20+
  dragon: {
    level: 6,
    maxHealth: 25,
    ticksPerMove: 2,
    physicalDefense: 20,
    meleeItem: new MeleeWeapon('natural', 'fire breath', {}, 'd4')
  },
  lich: {
    level: 6,
    maxHealth: 21,
    ticksPerMove: 4,
    physicalDefense: 21,
    meleeItem: new MeleeWeapon('natural', 'death magic', {}, 'd4')
  },
  vampire: {
    level: 6,
    maxHealth: 22,
    ticksPerMove: 3,
    physicalDefense: 22,
    meleeItem: new MeleeWeapon('natural', 'corrupting bite', {}, 'd4')
  },
  beholder: {
    level: 6,
    maxHealth: 21,
    ticksPerMove: 5,
    physicalDefense: 22,
    meleeItem: new MeleeWeapon('natural', 'death rays', {}, 'd4')
  },
  'mind-flayer': {
    level: 6,
    maxHealth: 20,
    ticksPerMove: 4,
    physicalDefense: 21,
    meleeItem: new MeleeWeapon('natural', 'mind blast', {}, 'd4')
  },
  devil: {
    level: 6,
    maxHealth: 24,
    ticksPerMove: 3,
    physicalDefense: 23,
    meleeItem: new MeleeWeapon('natural', 'evil whip ', {}, 'd4')
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
