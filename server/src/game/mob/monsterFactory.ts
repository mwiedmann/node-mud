import { nextId } from '../id'
import { MeleeWeapon, RangedWeapon, RangedWeaponFactory } from '../item'
import { MOB, MOBItems, MOBSkills, Monster } from '.'

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
  ticksPerSpecialAbility: 30,

  ticksPausedAfterMelee: 7,
  ticksPausedAfterRanged: 12,
  ticksPausedAfterSpell: 15,

  meleeHitBonus: 0,
  meleeDamageBonus: 0,
  rangedHitBonus: 0,
  rangedDamageBonus: 0,
  spellHitBonus: 0,
  spellDamageBonus: 0,

  meleeDefense: 10,
  rangedDefense: 10,
  magicDefense: 10,

  hitBonusWhenInvisible: 0,
  damageBonusWhenInvisible: 0,
  isUnholy: 0
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
    meleeDefense: 6,
    rangedDefense: 5,
    magicDefense: 6,
    meleeItem: new MeleeWeapon('natural', 'acid', {}, 'd2')
  },
  bat: {
    level: 1,
    maxHealth: 3,
    ticksPerMove: 2,
    meleeDefense: 7,
    rangedDefense: 8,
    magicDefense: 7,
    meleeItem: new MeleeWeapon('natural', 'bite', {}, 'd2')
  },
  snake: {
    level: 1,
    maxHealth: 3,
    ticksPerMove: 4,
    meleeDefense: 6,
    rangedDefense: 7,
    magicDefense: 6,
    meleeItem: new MeleeWeapon('natural', 'poisonous bite', {}, 'd2')
  },
  orc: {
    level: 1,
    maxHealth: 3,
    ticksPerMove: 6,
    meleeDefense: 7,
    rangedDefense: 7,
    magicDefense: 7,
    meleeItem: new MeleeWeapon('natural', 'shortsword', {}, 'd2'),
    rangedItem: new RangedWeapon('natural', 'shortbow', {}, 4, 'd2')
  },
  skeleton: {
    level: 1,
    maxHealth: 3,
    ticksPerMove: 4,
    meleeDefense: 7,
    rangedDefense: 8,
    magicDefense: 7,
    meleeItem: new MeleeWeapon('natural', 'scimitar', {}, 'd2'),
    isUnholy: 1
  },
  goblin: {
    level: 1,
    maxHealth: 4,
    ticksPerMove: 3,
    meleeDefense: 8,
    rangedDefense: 7,
    magicDefense: 7,
    meleeItem: new MeleeWeapon('natural', 'mace', {}, 'd2'),
    rangedItem: new RangedWeapon('natural', 'shortbow', {}, 4, 'd2')
  },

  // Level 2 - HP: 5-8, DEF: 7-9
  zombie: {
    level: 2,
    maxHealth: 5,
    ticksPerMove: 5,
    meleeDefense: 9,
    rangedDefense: 8,
    magicDefense: 8,
    meleeItem: new MeleeWeapon('natural', 'rotting claws', {}, 'd4'),
    isUnholy: 1
  },
  kobold: {
    level: 2,
    maxHealth: 5,
    ticksPerMove: 3,
    meleeDefense: 9,
    rangedDefense: 9,
    magicDefense: 9,
    meleeItem: new MeleeWeapon('natural', 'spear', {}, 'd4')
  },
  'giant-rat': {
    level: 2,
    maxHealth: 6,
    ticksPerMove: 2,
    meleeDefense: 10,
    rangedDefense: 11,
    magicDefense: 10,
    meleeItem: new MeleeWeapon('natural', 'bite', {}, 'd4')
  },
  spider: {
    level: 2,
    maxHealth: 7,
    ticksPerMove: 4,
    meleeDefense: 10,
    rangedDefense: 11,
    magicDefense: 10,
    meleeItem: new MeleeWeapon('natural', 'poisonous bite', {}, 'd4'),
    rangedItem: new RangedWeapon('natural', 'web', {}, 5, 'd2')
  },
  lizardman: {
    level: 2,
    maxHealth: 7,
    ticksPerMove: 3,
    meleeDefense: 11,
    rangedDefense: 11,
    magicDefense: 11,
    meleeItem: new MeleeWeapon('natural', 'trident', {}, 'd4'),
    rangedItem: new RangedWeapon('natural', 'darts', {}, 5, 'd2')
  },
  gnoll: {
    level: 2,
    maxHealth: 8,
    ticksPerMove: 3,
    meleeDefense: 11,
    rangedDefense: 11,
    magicDefense: 11,
    meleeItem: new MeleeWeapon('natural', 'sword', {}, 'd4')
  },

  // Level 3 - HP: 9-12, DEF: 10-12
  ogre: {
    level: 3,
    maxHealth: 9,
    ticksPerMove: 3,
    meleeDefense: 12,
    rangedDefense: 11,
    magicDefense: 11,
    meleeItem: new MeleeWeapon('natural', 'club', {}, 'd6')
  },
  ghoul: {
    level: 3,
    maxHealth: 9,
    ticksPerMove: 5,
    meleeDefense: 13,
    rangedDefense: 12,
    magicDefense: 12,
    meleeItem: new MeleeWeapon('natural', 'diseased breath', {}, 'd6'),
    isUnholy: 1
  },
  harpy: {
    level: 3,
    maxHealth: 10,
    ticksPerMove: 2,
    meleeDefense: 12,
    rangedDefense: 13,
    magicDefense: 12,
    meleeItem: new MeleeWeapon('natural', 'claws', {}, 'd6')
  },
  'insect-swarm': {
    level: 3,
    maxHealth: 11,
    ticksPerMove: 3,
    meleeDefense: 14,
    rangedDefense: 15,
    magicDefense: 14,
    meleeItem: new MeleeWeapon('natural', 'stingers', {}, 'd6'),
    rangedItem: new RangedWeapon('natural', 'stingers', {}, 6, 'd4')
  },
  'gelatinous-cube': {
    level: 3,
    maxHealth: 12,
    ticksPerMove: 6,
    meleeDefense: 14,
    rangedDefense: 15,
    magicDefense: 14,
    meleeItem: new MeleeWeapon('natural', 'acidic splash', {}, 'd6'),
    rangedItem: new RangedWeapon('natural', 'acid blob', {}, 6, 'd4')
  },
  troll: {
    level: 3,
    maxHealth: 12,
    ticksPerMove: 4,
    meleeDefense: 14,
    rangedDefense: 13,
    magicDefense: 13,
    meleeItem: new MeleeWeapon('natural', 'giant club', {}, 'd6')
  },
  // Level 4 - HO: 13-16, DEF: 13-15
  wraith: {
    level: 4,
    maxHealth: 13,
    ticksPerMove: 4,
    meleeDefense: 15,
    rangedDefense: 14,
    magicDefense: 14,
    meleeItem: new MeleeWeapon('natural', 'necrotic energy', {}, 'd8'),
    isUnholy: 1
  },
  yeti: {
    level: 4,
    maxHealth: 13,
    ticksPerMove: 3,
    meleeDefense: 16,
    rangedDefense: 16,
    magicDefense: 16,
    meleeItem: new MeleeWeapon('natural', 'claws', {}, 'd8')
  },
  centaur: {
    level: 4,
    maxHealth: 14,
    ticksPerMove: 2,
    meleeDefense: 15,
    rangedDefense: 16,
    magicDefense: 15,
    meleeItem: new MeleeWeapon('natural', 'kick', {}, 'd8'),
    rangedItem: new RangedWeapon('natural', 'longbow', {}, 7, 'd4')
  },
  elemental: {
    level: 4,
    maxHealth: 14,
    ticksPerMove: 3,
    meleeDefense: 16,
    rangedDefense: 16,
    magicDefense: 16,
    meleeItem: new MeleeWeapon('natural', 'fire', {}, 'd8'),
    rangedItem: new RangedWeapon('natural', 'firebolt', {}, 7, 'd4')
  },
  imp: {
    level: 4,
    maxHealth: 15,
    ticksPerMove: 2,
    meleeDefense: 17,
    rangedDefense: 18,
    magicDefense: 17,
    meleeItem: new MeleeWeapon('natural', 'stinging tail', {}, 'd8'),
    isUnholy: 1
  },
  banshee: {
    level: 4,
    maxHealth: 16,
    ticksPerMove: 5,
    meleeDefense: 17,
    rangedDefense: 16,
    magicDefense: 16,
    meleeItem: new MeleeWeapon('natural', 'necrotic energy', {}, 'd8'),
    isUnholy: 1
  },
  // Level 5 HP: 17-20, DEF: 16-18
  demon: {
    level: 5,
    maxHealth: 17,
    ticksPerMove: 3,
    meleeDefense: 18,
    rangedDefense: 18,
    magicDefense: 18,
    meleeItem: new MeleeWeapon('natural', 'flaming sword', {}, 'd10'),
    isUnholy: 1
  },
  giant: {
    level: 5,
    maxHealth: 17,
    ticksPerMove: 5,
    meleeDefense: 20,
    rangedDefense: 19,
    magicDefense: 19,
    meleeItem: new MeleeWeapon('natural', 'spiked club', {}, 'd10'),
    rangedItem: new RangedWeapon('natural', 'boulder', {}, 8, 'd6')
  },
  mummy: {
    level: 5,
    maxHealth: 18,
    ticksPerMove: 6,
    meleeDefense: 19,
    rangedDefense: 18,
    magicDefense: 18,
    meleeItem: new MeleeWeapon('natural', 'rotting flesh', {}, 'd10'),
    isUnholy: 1
  },
  griffon: {
    level: 5,
    maxHealth: 19,
    ticksPerMove: 2,
    meleeDefense: 18,
    rangedDefense: 19,
    magicDefense: 18,
    meleeItem: new MeleeWeapon('natural', 'beak', {}, 'd10')
  },
  manticore: {
    level: 5,
    maxHealth: 20,
    ticksPerMove: 2,
    meleeDefense: 19,
    rangedDefense: 18,
    magicDefense: 18,
    meleeItem: new MeleeWeapon('natural', 'spiked tail', {}, 'd10'),
    rangedItem: new RangedWeapon('natural', 'spikes', {}, 8, 'd6')
  },
  minotaur: {
    level: 5,
    maxHealth: 20,
    ticksPerMove: 3,
    meleeDefense: 20,
    rangedDefense: 20,
    magicDefense: 20,
    meleeItem: new MeleeWeapon('natural', 'horns', {}, 'd10')
  },

  // Legendary Monsters 20+ 20+
  dragon: {
    level: 6,
    maxHealth: 25,
    ticksPerMove: 2,
    meleeDefense: 22,
    rangedDefense: 21,
    magicDefense: 21,
    meleeItem: new MeleeWeapon('natural', 'bite and claws', {}, 'd12'),
    rangedItem: new RangedWeapon('natural', 'fire breath', {}, 10, 'd8')
  },
  lich: {
    level: 6,
    maxHealth: 21,
    ticksPerMove: 4,
    meleeDefense: 23,
    rangedDefense: 23,
    magicDefense: 23,
    meleeItem: new MeleeWeapon('natural', 'death magic', {}, 'd12'),
    isUnholy: 1
  },
  vampire: {
    level: 6,
    maxHealth: 22,
    ticksPerMove: 3,
    meleeDefense: 24,
    rangedDefense: 25,
    magicDefense: 24,
    meleeItem: new MeleeWeapon('natural', 'corrupting bite', {}, 'd12'),
    isUnholy: 1
  },
  beholder: {
    level: 6,
    maxHealth: 21,
    ticksPerMove: 5,
    meleeDefense: 24,
    rangedDefense: 24,
    magicDefense: 24,
    meleeItem: new MeleeWeapon('natural', 'death rays', {}, 'd12')
  },
  'mind-flayer': {
    level: 6,
    maxHealth: 20,
    ticksPerMove: 4,
    meleeDefense: 23,
    rangedDefense: 22,
    magicDefense: 22,
    meleeItem: new MeleeWeapon('natural', 'mind blast', {}, 'd12')
  },
  devil: {
    level: 6,
    maxHealth: 24,
    ticksPerMove: 3,
    meleeDefense: 25,
    rangedDefense: 25,
    magicDefense: 25,
    meleeItem: new MeleeWeapon('natural', 'pitchfork', {}, 'd12'),
    rangedItem: new RangedWeapon('natural', 'demonic whip', {}, 10, 'd8'),
    isUnholy: 1
  }
}

export const xpForKill = (attackingMobLevel: number, monster: MOB): number => {
  const xpList: Record<number, number> = {
    1: 1,
    2: 2,
    3: 5,
    4: 10,
    5: 20,
    6: 100
  }

  let xp = xpList[monster.level] || 1
  const levelDifference = attackingMobLevel - monster.level

  // If the attacker is 2 levels higher than the target, no xp for you!
  if (levelDifference >= 2) {
    xp = 0
  }

  return xp
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
