import * as Phaser from 'phaser'
import { connectionManager } from '../../connection'
import { gameSettings, controls, gameState, StatusBars } from '../../gameManagement'
import { checkGhostStatus, inRange, setMapTilesSight, tileIsBlocked } from './mapTiles'
import { createHudScene, hudCleanup } from './hud'
import {
  cleanupFloatingObjects,
  manageFloatingObjects,
  monsterFloatingObjects,
  playerFloatingObjects
} from './floatingObjects'

let guy: Phaser.GameObjects.Image | undefined
let statusbars: StatusBars | undefined
let star: Phaser.GameObjects.Image | undefined
let mapCamera: Phaser.Cameras.Scene2D.Camera | undefined

let mapFullscreen = false

const tileData: Map<
  number,
  {
    tileMap: Phaser.Tilemaps.Tilemap
    mapLayer: Phaser.Tilemaps.TilemapLayer
    tileSet: Phaser.Tilemaps.Tileset
  }
> = new Map()

let deadText: Phaser.GameObjects.Text | undefined
let preCameraSettings: Phaser.Types.Cameras.Scene2D.JSONCamera

const toggleMap = (scene: Phaser.Scene) => {
  mapFullscreen = !mapFullscreen
  if (mapFullscreen) {
    scene.cameras.main.visible = false
    mapCamera
      ?.setViewport(gameSettings.gameViewportX, 0, gameSettings.gameViewportWidth, gameSettings.screenHeight)
      .setZoom(gameSettings.mapZoomBig)
  } else {
    scene.cameras.main.visible = true
    mapCamera
      ?.setViewport(
        gameSettings.mapViewportX,
        gameSettings.mapViewportY,
        gameSettings.mapViewportSize,
        gameSettings.mapViewportSize
      )
      .setZoom(gameSettings.mapZoomSmall)
  }
}
const currentTileData = () => {
  const data = tileData.get(gameState.mapId)
  if (!data) {
    throw new Error(`No tiledata found for id:${gameState.mapId}`)
  }
  return data
}

const pointerCallback = (p: Phaser.Input.Pointer) => {
  connectionManager.setDestination(gameSettings.cellFromScreenPos(p.worldX), gameSettings.cellFromScreenPos(p.worldY))
}

const init = (scene: Phaser.Scene): void => {
  createHudScene(scene)

  // Save the default camera settings so we can reset later
  preCameraSettings = scene.cameras.main.toJSON()

  connectionManager.openConnection(scene)
  scene.cameras.main.setZoom(gameSettings.gameCameraZoom)
  scene.cameras.main.setViewport(
    gameSettings.gameViewportX,
    0,
    gameSettings.gameViewportWidth,
    gameSettings.screenHeight
  )

  guy = scene.add.image(0, 0, gameState.profession)
  statusbars = new StatusBars(scene)
  star = scene.add.image(0, 0, 'star')

  // Set the camera to follow the guy (with some lerping, a deadzone, and bounds)
  scene.cameras.main
    .startFollow(guy, true, 0.03, 0.03)
    .setDeadzone(gameSettings.cellSize * 2, gameSettings.cellSize * 2)
    .setBounds(-500, -500, gameSettings.fieldWidth + 1000, gameSettings.fieldHeight + 1000)

  mapCamera = scene.cameras.add(
    gameSettings.mapViewportX,
    gameSettings.mapViewportY,
    gameSettings.mapViewportSize,
    gameSettings.mapViewportSize
  )
  mapCamera
    .setZoom(gameSettings.mapZoomSmall)
    .startFollow(guy, true, 0.03, 0.03)
    .setBounds(0, 0, gameSettings.fieldWidth, gameSettings.fieldHeight)
    .setBackgroundColor('rgba(255,255,255,0.1)')

  controls.mapToggle.on('up', () => {
    toggleMap(scene)
  })

  scene.input.on('pointerup', pointerCallback)

  controls.getItem.on('up', () => {
    connectionManager.getItem(gameState.player.x, gameState.player.y)
  })

  controls.special.on('up', () => {
    connectionManager.setSpecialAbilityLocation(
      gameSettings.cellFromScreenPos(scene.input.activePointer.worldX),
      gameSettings.cellFromScreenPos(scene.input.activePointer.worldY)
    )
  })

  controls.melee.on('up', () => {
    connectionManager.meleeToggle()
  })

  controls.ranged.on('up', () => {
    connectionManager.rangedToggle()
  })

  controls.spell.on('up', () => {
    connectionManager.spellToggle()
  })
}

