import * as Phaser from 'phaser'
import { gameSettings } from '../settings'
import { controls, gameState } from '../init'

let screen: Phaser.GameObjects.Image

const init = (scene: Phaser.Scene): void => {
  screen = scene.add.image(gameSettings.screenWidthMid, gameSettings.screenHeightMid, 'profession')

  controls.next.on('up', () => {
    gameState.phase = 'gameStart'
  })
}

const update = (scene: Phaser.Scene, time: number, delta: number): void => {}

const cleanup = (): void => {
  screen.destroy()
  controls.next.removeAllListeners()
}

export const fns = {
  init,
  update,
  cleanup
}
