import { MOBSkills } from './characters'
import { nextId } from './id'
import { MeleeWeapon, RangedWeapon, RangedWeaponFactory } from './item'
import { MOB, MOBItems, Monster } from './mob'

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
  actionPointsCostPerMeleeAction: 15,
  actionPointsCostPerRangedAction: 25,
  actionPointsCostPerSpellAction: 25,

  ticksPerMove: 3,
  ticksPerMeleeAction: 7,
  ticksPerRangedAction: 20,
  ticksPerSpellAction: 20,

  ticksPausedAfterMelee: 5,
  ticksPausedAfterRanged: 10,
  ticksPausedAfterSpell: 10,

  meleeHitBonus: 0,
  meleeDamageBonus: 0,
  rangedHitBonus: 0,
  rangedDamageBonus: 0,
  spellHitBonus: 0,
  spellDamageBonus: 0,

  physicalDefense: 10,
  magicDefense: 10,

  hitBonusWhenInvisible: 0,
  damageBonusWhenInvisible: 0
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
    maxHealth: 3,
    ticksPerMove: 8,
    physicalDefense: 6,
    meleeItem: new MeleeWeapon('natural', 'acid', {}, 'd2')
  },
  bat: {
    level: 1,
    maxHealth: 3,
    ticksPerMove: 2,
    physicalDefense: 7,
    meleeItem: new MeleeWeapon('natural', 'bite', {}, 'd2')
  },
  snake: {
    level: 1,
    maxHealth: 3,
    ticksPerMove: 4,
    physicalDefense: 6,
    meleeItem: new MeleeWeapon('natural', 'poisonous bite', {}, 'd2')
  },
  orc: {
    level: 1,
    maxHealth: 3,
    ticksPerMove: 6,
    physicalDefense: 7,
    meleeItem: new MeleeWeapon('natural', 'shortsword', {}, 'd2'),
    rangedItem: new RangedWeapon('natural', 'shortbow', {}, 4, 'd2')
  },
  skeleton: {
    level: 1,
    maxHealth: 3,
    ticksPerMove: 4,
    physicalDefense: 7,
    meleeItem: new MeleeWeapon('natural', 'scimitar', {}, 'd2')
  },
  goblin: {
    level: 1,
    maxHealth: 4,
    ticksPerMove: 3,
    physicalDefense: 8,
    meleeItem: new MeleeWeapon('natural', 'mace', {}, 'd2'),
    rangedItem: new RangedWeapon('natural', 'shortbow', {}, 4, 'd2')
  },

  // Level 2 - HP: 5-8, DEF: 7-9
  zombie: {
    level: 2,
    maxHealth: 5,
    ticksPerMove: 5,
    physicalDefense: 9,
    meleeItem: new MeleeWeapon('natural', 'rotting claws', {}, 'd4')
  },
  kobold: {
    level: 2,
    maxHealth: 5,
    ticksPerMove: 3,
    physicalDefense: 9,
    meleeItem: new MeleeWeapon('natural', 'spear', {}, 'd4')
  },
  'giant-rat': {
    level: 2,
    maxHealth: 6,
    ticksPerMove: 2,
    physicalDefense: 10,
    meleeItem: new MeleeWeapon('natural', 'bite', {}, 'd4')
  },
  spider: {
    level: 2,
    maxHealth: 7,
    ticksPerMove: 4,
    physicalDefense: 10,
    meleeItem: new MeleeWeapon('natural', 'poisonous bite', {}, 'd4'),
    rangedItem: new RangedWeapon('natural', 'web', {}, 5, 'd2')
  },
  lizardman: {
    level: 2,
    maxHealth: 7,
    ticksPerMove: 3,
    physicalDefense: 11,
    meleeItem: new MeleeWeapon('natural', 'trident', {}, 'd4'),
    rangedItem: new RangedWeapon('natural', 'darts', {}, 5, 'd2')
  },
  gnoll: {
    level: 2,
    maxHealth: 8,
    ticksPerMove: 3,
    physicalDefense: 11,
    meleeItem: new MeleeWeapon('natural', 'sword', {}, 'd4')
  },

  // Level 3 - HP: 9-12, DEF: 10-12
  ogre: {
    level: 3,
    maxHealth: 9,
    ticksPerMove: 3,
    physicalDefense: 12,
    meleeItem: new MeleeWeapon('natural', 'club', {}, 'd6')
  },
  ghoul: {
    level: 3,
    maxHealth: 9,
    ticksPerMove: 5,
    physicalDefense: 13,
    meleeItem: new MeleeWeapon('natural', 'diseased breath', {}, 'd6')
  },
  harpy: {
    level: 3,
    maxHealth: 10,
    ticksPerMove: 2,
    physicalDefense: 12,
    meleeItem: new MeleeWeapon('natural', 'claws', {}, 'd6')
  },
  'insect-swarm': {
    level: 3,
    maxHealth: 11,
    ticksPerMove: 3,
    physicalDefense: 14,
    meleeItem: new MeleeWeapon('natural', 'stingers', {}, 'd6'),
    rangedItem: new RangedWeapon('natural', 'stingers', {}, 6, 'd4')
  },
  'gelatinous-cube': {
    level: 3,
    maxHealth: 12,
    ticksPerMove: 6,
    physicalDefense: 14,
    meleeItem: new MeleeWeapon('natural', 'acidic splash', {}, 'd6'),
    rangedItem: new RangedWeapon('natural', 'acid blob', {}, 6, 'd4')
  },
  troll: {
    level: 3,
    maxHealth: 12,
    ticksPerMove: 4,
    physicalDefense: 14,
    meleeItem: new MeleeWeapon('natural', 'giant club', {}, 'd6')
  },
  // Level 4 - HO: 13-16, DEF: 13-15
  wraith: {
    level: 4,
    maxHealth: 13,
    ticksPerMove: 4,
    physicalDefense: 15,
    meleeItem: new MeleeWeapon('natural', 'necrotic energy', {}, 'd8')
  },
  yeti: {
    level: 4,
    maxHealth: 13,
    ticksPerMove: 3,
    physicalDefense: 16,
    meleeItem: new MeleeWeapon('natural', 'claws', {}, 'd8')
  },
  centaur: {
    level: 4,
    maxHealth: 14,
    ticksPerMove: 2,
    physicalDefense: 15,
    meleeItem: new MeleeWeapon('natural', 'kick', {}, 'd8'),
    rangedItem: new RangedWeapon('natural', 'longbow', {}, 7, 'd4')
  },
  elemental: {
    level: 4,
    maxHealth: 14,
    ticksPerMove: 3,
    physicalDefense: 16,
    meleeItem: new MeleeWeapon('natural', 'fire', {}, 'd8'),
    rangedItem: new RangedWeapon('natural', 'firebolt', {}, 7, 'd4')
  },
  imp: {
    level: 4,
    maxHealth: 15,
    ticksPerMove: 2,
    physicalDefense: 17,
    meleeItem: new MeleeWeapon('natural', 'stinging tail', {}, 'd8')
  },
  banshee: {
    level: 4,
    maxHealth: 16,
    ticksPerMove: 5,
    physicalDefense: 17,
    meleeItem: new MeleeWeapon('natural', 'necrotic energy', {}, 'd8')
  },
  // Level 5 HP: 17-20, DEF: 16-18
  demon: {
    level: 5,
    maxHealth: 17,
    ticksPerMove: 3,
    physicalDefense: 18,
    meleeItem: new MeleeWeapon('natural', 'flaming sword', {}, 'd10')
  },
  giant: {
    level: 5,
    maxHealth: 17,
    ticksPerMove: 5,
    physicalDefense: 20,
    meleeItem: new MeleeWeapon('natural', 'spiked club', {}, 'd10'),
    rangedItem: new RangedWeapon('natural', 'boulder', {}, 8, 'd6')
  },
  mummy: {
    level: 5,
    maxHealth: 18,
    ticksPerMove: 6,
    physicalDefense: 19,
    meleeItem: new MeleeWeapon('natural', 'rotting flesh', {}, 'd10')
  },
  griffon: {
    level: 5,
    maxHealth: 19,
    ticksPerMove: 2,
    physicalDefense: 18,
    meleeItem: new MeleeWeapon('natural', 'beak', {}, 'd10')
  },
  manticore: {
    level: 5,
    maxHealth: 20,
    ticksPerMove: 2,
    physicalDefense: 19,
    meleeItem: new MeleeWeapon('natural', 'spiked tail', {}, 'd10'),
    rangedItem: new RangedWeapon('natural', 'spikes', {}, 8, 'd6')
  },
  minotaur: {
    level: 5,
    maxHealth: 20,
    ticksPerMove: 3,
    physicalDefense: 20,
    meleeItem: new MeleeWeapon('natural', 'horns', {}, 'd10')
  },

  // Legendary Monsters 20+ 20+
  dragon: {
    level: 6,
    maxHealth: 25,
    ticksPerMove: 2,
    physicalDefense: 22,
    meleeItem: new MeleeWeapon('natural', 'bite and claws', {}, 'd12'),
    rangedItem: new RangedWeapon('natural', 'fire breath', {}, 10, 'd8')
  },
  lich: {
    level: 6,
    maxHealth: 21,
    ticksPerMove: 4,
    physicalDefense: 23,
    meleeItem: new MeleeWeapon('natural', 'death magic', {}, 'd12')
  },
  vampire: {
    level: 6,
    maxHealth: 22,
    ticksPerMove: 3,
    physicalDefense: 24,
    meleeItem: new MeleeWeapon('natural', 'corrupting bite', {}, 'd12')
  },
  beholder: {
    level: 6,
    maxHealth: 21,
    ticksPerMove: 5,
    physicalDefense: 24,
    meleeItem: new MeleeWeapon('natural', 'death rays', {}, 'd12')
  },
  'mind-flayer': {
    level: 6,
    maxHealth: 20,
    ticksPerMove: 4,
    physicalDefense: 23,
    meleeItem: new MeleeWeapon('natural', 'mind blast', {}, 'd12')
  },
  devil: {
    level: 6,
    maxHealth: 24,
    ticksPerMove: 3,
    physicalDefense: 25,
    meleeItem: new MeleeWeapon('natural', 'pitchfork', {}, 'd12'),
    rangedItem: new RangedWeapon('natural', 'demonic whip', {}, 10, 'd8')
  }
}

export const xpForKill = (monster: MOB): number => {
  const xpList: Record<number, number> = {
    1: 1,
    2: 2,
    3: 5,
    4: 10,
    5: 20,
    6: 100
  }

  return xpList[monster.level] || 1
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