const backToTitle = (scene: Phaser.Scene) => {
  // reset the camera
  scene.cameras.main.setZoom(1)
  scene.cameras.main.stopFollow()
  scene.cameras.main.setDeadzone()
  scene.cameras.main.setBounds(
    preCameraSettings.bounds?.x || 0,
    preCameraSettings.bounds?.y || 0,
    preCameraSettings.bounds?.width || 1,
    preCameraSettings.bounds?.height || 1
  )
  scene.cameras.main.setViewport(0, 0, gameSettings.screenWidth, gameSettings.screenHeight)
  gameState.phase = 'gameOver'
}

// const isTileVisible = (startX: number, startY: number, endX: number, endY: number, )

const update = (scene: Phaser.Scene, time: number, delta: number): void => {
  // Don't process the game until the player login is complete
  if (!gameState.player.loggedIn) {
    return
  }

  if (gameState.player.dead) {
    if (!deadText) {
      controls.quit.on('up', () => {
        backToTitle(scene)
      })
      showDeadMessage(scene)
    }
  }

  if (gameState.mapUpdate) {
    gameState.mapUpdate = false
    drawMap(scene)
  }

  if (!guy) {
    throw new Error('Player not initialized')
  }

  let playerMoved = false
  // If the player has moved, update their sprite and calculate all the visible spaces
  if (gameState.player.x !== gameState.player.lastX || gameState.player.y !== gameState.player.lastY) {
    playerMoved = true
    guy.setPosition(
      gameSettings.screenPosFromMap(gameState.player.x),
      gameSettings.screenPosFromMap(gameState.player.y)
    )
    star?.setPosition(guy.x + 12, guy.y - 24)

    gameState.player.lastX = gameState.player.x
    gameState.player.lastY = gameState.player.y

    // Calculate visible spaces
    setMapTilesSight(currentTileData().mapLayer, gameState.player.visibleRange, gameState.player.x, gameState.player.y)
  }

  // Dim invisible players
  guy.setAlpha(gameState.player.invisible ? 0.3 : 1)
  star?.setVisible(gameState.player.special)

  if (statusbars) {
    statusbars.set(
      guy.x,
      guy.y,
      gameState.player.hp,
      gameState.player.hpMax,
      gameState.player.ap,
      gameState.player.apMax
    )
  }

  // Manage floating objects for the player
  playerFloatingObjects(scene, time)

  if (controls.quit.isDown) {
    backToTitle(scene)
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
    // Manage floating objects for the monster
    monsterFloatingObjects(scene, m, time)

    // If the monster is dead, destroy any sprite
    // We could remove from the list, but we might want to leave a body behind
    if (m.dead) {
      if (m.sprite) {
        m.sprite.destroy()
        m.sprite = undefined
      }
      if (m.statusbars) {
        m.statusbars.destroy()
        m.statusbars = undefined
      }
      return
    }

    if (!m.sprite) {
      m.sprite = scene.add.image(
        gameSettings.screenPosFromMap(m.x),
        gameSettings.screenPosFromMap(m.y),
        m.profession || m.subType
      )
      m.sprite.setVisible(false)
    }

    if (!m.statusbars) {
      m.statusbars = new StatusBars(scene)
      m.statusbars.set(m.sprite.x, m.sprite.y, m.hp, m.hpMax, m.ap, m.apMax)
    }

    // If the monster or player moved, then recalc the visibility of the monster
    if (m.x !== m.lastX || m.y !== m.lastY || playerMoved) {
      const isInRange = inRange(gameState.player.visibleRange, gameState.player.x, gameState.player.y, m.x, m.y)

      // If the monster is in range, dim it but don't change it's visibility
      // If the monster was visible, the player will continue to see it in it's last known position as a reminder (ghost)
      if (!isInRange) {
        m.sprite.alpha = gameSettings.ghostAlpha
        m.statusbars.setVisibility(false)

        // If the monster is out of range, but the last positon WAS in range and WAS visible to the player, put the ghost in the monster's new postion
        // Here we are assuming the player saw what square the monster stepped into.
        // It makes for a better experience by leaving a ghost on the edge of the player's vision when a monster steps out of range
        if (
          m.seen &&
          inRange(gameState.player.visibleRange, gameState.player.x, gameState.player.y, m.lastX, m.lastY) &&
          !tileIsBlocked(gameState.player.x, gameState.player.y, m.lastX, m.lastY)
        ) {
          m.ghostX = m.x
          m.ghostY = m.y
          m.sprite.setPosition(gameSettings.screenPosFromMap(m.x), gameSettings.screenPosFromMap(m.y))
        }

        // The monster is out of range so check the status of it's last known location (ghost)
        checkGhostStatus(m, gameState.player.x, gameState.player.y, gameState.player.visibleRange)
      } else {
        // The monster is in range so lets check if sight is blocked by a wall
        const sightToMonsterBlocked = tileIsBlocked(gameState.player.x, gameState.player.y, m.x, m.y)

        // If the monster is blocked, dim it and the player may still be able to see it if they saw it before (since it will be visible)
        if (sightToMonsterBlocked) {
          m.sprite.alpha = gameSettings.ghostAlpha
          m.statusbars.setVisibility(false)

          // If the monster just stepped out of vision, put the ghost in the monster's new postion
          // This leaves a ghost on the screen when a monster steps behind a wall
          if (m.seen && !tileIsBlocked(gameState.player.x, gameState.player.y, m.lastX, m.lastY)) {
            m.ghostX = m.x
            m.ghostY = m.y
            m.sprite.setPosition(gameSettings.screenPosFromMap(m.x), gameSettings.screenPosFromMap(m.y))
          }

          // Since the monster is blocked the player may still be seeing it's ghost
          checkGhostStatus(m, gameState.player.x, gameState.player.y, gameState.player.visibleRange)
        } else {
          // The monster is in range and sight is not blocked
          // Show it and set alpha to full visibility
          m.sprite.setVisible(true)
          m.sprite.alpha = 1
          m.sprite.setPosition(gameSettings.screenPosFromMap(m.x), gameSettings.screenPosFromMap(m.y))
          m.statusbars.setVisibility(true)
          m.statusbars.set(m.sprite.x, m.sprite.y, m.hp, m.hpMax, m.ap, m.apMax)
          m.ghostX = m.x
          m.ghostY = m.y
          m.seen = true
        }
      }

      // Update their last position, this lets us tell when the monster moves
      m.lastX = m.x
      m.lastY = m.y
    }
  })

  // TODO: This whole consumable section is almost the same as the monster one (minus the status bars)
  // Refactor into a functon that can handle both
  gameState.items.forEach((c) => {
    if (c.gone) {
      if (c.sprite) {
        c.sprite.destroy()
        c.sprite = undefined
      }
      return
    }

    if (!c.sprite) {
      c.sprite = scene.add.image(gameSettings.screenPosFromMap(c.x), gameSettings.screenPosFromMap(c.y), c.subType)
      c.sprite.setVisible(false)
    }

    // If the player has moved, recalc the visibility of the consumable
    if (playerMoved) {
      const isInRange = inRange(gameState.player.visibleRange, gameState.player.x, gameState.player.y, c.x, c.y)

      // If the consumable is in range, dim it but don't change it's visibility
      // If the consumable was visible, the player will continue to see it in it's last known position as a reminder (ghost)
      if (!isInRange) {
        c.sprite.alpha = gameSettings.ghostAlpha
        // The consumable is out of range so check the status of it's last known location (ghost)
        checkGhostStatus(c, gameState.player.x, gameState.player.y, gameState.player.visibleRange)
      } else {
        // The consumable is in range so lets check if sight is blocked by a wall
        const sightToConsumableBlocked = tileIsBlocked(gameState.player.x, gameState.player.y, c.x, c.y)

        // If the consumable is blocked, dim it and the player may still be able to see it if they saw it before (since it will be visible)
        if (sightToConsumableBlocked) {
          c.sprite.alpha = gameSettings.ghostAlpha
          // Since the consumable is blocked the player may still be seeing it's ghost
          checkGhostStatus(c, gameState.player.x, gameState.player.y, gameState.player.visibleRange)
        } else {
          // The consumable is in range and sight is not blocked
          // Show it and set alpha to full visibility
          c.sprite.setVisible(true)
          c.sprite.alpha = 1
          c.sprite.setPosition(gameSettings.screenPosFromMap(c.x), gameSettings.screenPosFromMap(c.y))
          c.ghostX = c.x
          c.ghostY = c.y
          c.seen = true
        }
      }
    }
  })

  // Manage any floating objects and destroy after a while
  manageFloatingObjects(time, delta)
}

