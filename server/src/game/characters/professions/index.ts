import { LevelProgression } from '..'
import { MeleeSpell, MeleeWeaponFactory, RangedSpell, RangedWeaponFactory } from '../../item'
import { MOBItems, MOBSkills } from '../../mob'
import { barbarianProgression } from './barbarian'
import { clericProgression } from './cleric'
import { illusionistProgression } from './illusionist'
import { rangerProgression } from './ranger'
import { rogueProgression } from './rogue'
import { warriorProgression } from './warrior'
import { wizardProgression } from './wizard'
import { PlayerProfession } from 'dng-shared'

export const professionSettings: () => {
  [K in PlayerProfession]: Partial<MOBSkills> & Partial<MOBItems>
} = () => ({
  barbarian: {
    meleeItem: MeleeWeaponFactory('axe', 'Fury'),
    ticksPerMeleeAction: 5,
    ticksPerRangedAction: 25,
    ticksPerSpellAction: 30,
    ticksPerSpecialAbility: 100, // 10 seconds per charge
    ticksPausedAfterMelee: 4,
    ticksPausedAfterRanged: 20,
    ticksPausedAfterSpell: 20,
    meleeDamageBonus: 1,
    meleeDefense: 4,
    rangedDefense: 3,
    magicDefense: 3
  },
  cleric: {
    meleeItem: MeleeWeaponFactory('mace', 'Atonement'),
    meleeSpell: new MeleeSpell('divine smite', {}, 'd6'),
    ticksPerRangedAction: 25,
    ticksPerSpecialAbility: 100, // 10 seconds per Divine Smites
    ticksPausedAfterRanged: 15,
    spellHitBonus: 1,
    meleeDefense: 4,
    rangedDefense: 4,
    magicDefense: 4
  },
  illusionist: {
    meleeItem: MeleeWeaponFactory('staff', 'Willow'),
    rangedSpell: new RangedSpell('mind strike', {}, 6, 'd6'),
    ticksPerMeleeAction: 10,
    ticksPerRangedAction: 25,
    ticksPerSpellAction: 15,
    ticksPerSpecialAbility: 60, // 6 seconds per invisible
    ticksPausedAfterMelee: 12,
    ticksPausedAfterRanged: 15,
    hitBonusWhenInvisible: 5,
    damageBonusWhenInvisible: 1,
    spellHitBonus: 1,
    meleeDefense: 3,
    rangedDefense: 4,
    magicDefense: 5
  },
  ranger: {
    meleeItem: MeleeWeaponFactory('shortsword', 'Needle'),
    rangedItem: RangedWeaponFactory('shortbow', 'Snipe'),
    ticksPerRangedAction: 15,
    ticksPerSpecialAbility: 100, // 10 seconds per ranged flurry
    ticksPausedAfterMelee: 6,
    ticksPausedAfterRanged: 8,
    rangedHitBonus: 1,
    meleeDefense: 4,
    rangedDefense: 5,
    magicDefense: 3
  },
  rogue: {
    meleeItem: MeleeWeaponFactory('dagger', 'Stick'),
    rangedItem: RangedWeaponFactory('shortbow', 'Stinger'),
    ticksPerRangedAction: 17,
    // 2 seconds per camouflage
    // If not currently spotted, the rogue only needs a few seconds to hide
    ticksPerSpecialAbility: 20,
    ticksPausedAfterRanged: 10,
    hitBonusWhenInvisible: 4,
    damageBonusWhenInvisible: 1,
    meleeHitBonus: 1,
    meleeDefense: 4,
    rangedDefense: 5,
    magicDefense: 4
  },
  warrior: {
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
    meleeItem: MeleeWeaponFactory('staff', 'Darkwood'),
    rangedSpell: new RangedSpell('energy blast', {}, 6, 'd6'),
    ticksPerMeleeAction: 10,
    ticksPerRangedAction: 25,
    ticksPerSpellAction: 15,
    ticksPerSpecialAbility: 60, // 6 seconds per teleport
    ticksPausedAfterMelee: 12,
    ticksPausedAfterRanged: 15,
    spellDamageBonus: 1,
    meleeDefense: 3,
    rangedDefense: 3,
    magicDefense: 5
  }
})

export const professionProgression: {
  [K in PlayerProfession]: LevelProgression[]
} = {
  barbarian: barbarianProgression,
  warrior: warriorProgression,
  ranger: rangerProgression,
  rogue: rogueProgression,
  wizard: wizardProgression,
  illusionist: illusionistProgression,
  cleric: clericProgression
}
