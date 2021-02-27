import { nextId } from './id'
import { Monster } from './mob'

export type MOBType = 'player' | 'orc' | 'ogre' | 'dragon'
export type MonsterType = Exclude<MOBType, 'player'>

const monster = (type: MonsterType, health: number, ticksPerMove: number) => {
  const monster = new Monster(type, 2, health, nextId(), type)
  monster.ticksPerMove = ticksPerMove
  return monster
}

export const monsterFactory = (type: MonsterType): Monster => {
  const monsters: { [K in MonsterType]: () => Monster } = {
    orc: () => monster('orc', 10, 10),
    ogre: () => monster('ogre', 25, 8),
    dragon: () => monster('dragon', 100, 2)
  }

  return monsters[type]()
}