const showDeadMessage = (scene: Phaser.Scene): void => {
  deadText = scene.add.text(
    gameSettings.screenPosFromMap(gameState.player.x),
    gameSettings.screenPosFromMap(gameState.player.y) + gameSettings.cellSize * 2,
    'You are dead! Press ESC to continue',
    { color: 'red', align: 'center' }
  )
}

const cleanup = (scene: Phaser.Scene): void => {
  cleanupLevel()

  // Cleanup all of the tileset/map data
  tileData.forEach((data) => {
    data.mapLayer.destroy()
    data.tileMap.destroy()
    // TileSet doesn't have destroy
    // data.tileSet.destroy()
  })
  tileData.clear()

  guy?.destroy()
  guy = undefined
  statusbars?.destroy()
  statusbars = undefined
  star?.destroy()
  star = undefined

  scene.input.removeListener('pointerup', pointerCallback)
  controls.getItem.removeAllListeners()

  if (mapCamera) {
    scene.cameras.remove(mapCamera)
    mapCamera = undefined
  }

  hudCleanup(scene)
}

const cleanupLevel = () => {
  cleanupFloatingObjects()
  gameState.items.forEach((i) => i.sprite?.destroy())
  gameState.items.clear()
  gameState.monsters.forEach((m) => {
    m.sprite?.destroy()
    m.statusbars?.destroy()
  })
  gameState.monsters.clear()

  deadText?.destroy()
  deadText = undefined
}

const drawMap = (scene: Phaser.Scene): void => {
  console.log('drawMap')
  cleanupLevel()

  // See if we have already created this tileMap/Set/Layer
  // We save it so a player revisiting a level will see areas
  // they've already explored.
  let data = tileData.get(gameState.mapId)

  if (!data) {
    const tileMap = scene.make.tilemap({
      data: gameState.map,
      tileWidth: gameSettings.cellSize,
      tileHeight: gameSettings.cellSize,
      width: gameState.map.length,
      height: gameState.map[0].length
    })

    const tileSet = tileMap.addTilesetImage('maptiles', 'maptiles', gameSettings.cellSize, gameSettings.cellSize)

    const mapLayer = tileMap.createLayer(0, 'maptiles')

    data = { tileMap, tileSet, mapLayer }
    tileData.set(gameState.mapId, data)
  }

  // Hide all layers
  tileData.forEach((td) => {
    td.mapLayer.visible = false
  })

  // Make this layer visible and set its depth
  data.mapLayer.visible = true
  data.mapLayer.setDepth(-1)
}

export const fns = {
  init,
  update,
  cleanup,
  drawMap
}
