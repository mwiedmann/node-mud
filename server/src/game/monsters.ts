import { nextId } from './id'
import { Monster } from './mob'

export type MonsterType = 'player' | 'orc' | 'ogre' | 'dragon'
type NoPlayer = Exclude<MonsterType, 'player'>

const monster = (type: NoPlayer, health: number, ticksPerMove: number) => {
  const monster = new Monster(type, 2, health, nextId(), type)
  monster.ticksPerMove = ticksPerMove
  return monster
}

export const monsterFactory = (type: NoPlayer): Monster => {
  const monsters: { [K in NoPlayer]: () => Monster } = {
    orc: () => monster('orc', 10, 10),
    ogre: () => monster('ogre', 25, 8),
    dragon: () => monster('dragon', 100, 2)
  }

  return monsters[type]()
}
