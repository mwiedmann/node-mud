import { LevelProgression, raceProgression } from '..'
import { Player } from '../../mob'
import { createBarbarian } from './barbarian'
import { createCleric } from './cleric'
import { createIllusionist } from './illusionist'
import { createRanger } from './ranger'
import { createRogue } from './rogue'
import { createWarrior } from './warrior'
import { createWizard } from './wizard'
import { PlayerProfession, PlayerRace } from 'dng-shared'
import { nextId } from '../../id'

export interface PlayerConstruction<T> {
  (name: string, race: PlayerRace, raceProg: LevelProgression[], team: number, id: number, connection: T): Player<T>
}

const professionMap = <T>(): Record<PlayerProfession, PlayerConstruction<T>> => ({
  barbarian: createBarbarian,
  cleric: createCleric,
  illusionist: createIllusionist,
  ranger: createRanger,
  rogue: createRogue,
  warrior: createWarrior,
  wizard: createWizard
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
  return profType(name, race, raceProg, team, nextId(), connection)
}
