import * as Phaser from 'phaser'
import { connectionManager } from '../connection'
import { gameState } from '../gameManagement'

const init = (scene: Phaser.Scene): void => {
  // For now we just log the player out and move back to the title screen
  // In the future we can have a stats summary/score screen maybe
  connectionManager.logout()
  gameState.phase = 'title'
}

const update = (scene: Phaser.Scene, time: number, delta: number): void => {}

const cleanup = (): void => {}

export const fns = {
  init,
  update,
  cleanup
}
