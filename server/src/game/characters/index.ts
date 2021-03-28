import { PlayerProfession, PlayerRace } from 'dng-shared'
import { nextId } from '../id'
import { MOBItems, MOBSkills, Player } from '../mob'
import { professionProgression, professionSettings } from './professions'
import { raceProgression, raceSettings } from './races'
export * from './professions'
export * from './races'

export type LevelProgression = {
  level: number
  upgrades?: Partial<MOBSkills>
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

  physicalDefense: 10,
  magicDefense: 10,

  hitBonusWhenInvisible: 0,
  damageBonusWhenInvisible: 0,
  isUnholy: 0
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
  const progressionUpgrades = professionProgression[profession]
  const raceUpgrades = raceProgression[race]

  const player = new Player<T>(name, race, profession, progressionUpgrades, raceUpgrades, team, nextId(), connection)

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
