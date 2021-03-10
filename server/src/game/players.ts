import { nextId } from './id'
import { MeleeSpell, MeleeWeapon, MeleeWeaponFactory, RangedSpell, RangedWeapon } from './item'
import { MOBItems, Monster, Player } from './mob'

export type PlayerRace = 'elf' | 'dwarf' | 'human' | 'gnome' | 'giant'
export type PlayerProfession = 'warrior' | 'barbarian' | 'rogue' | 'wizard' | 'illusionist' | 'ranger' | 'cleric'

export type MOBSkills = {
  level: number
  visibleRange: number
  maxHealth: number
  maxAtionPoints: number
  actionPointsGainedPerTick: number
  actionPointCostPerMove: number
  actionPointsCostPerMeleeAction: number
  actionPointsCostPerRangedAction: number
  actionPointsCostPerSpellAction: number

  ticksPerMove: number
  ticksPerAction: number

  meleeHitBonus: number
  meleeDamageBonus: number
  rangedHitBonus: number
  rangedDamageBonus: number

  physicalDefense: number
  magicDefense: number
}

type MOBSKillsAndItemsKeys = keyof MOBSkills & keyof MOBItems

const basePlayerScores: MOBSkills = {
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

const raceSettings: () => { [K in PlayerRace]: Partial<MOBSkills> } = () => ({
  elf: {
    maxHealth: 16,
    ticksPerMove: 2,
    meleeHitBonus: 1,
    rangedHitBonus: 2,
    visibleRange: 9
  },
  dwarf: {
    maxHealth: 24,
    meleeHitBonus: 1,
    meleeDamageBonus: 1,
    visibleRange: 10
  },
  giant: {
    maxHealth: 28,
    ticksPerMove: 4,
    meleeHitBonus: 2,
    meleeDamageBonus: 2,
    visibleRange: 7
  },
  gnome: {
    maxHealth: 12,
    meleeDamageBonus: -1,
    visibleRange: 9
  },
  human: {
    maxHealth: 20,
    visibleRange: 8
  }
})

const professionSettings: () => { [K in PlayerProfession]: Partial<MOBSkills> & Partial<MOBItems> } = () => ({
  barbarian: {
    meleeItem: MeleeWeaponFactory('axe', 'Fury')
  },
  warrior: {
    meleeItem: MeleeWeaponFactory('broadsword', 'Vengence')
  },
  ranger: {
    meleeItem: MeleeWeaponFactory('shortsword', 'Needle'),
    rangedItem: new RangedWeapon('shortbow', 'Snipe', {}, 6, 'd4')
  },
  rogue: {
    meleeItem: MeleeWeaponFactory('dagger', 'Stick'),
    rangedItem: new RangedWeapon('shortbow', 'Stinger', {}, 6, 'd4')
  },
  wizard: {
    meleeItem: MeleeWeaponFactory('staff', 'Darkwood'),
    rangedSpell: new RangedSpell('energy blast', {}, 'd10')
  },
  illusionist: {
    meleeItem: MeleeWeaponFactory('staff', 'Willow'),
    rangedSpell: new RangedSpell('energy blast', {}, 'd10')
  },
  cleric: {
    meleeItem: MeleeWeaponFactory('mace', 'Atonement'),
    meleeSpell: new MeleeSpell('divine smite', {}, 'd10')
  }
})

export const playerFactory = <T>(
  race: PlayerRace,
  profession: PlayerProfession,
  name: string,
  team: number,
  connection: T
): Player<T> => {
  const raceStartingValues = raceSettings()[race]
  const professionStartingValues = professionSettings()[profession]

  const player = new Player<T>(name, race, profession, team, nextId(), connection)

  const startingSettings: MOBSkills = { ...basePlayerScores, ...raceStartingValues }

  Object.keys(startingSettings).forEach((k) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = player as any

    // Not sure why this doesn't work without the any
    // player implements MOBSkills
    p[k as MOBSKillsAndItemsKeys] = startingSettings[k as MOBSKillsAndItemsKeys]
  })

  Object.keys(professionStartingValues).forEach((k) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = player as any

    // Not sure why this doesn't work without the any
    // player implements MOBSkills
    p[k as MOBSKillsAndItemsKeys] = professionStartingValues[k as MOBSKillsAndItemsKeys]
  })

  // TODO: Remove. Just for testing
  player.maxHealth = 100

  player.init()

  return player
}
