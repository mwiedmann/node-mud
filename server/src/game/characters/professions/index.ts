import { LevelProgression, raceProgression } from '..'
import { MeleeSpell, MeleeWeaponFactory, RangedSpell, RangedWeaponFactory } from '../../item'
import { MOBItems, MOBSkills, Player } from '../../mob'
import { Barbarian } from './barbarian'
import { Cleric } from './cleric'
import { Illusionist } from './illusionist'
import { Ranger } from './ranger'
import { Rogue } from './rogue'
import { Warrior } from './warrior'
import { Wizard } from './wizard'
import { PlayerProfession, PlayerRace } from 'dng-shared'
import { nextId } from '../../id'

export interface PlayerConstruction<T> {
  new (name: string, race: PlayerRace, raceProg: LevelProgression[], team: number, id: number, connection: T): Player<T>
}

export const professionSettings: () => {
  [K in PlayerProfession]: Partial<MOBSkills> & Partial<MOBItems>
} = () => ({
  barbarian: {
    maxHealth: 12,
    meleeItem: MeleeWeaponFactory('axe', 'Fury'),
    ticksPerMeleeAction: 5,
    ticksPerRangedAction: 25,
    ticksPerSpellAction: 30,
    ticksPerSpecialAbility: 50, // 5 seconds per charge
    ticksPausedAfterMelee: 4,
    ticksPausedAfterRanged: 20,
    ticksPausedAfterSpell: 20,
    meleeDamageBonus: 1,
    meleeDefense: 4,
    rangedDefense: 3,
    magicDefense: 3
  },
  cleric: {
    maxHealth: 10,
    meleeItem: MeleeWeaponFactory('mace', 'Atonement'),
    meleeSpell: new MeleeSpell('divine smite', {}, 'd6'),
    ticksPerRangedAction: 25,
    ticksPerSpecialAbility: 50, // 5 seconds per Divine Smites
    ticksPausedAfterRanged: 15,
    spellHitBonus: 1,
    meleeDefense: 4,
    rangedDefense: 4,
    magicDefense: 4
  },
  illusionist: {
    maxHealth: 7,
    meleeItem: MeleeWeaponFactory('staff', 'Willow'),
    rangedSpell: new RangedSpell('mind strike', {}, 6, 'd6'),
    ticksPerMeleeAction: 10,
    ticksPerRangedAction: 25,
    ticksPerSpellAction: 15,
    ticksPerSpecialAbility: 30, // 3 seconds per invisible
    ticksPausedAfterMelee: 12,
    ticksPausedAfterRanged: 15,
    hitBonusWhenInvisible: 5,
    damageBonusWhenInvisible: 2,
    spellHitBonus: 1,
    meleeDefense: 3,
    rangedDefense: 4,
    magicDefense: 5
  },
  ranger: {
    maxHealth: 9,
    meleeItem: MeleeWeaponFactory('shortsword', 'Needle'),
    rangedItem: RangedWeaponFactory('shortbow', 'Snipe'),
    ticksPerRangedAction: 15,
    ticksPerSpecialAbility: 50, // 5 seconds per ranged flurry
    ticksPausedAfterMelee: 6,
    ticksPausedAfterRanged: 8,
    rangedHitBonus: 1,
    meleeDefense: 4,
    rangedDefense: 5,
    magicDefense: 3
  },
  rogue: {
    maxHealth: 8,
    meleeItem: MeleeWeaponFactory('dagger', 'Stick'),
    rangedItem: RangedWeaponFactory('shortbow', 'Stinger'),
    ticksPerRangedAction: 17,
    // 1 seconds per camouflage
    // If not currently spotted, the rogue only needs a second to hide
    ticksPerSpecialAbility: 10,
    ticksPausedAfterRanged: 10,
    hitBonusWhenInvisible: 4,
    damageBonusWhenInvisible: 2,
    meleeHitBonus: 1,
    meleeDefense: 4,
    rangedDefense: 5,
    magicDefense: 4
  },
  warrior: {
    maxHealth: 11,
    meleeItem: MeleeWeaponFactory('broadsword', 'Vengence'),
    ticksPerMeleeAction: 5,
    ticksPerSpellAction: 30,
    ticksPerSpecialAbility: 100, // 10 seconds per ???
    ticksPausedAfterMelee: 5,
    meleeHitBonus: 1,
    meleeDefense: 5,
    rangedDefense: 5,
    magicDefense: 4
  },
  wizard: {
    maxHealth: 7,
    meleeItem: MeleeWeaponFactory('staff', 'Darkwood'),
    rangedSpell: new RangedSpell('energy blast', {}, 6, 'd6'),
    ticksPerMeleeAction: 10,
    ticksPerRangedAction: 25,
    ticksPerSpellAction: 15,
    ticksPerSpecialAbility: 30, // 3 seconds per teleport
    ticksPausedAfterMelee: 12,
    ticksPausedAfterRanged: 15,
    spellDamageBonus: 1,
    meleeDefense: 3,
    rangedDefense: 3,
    magicDefense: 5
  }
})

const professionMap = <T>(): Record<PlayerProfession, PlayerConstruction<T>> => ({
  barbarian: Barbarian,
  cleric: Cleric,
  illusionist: Illusionist,
  ranger: Ranger,
  rogue: Rogue,
  warrior: Warrior,
  wizard: Wizard
})

export const professionFactory = <T>(
  name: string,
  race: PlayerRace,
  profession: PlayerProfession,
  team: number,
  connection: T
): Player<T> => {
  const raceProg = raceProgression[race]
  const profType = professionMap<T>()[profession]
  return new profType(name, race, raceProg, team, nextId(), connection)
}
