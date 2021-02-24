import * as Phaser from 'phaser'
import { connectionManager } from '../connection'
import { gameSettings } from '../settings'
import { controls, gameState, sceneUpdate, SquareType } from '../init'

let mapTiles: Phaser.GameObjects.Image[] = []
let guy: Phaser.GameObjects.Image
let pointerCallback: (p: Phaser.Input.Pointer) => void

const init = (scene: Phaser.Scene): void => {
  connectionManager.openConnection()
  scene.cameras.main.setZoom(gameSettings.gameCameraZoom)

  guy = scene.add.image(gameState.player.x * gameSettings.cellSize, gameState.player.y * gameSettings.cellSize, 'guy')

  // Set the camera to follow the guy (with some lerping, a deadzone, and bounds)
  scene.cameras.main.startFollow(guy, true, 0.1, 0.1)
  scene.cameras.main.setDeadzone(gameSettings.cellSize * 10, gameSettings.cellSize * 10)
  scene.cameras.main.setBounds(0, 0, gameSettings.fieldWidth, gameSettings.fieldHeight)

  const pointerCallback = (p: Phaser.Input.Pointer) => {
    console.log(p)
    connectionManager.setDestination(gameSettings.cellFromScreenPos(p.worldX), gameSettings.cellFromScreenPos(p.worldY))
  }

  switch (scene.scale.displayScale.x) {
    case 1:
      console.log(1)
      break
    case 1:
      console.log(2)
      break
  }

  scene.input.on('pointerup', pointerCallback)
}

const update = (scene: Phaser.Scene, time: number, delta: number): void => {
  if (gameState.mapUpdate) {
    gameState.mapUpdate = false
    drawMap(scene)
  }

  guy.setPosition(gameSettings.screenPosFromMap(gameState.player.x), gameSettings.screenPosFromMap(gameState.player.y))

  if (controls.cursors.left.isDown) {
    scene.cameras.main.x -= 1
  }

  if (controls.cursors.right.isDown) {
    scene.cameras.main.x += 1
  }

  if (controls.cursors.up.isDown) {
    scene.cameras.main.y -= 1
  }

  if (controls.cursors.down.isDown) {
    scene.cameras.main.y += 1
  }

  if (controls.quit.isDown) {
    connectionManager.logout()
    gameState.phase = 'title'
  }

  if (controls.zoomIn.isDown) {
    gameSettings.changeZoom(0.01)
    scene.cameras.main.setZoom(gameSettings.gameCameraZoom)
  } else if (controls.zoomOut.isDown) {
    gameSettings.changeZoom(-0.01)
    scene.cameras.main.setZoom(gameSettings.gameCameraZoom)
  }

  // Check monsterss
  gameState.monsters.forEach((m) => {
    if (!m.sprite) {
      m.sprite = scene.add.image(m.x * gameSettings.cellSize, m.y * gameSettings.cellSize, 'monster')
      console.log('Creating new monster sprite', m.id)
    }

    m.sprite.setPosition(gameSettings.screenPosFromMap(m.x), gameSettings.screenPosFromMap(m.y))
  })
}

const cleanup = (scene: Phaser.Scene): void => {
  mapTiles.forEach((m) => m.destroy())
  mapTiles = []

  guy.destroy()

  scene.input.removeListener('pointerup', pointerCallback)
}

const drawMap = (scene: Phaser.Scene): void => {
  console.log('drawMap')

  mapTiles.forEach((m) => m.destroy())
  mapTiles = []

  for (let y = 0; y < gameState.map.length; y++) {
    for (let x = 0; x < gameState.map[y].length; x++) {
      if (gameState.map[y][x] === SquareType.Wall) {
        mapTiles.push(scene.add.image(gameSettings.screenPosFromMap(x), gameSettings.screenPosFromMap(y), 'wall'))
      }
    }
  }
}

export const fns = {
  init,
  update,
  cleanup,
  drawMap
}
