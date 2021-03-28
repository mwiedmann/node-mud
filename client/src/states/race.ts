import * as Phaser from 'phaser'
import { gameSettings } from '../settings'
import { controls, gameState } from '../init'
import { PlayerRace } from 'dng-shared'

let screen: Phaser.GameObjects.Image

const width = 600
const height = 400

type Coords = { x: number; y: number }
const raceCoordinates: Record<PlayerRace, Coords> = {
  dwarf: { x: 30, y: 180 },
  elf: { x: 650, y: 180 },
  giant: { x: 1280, y: 180 },
  gnome: { x: 30, y: 600 },
  halfling: { x: 650, y: 600 },
  human: { x: 1280, y: 600 }
}

let selectionRectangle: Phaser.GameObjects.Rectangle

const pointerCallback = (scene: Phaser.Scene) => (p: Phaser.Input.Pointer) => {
  const x = p.worldX
  const y = p.worldY

  Object.entries(raceCoordinates).forEach(([raceKey, coords]) => {
    if (x >= coords.x && y >= coords.y && x <= coords.x + width && y <= coords.y + height) {
      gameState.race = raceKey as PlayerRace
      showSelection(scene)
    }
  })
}

const showSelection = (scene: Phaser.Scene) => {
  if (!selectionRectangle) {
    selectionRectangle = scene.add.rectangle(0, 0, width, height).setOrigin(0, 0).setStrokeStyle(2, 0x00ff00)
  }

  const coords = raceCoordinates[gameState.race]
  selectionRectangle.setPosition(coords.x, coords.y)
}

const init = (scene: Phaser.Scene): void => {
  screen = scene.add.image(gameSettings.screenWidthMid, gameSettings.screenHeightMid, 'race')

  scene.input.on('pointerup', pointerCallback(scene))

  controls.next.on('up', () => {
    gameState.phase = 'profession'
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
