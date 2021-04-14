import * as Phaser from 'phaser'
import { gameSettings } from '../gameManagement/settings'
import { controls, gameState } from '../gameManagement'

let screen: Phaser.GameObjects.Image | undefined

const init = (scene: Phaser.Scene): void => {
  screen = scene.add.image(gameSettings.screenWidthMid, gameSettings.screenHeightMid, 'title')

  scene.input.keyboard.on('keyup', () => {
    gameState.phase = 'race'
  })
}

const update = (scene: Phaser.Scene, time: number, delta: number): void => {}

const cleanup = (scene: Phaser.Scene): void => {
  screen?.destroy()
  screen = undefined
  scene.input.keyboard.removeAllListeners()
}

export const fns = {
  init,
  update,
  cleanup
}
