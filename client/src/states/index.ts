import { fns as init } from './init'
import { fns as title } from './title'
import { fns as race } from './race'
import { fns as profession } from './profession'
import { fns as gameStart } from './gameStart'
import { fns as gameOver } from './gameOver'

export type States = 'init' | 'title' | 'race' | 'profession' | 'gameStart' | 'gameOver'

export const stateFunctions = {
  init,
  title,
  race,
  profession,
  gameStart,
  gameOver
}
