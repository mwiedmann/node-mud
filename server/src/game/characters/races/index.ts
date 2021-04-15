import { LevelProgression } from '..'
import { dwarfProgression } from './dwarf'
import { elfProgression } from './elf'
import { giantProgression } from './giant'
import { gnomeProgression } from './gnome'
import { humanProgression } from './human'
import { halflingProgression } from './halfling'
import { PlayerRace } from 'dng-shared'
import { MOBSkills } from '../../mob'

export const raceSettings: () => { [K in PlayerRace]: Partial<MOBSkills> } = () => ({
  dwarf: {
    maxHealth: 24,
    ticksPerMove: 4,
    meleeHitBonus: 2,
    meleeDamageBonus: 2,
    rangedHitBonus: -1,
    spellHitBonus: -1,
    visibleRange: 10,
    meleeDefense: 4,
    rangedDefense: 4,
    magicDefense: 3
  },
  elf: {
    maxHealth: 16,
    ticksPerMove: 2,
    meleeHitBonus: -1,
    rangedHitBonus: 3,
    rangedDamageBonus: 1,
    spellHitBonus: 1,
    spellDamageBonus: 1,
    visibleRange: 9,
    meleeDefense: 3,
    rangedDefense: 5,
    magicDefense: 4
  },
  giant: {
    maxHealth: 28,
    ticksPerMove: 5,
    meleeHitBonus: 3,
    meleeDamageBonus: 2,
    rangedHitBonus: -2,
    spellHitBonus: -2,
    visibleRange: 7,
    meleeDefense: 2,
    rangedDefense: 2,
    magicDefense: 1
  },
  gnome: {
    maxHealth: 12,
    ticksPerMove: 3,
    meleeHitBonus: -2,
    rangedHitBonus: 1,
    spellHitBonus: 2,
    spellDamageBonus: 2,
    visibleRange: 9,
    meleeDefense: 3,
    rangedDefense: 4,
    magicDefense: 5
  },
  halfling: {
    maxHealth: 14,
    ticksPerMove: 3,
    meleeHitBonus: 1,
    meleeDamageBonus: 1,
    rangedHitBonus: 2,
    rangedDamageBonus: 1,
    visibleRange: 8,
    meleeDefense: 3,
    rangedDefense: 5,
    magicDefense: 4
  },
  human: {
    maxHealth: 20,
    ticksPerMove: 3,
    meleeHitBonus: 1,
    rangedHitBonus: 1,
    spellHitBonus: 1,
    visibleRange: 8,
    meleeDefense: 3,
    rangedDefense: 4,
    magicDefense: 4
  }
})

export const raceProgression: {
  [K in PlayerRace]: LevelProgression[]
} = {
  elf: elfProgression,
  dwarf: dwarfProgression,
  giant: giantProgression,
  gnome: gnomeProgression,
  halfling: halflingProgression,
  human: humanProgression
}
