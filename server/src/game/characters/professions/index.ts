import { LevelProgression, raceProgression } from '..'
import { Player } from '../../mob'
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
