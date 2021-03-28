import { LevelProgression, MOBSkills } from '..'
import { MeleeSpell, MeleeWeaponFactory, RangedSpell, RangedWeaponFactory } from '../../item'
import { MOBItems } from '../../mob'
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
    meleeItem: MeleeWeaponFactory('axe', 'Fury')
  },
  warrior: {
    meleeItem: MeleeWeaponFactory('broadsword', 'Vengence')
  },
  ranger: {
    meleeItem: MeleeWeaponFactory('shortsword', 'Needle'),
    rangedItem: RangedWeaponFactory('shortbow', 'Snipe')
  },
  rogue: {
    meleeItem: MeleeWeaponFactory('dagger', 'Stick'),
    rangedItem: RangedWeaponFactory('shortbow', 'Stinger'),
    hitBonusWhenInvisible: 4,
    damageBonusWhenInvisible: 1
  },
  wizard: {
    meleeItem: MeleeWeaponFactory('staff', 'Darkwood'),
    rangedSpell: new RangedSpell('energy blast', {}, 6, 'd10')
  },
  illusionist: {
    meleeItem: MeleeWeaponFactory('staff', 'Willow'),
    rangedSpell: new RangedSpell('energy blast', {}, 6, 'd10'),
    hitBonusWhenInvisible: 5,
    damageBonusWhenInvisible: 1
  },
  cleric: {
    meleeItem: MeleeWeaponFactory('mace', 'Atonement'),
    meleeSpell: new MeleeSpell('divine smite', {}, 'd10')
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
