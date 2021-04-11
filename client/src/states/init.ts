import * as Phaser from 'phaser'
import { gameState } from '../gameManagement'

const init = (scene: Phaser.Scene): void => {
  gameState.phase = 'title'
}

const update = (scene: Phaser.Scene, time: number, delta: number): void => {}

const cleanup = (): void => {}

export const fns = {
  init,
  update,
  cleanup
}
