import * as Phaser from 'phaser'
import { connectionManager } from '../connection'
import { gameSettings } from '../settings'
import { controls, freshPlayer, gameState, sceneUpdate } from '../init'
import { checkGhostStatus, inRange, setMapTilesSight, tileIsBlocked } from '../mapTiles'
import { StatusBars } from '../statusbars'
import { MOBActivityLogLevel } from 'dng-shared'

let guy: Phaser.GameObjects.Image | undefined
let statusbars: StatusBars | undefined
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

let floatingObjects: {
  timeStart: number
  text: Phaser.GameObjects.Text
  delete?: boolean
  direction: number
}[] = []

let projectiles: {
  timeStart: number
  sprite: Phaser.GameObjects.Line
  delete?: boolean
}[] = []

const activityColors: Record<MOBActivityLogLevel, string> = {
  great: '#00FF00',
  good: '#00FF88',
  neutral: '#00DDFF',
  bad: '#FF6f00',
  terrible: '#FF0000'
}

const activityLogColor = (level: MOBActivityLogLevel, flip?: boolean) =>
  (level === 'great' && !flip) || (level === 'terrible' && flip)
    ? activityColors.great
    : (level === 'good' && !flip) || (level === 'bad' && flip)
    ? activityColors.good
    : level === 'neutral'
    ? activityColors.neutral
    : (level === 'bad' && !flip) || (level === 'good' && flip)
    ? activityColors.bad
    : (level === 'terrible' && !flip) || (level === 'great' && flip)
    ? activityColors.terrible
    : activityColors.neutral

const init = (scene: Phaser.Scene): void => {
  // Save the default camera settings so we can reset later
  preCameraSettings = scene.cameras.main.toJSON()

  connectionManager.openConnection(scene)
  scene.cameras.main.setZoom(gameSettings.gameCameraZoom)

  guy = scene.add.image(0, 0, gameState.profession)
  statusbars = new StatusBars(scene)

  // Set the camera to follow the guy (with some lerping, a deadzone, and bounds)
  scene.cameras.main.startFollow(guy, true, 0.03, 0.03)
  scene.cameras.main.setDeadzone(gameSettings.cellSize * 2, gameSettings.cellSize * 2)
  scene.cameras.main.setBounds(0, 0, gameSettings.fieldWidth, gameSettings.fieldHeight)

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
      controls.next.on('up', () => {
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

    gameState.player.lastX = gameState.player.x
    gameState.player.lastY = gameState.player.y

    // Calculate visible spaces
    setMapTilesSight(currentTileData().mapLayer, gameState.player.visibleRange, gameState.player.x, gameState.player.y)
  }

  // Dim invisible players
  guy.setAlpha(gameState.player.invisible ? 0.3 : 1)

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

  // Create floating text for any player activity
  if (gameState.player.activityLog.length > 0) {
    let offSet = 0
    gameState.player.activityLog.forEach((a) => {
      floatingObjects.push({
        timeStart: time,
        direction: 1,
        text: scene.add.text(
          gameSettings.screenPosFromMap(gameState.player.x),
          gameSettings.screenPosFromMap(gameState.player.y) + (gameSettings.halfCell + offSet),
          a.message,
          { color: activityLogColor(a.level), align: 'center' }
        )
      })
      offSet += 16
    })
    gameState.player.activityLog = []
  }

  if (gameState.player.attackActivityLog.length > 0) {
    gameState.player.attackActivityLog.forEach((a) => {
      projectiles.push({
        timeStart: time,
        sprite: scene.add
          .line(
            0,
            0,
            gameSettings.screenPosFromMap(a.fromX),
            gameSettings.screenPosFromMap(a.fromY),
            gameSettings.screenPosFromMap(a.toX),
            gameSettings.screenPosFromMap(a.toY),
            a.hit ? 0x00ff00 : 0x00ffff
          )
          .setOrigin(0, 0)
      })
    })
    gameState.player.attackActivityLog = []
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
    // First show any activity for the monster
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
            a.message,
            { color: activityLogColor(a.level, true), align: 'center' }
          )
        })
        offSet += 16
      })
      m.activityLog = []
    }

    m.attackActivityLog.forEach((a) => {
      projectiles.push({
        timeStart: time,
        sprite: scene.add
          .line(
            0,
            0,
            gameSettings.screenPosFromMap(a.fromX),
            gameSettings.screenPosFromMap(a.fromY),
            gameSettings.screenPosFromMap(a.toX),
            gameSettings.screenPosFromMap(a.toY),
            a.hit ? 0xff0000 : 0x77ff77
          )
          .setOrigin(0, 0)
      })
    })
    m.attackActivityLog = []

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

  // Move any floating text and destroy after a while
  floatingObjects.forEach((l) => {
    l.text.y += 8 * l.direction * (delta / 100)
    if (time - l.timeStart >= 1250) {
      l.text.destroy()
      l.delete = true
    }
  })
  floatingObjects = floatingObjects.filter((f) => !f.delete)

  projectiles.forEach((p) => {
    p.sprite.alpha = p.sprite.alpha - delta / 100
    if (time - p.timeStart >= 150) {
      p.sprite.destroy()
      p.delete = true
    }
  })
  projectiles = projectiles.filter((f) => !f.delete)
}

const showDeadMessage = (scene: Phaser.Scene): void => {
  deadText = scene.add.text(
    gameSettings.screenPosFromMap(gameState.player.x),
    gameSettings.screenPosFromMap(gameState.player.y) + gameSettings.cellSize * 2,
    'You are dead! Press Space to continue',
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

  scene.input.removeListener('pointerup', pointerCallback)
  controls.getItem.removeAllListeners()
}

const cleanupLevel = () => {
  projectiles.forEach((p) => p.sprite.destroy())
  projectiles = []
  floatingObjects.forEach((l) => l.text.destroy())
  floatingObjects = []
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
