import * as Phaser from 'phaser'
import { connectionManager } from '../connection'
import { gameSettings } from '../settings'
import { controls, gameState, sceneUpdate, SquareType } from '../init'
import { checkGhostStatus, inRange, MapTiles, setMapTilesSight, tileIsBlocked } from '../mapTiles'
import { defaultMaxListeners } from 'ws'

const mapTiles: MapTiles = new Map()

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
  scene.cameras.main.setDeadzone(gameSettings.cellSize * 5, gameSettings.cellSize * 5)
  scene.cameras.main.setBounds(0, 0, gameSettings.fieldWidth, gameSettings.fieldHeight)

  const pointerCallback = (p: Phaser.Input.Pointer) => {
    connectionManager.setDestination(gameSettings.cellFromScreenPos(p.worldX), gameSettings.cellFromScreenPos(p.worldY))
  }

  scene.input.on('pointerup', pointerCallback)
}

// const isTileVisible = (startX: number, startY: number, endX: number, endY: number, )

const update = (scene: Phaser.Scene, time: number, delta: number): void => {
  if (gameState.mapUpdate) {
    gameState.mapUpdate = false
    drawMap(scene)
  }

  let playerMoved = false
  // If the player has moved, update their sprite and calculate all the visible spaces
  if (gameState.player.x !== gameState.player.lastX || gameState.player.y !== gameState.player.lastY) {
    playerMoved = true
    guy.setPosition(
      gameSettings.screenPosFromMap(gameState.player.x),
      gameSettings.screenPosFromMap(gameState.player.y)
    )
    gameState.player.lastX = gameState.player.x
    gameState.player.lastY = gameState.player.y

    // Calculate visible spaces
    setMapTilesSight(mapTiles, gameState.player.visibleRange, gameState.player.x, gameState.player.y)
  }

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
      m.sprite.setVisible(false)
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

    // If the monster or player moved, then recalc the visibility of the monster
    if (m.x !== m.lastX || m.y !== m.lastY || playerMoved) {
      m.lastX = m.x
      m.lastY = m.y

      const isInRange = inRange(gameState.player.visibleRange, gameState.player.x, gameState.player.y, m.x, m.y)

      // If the monster is in range, dim it but don't change it's visibility
      // If the monster was visible, the player will continue to see it in it's last known position as a reminder (ghost)
      if (!isInRange) {
        m.sprite.alpha = 0.5

        // The monster is out of range so check the status of it's last known location (ghost)
        checkGhostStatus(mapTiles, m, gameState.player.x, gameState.player.y, gameState.player.visibleRange)
      } else {
        // The monster is in range so lets check if sight is blocked by a wall
        const sightToMonsterBlocked = tileIsBlocked(mapTiles, gameState.player.x, gameState.player.y, m.x, m.y)

        // If the monster is blocked, dim it and the player may still be able to see it if they saw it before (since it will be visible)
        if (sightToMonsterBlocked) {
          m.sprite.alpha = 0.5

          // Since the monster is blocked the player may still be seeing it's ghost
          checkGhostStatus(mapTiles, m, gameState.player.x, gameState.player.y, gameState.player.visibleRange)
        } else {
          // The monster is in range and sight is not blocked
          // Show it and set alpha to full visibility
          m.sprite.setVisible(true)
          m.sprite.alpha = 1
          m.sprite.setPosition(gameSettings.screenPosFromMap(m.x), gameSettings.screenPosFromMap(m.y))
          m.ghostX = m.x
          m.ghostY = m.y
          m.seen = true
        }
      }
    }
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
  mapTiles.forEach((m) => m.sprite.destroy())
  mapTiles.clear()

  guy.destroy()

  scene.input.removeListener('pointerup', pointerCallback)
}

const drawMap = (scene: Phaser.Scene): void => {
  console.log('drawMap')

  mapTiles.forEach((m) => m.sprite.destroy())
  mapTiles.clear()

  for (let y = 0; y < gameState.map.length; y++) {
    for (let x = 0; x < gameState.map[y].length; x++) {
      if (gameState.map[y][x] === SquareType.Wall) {
        mapTiles.set(`${x},${y}`, {
          x,
          y,
          seen: false, // TODO: If redrawing map, need to keep previous "seen" value
          sprite: scene.add.image(gameSettings.screenPosFromMap(x), gameSettings.screenPosFromMap(y), 'wall')
        })
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
