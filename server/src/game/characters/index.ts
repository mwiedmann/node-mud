import { nextId } from '../id'
import { MOBItems, Player } from '../mob'
import { PlayerProfession, professionProgression, professionSettings } from './professions'
import { PlayerRace, raceSettings } from './races'
export * from './professions'
export * from './races'

export type LevelProgression = {
  level: number
  upgrades?: Partial<MOBSkills>
}

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
  ticksPerMeleeAction: number
  ticksPerRangedAction: number
  ticksPerSpellAction: number

  ticksPausedAfterMelee: number
  ticksPausedAfterRanged: number
  ticksPausedAfterSpell: number

  meleeHitBonus: number
  meleeDamageBonus: number
  rangedHitBonus: number
  rangedDamageBonus: number
  spellHitBonus: number
  spellDamageBonus: number

  physicalDefense: number
  magicDefense: number
}

const basePlayerScores: MOBSkills = {
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
  magicDefense: 10
}

type MOBSKillsAndItemsKeys = keyof MOBSkills & keyof MOBItems

export const playerFactory = <T>(
  race: PlayerRace,
  profession: PlayerProfession,
  name: string,
  team: number,
  connection: T
): Player<T> => {
  const raceStartingValues = raceSettings()[race]
  const professionStartingValues = professionSettings()[profession]
  const progression = professionProgression[profession]

  const player = new Player<T>(name, race, profession, progression, team, nextId(), connection)

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
  // player.maxHealth = 100

  player.init()

  return player
}
