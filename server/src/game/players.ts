import { Dice } from './combat'
import { nextId } from './id'
import { Monster, Player } from './mob'

export type PlayerRace = 'elf' | 'dwarf' | 'human' | 'gnome' | 'giant'
export type PlayerProfession = 'warrior' | 'barbarian' | 'rogue' | 'wizard' | 'illusionist' | 'ranger' | 'cleric'

export type MOBSkills = {
  level: number
  visibleRange: number
  maxHealth: number
  maxAtionPoints: number
  actionPointsGainedPerTick: number
  actionPointCostPerMove: number
  actionPointsCostPerAction: number

  ticksPerMove: number
  ticksPerAction: number

  meleeHitBonus: number
  meleeDamageDie: Dice
  meleeDamageBonus: number
  rangedHitBonus: number
  rangedDamageDie: Dice
  rangedDamageBonus: number

  physicalDefense: number
  magicDefense: number

  tetherRange?: number
}

type MOBSKillsKeys = keyof MOBSkills

const basePlayerScores: MOBSkills = {
  level: 1,
  visibleRange: 5,
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
  magicDefense: 10
}

const raceSettings: { [K in PlayerRace]: Partial<MOBSkills> } = {
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
}

const professionSettings: { [K in PlayerProfession]: Partial<MOBSkills> } = {
  barbarian: {
    meleeDamageDie: 'd8'
  },
  warrior: {
    meleeDamageDie: 'd6'
  },
  ranger: {},
  rogue: {},
  wizard: {},
  illusionist: {},
  cleric: {}
}

export const playerFactory = <T>(
  race: PlayerRace,
  profession: PlayerProfession,
  name: string,
  team: number,
  connection: T
): Player<T> => {
  const raceStartingValues = raceSettings[race]
  const professionStartingValues = professionSettings[profession]

  const player = new Player<T>(name, race, profession, team, nextId(), connection)

  const startingSettings: MOBSkills = { ...basePlayerScores, ...raceStartingValues }

  Object.keys(startingSettings).forEach((k) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = player as any

    // Not sure why this doesn't work without the any
    // player implements MOBSkills
    p[k as MOBSKillsKeys] = startingSettings[k as MOBSKillsKeys]
  })

  Object.keys(professionStartingValues).forEach((k) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = player as any

    // Not sure why this doesn't work without the any
    // player implements MOBSkills
    p[k as MOBSKillsKeys] = professionStartingValues[k as MOBSKillsKeys]
  })

  // TODO: Remove. Just for testing
  player.maxHealth = 100

  player.init()

  return player
}
