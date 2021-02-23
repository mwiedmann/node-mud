import * as Phaser from 'phaser'
import { gameSettings } from '../settings'
import { controls, gameState } from '../init'

let titleScreen: Phaser.GameObjects.Image

const init = (scene: Phaser.Scene): void => {
  titleScreen = scene.add.image(gameSettings.fieldWidthMid, gameSettings.fieldHeightMid, 'title')
}

const update = (scene: Phaser.Scene, time: number, delta: number): void => {
  if (controls.next.isDown) {
    gameState.phase = 'gameStart'
  }
}

const cleanup = (): void => {
  titleScreen.destroy()
}

export const fns = {
  init,
  update,
  cleanup,
}
