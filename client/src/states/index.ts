import { fns as init } from './init'
import { fns as title } from './title'
import { fns as gameStart } from './gameStart'

export type States = 'init' | 'title' | 'gameStart'

export const stateFunctions = {
  init,
  title,
  gameStart
}
