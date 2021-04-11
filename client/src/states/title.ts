import * as Phaser from 'phaser'
import { gameSettings } from '../gameManagement/settings'
import { controls, gameState } from '../gameManagement'

let screen: Phaser.GameObjects.Image | undefined

const init = (scene: Phaser.Scene): void => {
  screen = scene.add.image(gameSettings.screenWidthMid, gameSettings.screenHeightMid, 'title')

  controls.next.on('up', () => {
    gameState.phase = 'race'
  })
}

const update = (scene: Phaser.Scene, time: number, delta: number): void => {}

const cleanup = (): void => {
  screen?.destroy()
  screen = undefined
  controls.next.removeAllListeners()
}

export const fns = {
  init,
  update,
  cleanup
}
