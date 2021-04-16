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

  meleeDefense: 10,
  rangedDefense: 10,
  magicDefense: 10,

  hitBonusWhenInvisible: 0,
  damageBonusWhenInvisible: 0,
  isUnholy: 0
}

type MOBSKillsAndItemsKeys = keyof MOBSkills | keyof MOBItems

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

  // Assign all the starting settings (player base and race)
  Object.keys(startingSettings).forEach((k) => {
    const skillKey = k as keyof MOBSkills
    player[skillKey] = startingSettings[skillKey]
  })

  // Assign (or boost) player settings from their profession
  Object.keys(professionStartingValues).forEach((k) => {
    const skillKey = k as MOBSKillsAndItemsKeys
    if (professionStartingValues[skillKey] !== undefined) {
      // For defense abilities (and potentially others in the future),
      // we add the race/profession values together
      if (skillKey.endsWith('Defense') || skillKey.endsWith('Bonus') || skillKey === 'maxHealth') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        player[skillKey] += professionStartingValues[skillKey] as any
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        player[skillKey] = professionStartingValues[skillKey] as any // TODO: Not sure why I need the any
      }
    }
  })

  player.init()

  return player
}
