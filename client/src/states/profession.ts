import * as Phaser from 'phaser'
import { gameSettings } from '../settings'
import { controls, gameState } from '../init'
import { PlayerProfession, PlayerRace } from 'dng-shared'

let screen: Phaser.GameObjects.Image

const width = 500
const height = 400

type Coords = { x: number; y: number }
const professionCoordinates: Record<PlayerProfession, Coords> = {
  barbarian: { x: 70, y: 180 },
  cleric: { x: 705, y: 180 },
  illusionist: { x: 1330, y: 180 },
  ranger: { x: 15, y: 600 },
  rogue: { x: 500, y: 600 },
  warrior: { x: 967, y: 600 },
  wizard: { x: 1410, y: 600 }
}

let selectionRectangle: Phaser.GameObjects.Rectangle

const pointerCallback = (scene: Phaser.Scene) => (p: Phaser.Input.Pointer) => {
  const x = p.worldX
  const y = p.worldY

  Object.entries(professionCoordinates).forEach(([professionKey, coords]) => {
    if (x >= coords.x && y >= coords.y && x <= coords.x + width && y <= coords.y + height) {
      gameState.profession = professionKey as PlayerProfession
      showSelection(scene)
    }
  })
}

const showSelection = (scene: Phaser.Scene) => {
  if (!selectionRectangle) {
    selectionRectangle = scene.add.rectangle(0, 0, width, height).setOrigin(0, 0).setStrokeStyle(2, 0x00ff00)
  }

  const coords = professionCoordinates[gameState.profession]
  selectionRectangle.setPosition(coords.x, coords.y)
}

const init = (scene: Phaser.Scene): void => {
  screen = scene.add.image(gameSettings.screenWidthMid, gameSettings.screenHeightMid, 'profession')

  scene.input.on('pointerup', pointerCallback(scene))

  controls.next.on('up', () => {
    gameState.phase = 'gameStart'
  })

  showSelection(scene)
}

const update = (scene: Phaser.Scene, time: number, delta: number): void => {}

const cleanup = (scene: Phaser.Scene): void => {
  screen.destroy()
  selectionRectangle.destroy()
  controls.next.removeAllListeners()
  scene.input.removeAllListeners()
}

export const fns = {
  init,
  update,
  cleanup
}
