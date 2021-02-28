import * as Phaser from 'phaser'
import { connectionManager } from '../connection'
import { gameSettings } from '../settings'
import { controls, gameState, sceneUpdate, SquareType } from '../init'

let mapTiles: Phaser.GameObjects.Image[] = []
let guy: Phaser.GameObjects.Image
let pointerCallback: (p: Phaser.Input.Pointer) => void
let floatingObjects: {
  timeStart: number
  text: Phaser.GameObjects.Text
  delete?: boolean
  direction: number
}[] = []

const init = (scene: Phaser.Scene): void => {
  connectionManager.openConnection()
  scene.cameras.main.setZoom(gameSettings.gameCameraZoom)

  guy = scene.add.image(gameState.player.x * gameSettings.cellSize, gameState.player.y * gameSettings.cellSize, 'guy')

  // Set the camera to follow the guy (with some lerping, a deadzone, and bounds)
  scene.cameras.main.startFollow(guy, true, 0.1, 0.1)
  scene.cameras.main.setDeadzone(gameSettings.cellSize * 10, gameSettings.cellSize * 10)
  scene.cameras.main.setBounds(0, 0, gameSettings.fieldWidth, gameSettings.fieldHeight)

  const pointerCallback = (p: Phaser.Input.Pointer) => {
    connectionManager.setDestination(gameSettings.cellFromScreenPos(p.worldX), gameSettings.cellFromScreenPos(p.worldY))
  }

  scene.input.on('pointerup', pointerCallback)
}

const update = (scene: Phaser.Scene, time: number, delta: number): void => {
  if (gameState.mapUpdate) {
    gameState.mapUpdate = false
    drawMap(scene)
  }

  guy.setPosition(gameSettings.screenPosFromMap(gameState.player.x), gameSettings.screenPosFromMap(gameState.player.y))

  // Create floating text for any player activity
  if (gameState.player.activityLog.length > 0) {
    let offSet = 0
    gameState.player.activityLog.forEach((a) => {
      floatingObjects.push({
        timeStart: time,
        direction: 1,
        text: scene.add.text(
          gameSettings.screenPosFromMap(gameState.player.x),
          gameSettings.screenPosFromMap(gameState.player.y) + (gameSettings.cellSize + offSet),
          a,
          { color: '#FF0000', align: 'center' }
        )
      })
      offSet += 16
    })
    gameState.player.activityLog = []
  }

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
    // If the monster is dead, destroy any sprite
    // We could remove from the list, but we might want to leave a body behind
    if (m.dead) {
      if (m.sprite) {
        m.sprite.destroy()
      }
      return
    }

    if (!m.sprite) {
      m.sprite = scene.add.image(m.x * gameSettings.cellSize, m.y * gameSettings.cellSize, m.subType)
    }

    if (m.activityLog.length > 0) {
      // TODO: Calc the offset and y pos from cellSize?
      let offSet = 0
      m.activityLog.forEach((a) => {
        floatingObjects.push({
          timeStart: time,
          direction: -1,
          text: scene.add.text(
            gameSettings.screenPosFromMap(m.x),
            gameSettings.screenPosFromMap(m.y) - (gameSettings.cellSize + offSet),
            a,
            { color: '#00FF00', align: 'center' }
          )
        })
        offSet += 16
      })
      m.activityLog = []
    }

    m.sprite.setPosition(gameSettings.screenPosFromMap(m.x), gameSettings.screenPosFromMap(m.y))
  })

  // Move any floating text and destroy after a while
  floatingObjects.forEach((l) => {
    l.text.y += 15 * l.direction * (delta / 100)
    if (time - l.timeStart >= 1000) {
      l.text.destroy()
      l.delete = true
    }
  })

  floatingObjects = floatingObjects.filter((f) => !f.delete)
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
