import { LevelProgression, MOBSkills } from '..'
import { dwarfProgression } from './dwarf'
import { elfProgression } from './elf'
import { giantProgression } from './giant'
import { gnomeProgression } from './gnome'
import { humanProgression } from './human'

export type PlayerRace = 'elf' | 'dwarf' | 'human' | 'gnome' | 'giant'

export const raceSettings: () => { [K in PlayerRace]: Partial<MOBSkills> } = () => ({
  elf: {
    maxHealth: 16,
    ticksPerMove: 2,
    rangedHitBonus: 2,
    rangedDamageBonus: 1,
    spellHitBonus: 1,
    visibleRange: 9
  },
  dwarf: {
    maxHealth: 24,
    ticksPerMove: 4,
    meleeHitBonus: 1,
    meleeDamageBonus: 2,
    rangedHitBonus: -1,
    spellHitBonus: -1,
    visibleRange: 10
  },
  giant: {
    maxHealth: 28,
    ticksPerMove: 5,
    meleeHitBonus: 2,
    meleeDamageBonus: 3,
    rangedHitBonus: -2,
    spellHitBonus: -2,
    visibleRange: 7
  },
  gnome: {
    maxHealth: 12,
    ticksPerMove: 3,
    meleeHitBonus: -1,
    rangedHitBonus: 1,
    spellHitBonus: 2,
    spellDamageBonus: 2,
    visibleRange: 9
  },
  human: {
    maxHealth: 20,
    ticksPerMove: 3,
    meleeHitBonus: 1,
    rangedHitBonus: 1,
    spellHitBonus: 1,
    visibleRange: 8
  }
})

export const raceProgression: {
  [K in PlayerRace]: LevelProgression[]
} = {
  elf: elfProgression,
  dwarf: dwarfProgression,
  giant: giantProgression,
  gnome: gnomeProgression,
  human: humanProgression
}
