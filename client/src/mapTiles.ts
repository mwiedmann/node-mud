import * as Phaser from 'phaser'
import { gameState } from './init'
import { Ghost } from './player'
import { gameSettings } from './settings'
import { Mrpas } from 'mrpas'

// const fov = new Mrpas(gameSettings.cellCountX, gameSettings.cellCountY, (x, y) => {
//   return gameState.map[y][x] > 0
// })

export type MapTiles = Map<
  string,
  {
    x: number
    y: number
    seen: boolean
    sprite: Phaser.GameObjects.Image
  }
>

export type SeenTile = Phaser.Tilemaps.Tile & {
  seen?: boolean
}

export const inRange = (visibleRange: number, startX: number, startY: number, endX: number, endY: number): boolean =>
  Math.abs(endX - startX) <= visibleRange && Math.abs(endY - startY) <= visibleRange

export const setMapTilesSight = (
  mapLayer: Phaser.Tilemaps.TilemapLayer,
  visibleRange: number,
  startX: number,
  startY: number
): void => {
  // Calculate visible spaces
  mapLayer.forEachTile((m: SeenTile) => {
    const isInRange = inRange(visibleRange, startX, startY, m.x, m.y)
    let isBlocked = false

    // Is this tile in range?
    if (isInRange) {
      isBlocked = tileIsBlocked(startX, startY, m.x, m.y)
    }

    if (isInRange && !isBlocked) {
      m.setVisible(true)
      m.seen = true
      m.alpha = 1
    } else if (m.seen) {
      m.alpha = gameSettings.hiddenTileAlpha
    } else {
      m.setVisible(false)
      m.alpha = 0
    }
  })
  // fov.compute(
  //   startX,
  //   startY,
  //   visibleRange,
  //   (x, y) => {
  //     const tile = mapLayer.getTileAt(x, y)
  //     if (!tile) {
  //       return false
  //     }
  //     return tile.alpha > 0
  //   },
  //   (x, y) => {
  //     const tile = mapLayer.getTileAt(x, y)
  //     if (!tile) {
  //       return
  //     }
  //     tile.alpha = 1
  //   }
  // )
}

export const tileIsBlocked = (startX: number, startY: number, endX: number, endY: number): boolean => {
  let isBlocked = false
  // Can the player see this tile?
  const playerLinesToTile = [
    { line: new Phaser.Geom.Line(startX, startY, endX + 0.1, endY + 0.1), blocked: false },
    {
      line: new Phaser.Geom.Line(startX + 1, startY, endX + 0.9, endY + 0.1),
      blocked: false
    },
    {
      line: new Phaser.Geom.Line(startX, startY + 1, endX + 0.1, endY + 0.9),
      blocked: false
    },
    {
      line: new Phaser.Geom.Line(startX + 1, startY + 1, endX + 0.9, endY + 0.9),
      blocked: false
    }
  ]

  for (let y = Math.min(endY, startY); y <= Math.max(endY, startY) && !isBlocked; y++) {
    for (let x = Math.min(endX, startX); x <= Math.max(endX, startX) && !isBlocked; x++) {
      const isStart = x === startX && y === startY
      const isEnd = x === endX && y === endY
      const hasTile = !isStart && !isEnd && gameState.map[y][x] > 0
      if (hasTile) {
        const rect = new Phaser.Geom.Rectangle(x, y, 1, 1)
        // See if this tile is blocking any lines of sight

        playerLinesToTile[0].blocked =
          playerLinesToTile[0].blocked || Phaser.Geom.Intersects.LineToRectangle(playerLinesToTile[0].line, rect)
        playerLinesToTile[1].blocked =
          playerLinesToTile[1].blocked || Phaser.Geom.Intersects.LineToRectangle(playerLinesToTile[1].line, rect)
        playerLinesToTile[2].blocked =
          playerLinesToTile[2].blocked || Phaser.Geom.Intersects.LineToRectangle(playerLinesToTile[2].line, rect)
        playerLinesToTile[3].blocked =
          playerLinesToTile[3].blocked || Phaser.Geom.Intersects.LineToRectangle(playerLinesToTile[3].line, rect)

        isBlocked =
          playerLinesToTile[0].blocked &&
          playerLinesToTile[1].blocked &&
          playerLinesToTile[2].blocked &&
          playerLinesToTile[3].blocked
      }
    }
  }

  return isBlocked
}

export const checkGhostStatus = (monster: Ghost, playerX: number, playerY: number, visibleRange: number): void => {
  if (monster.seen) {
    const ghostInRange = inRange(visibleRange, playerX, playerY, monster.ghostX, monster.ghostY)
    if (ghostInRange) {
      const sightToGhostBlocked = tileIsBlocked(playerX, playerY, monster.ghostX, monster.ghostY)

      if (!sightToGhostBlocked) {
        // The ghost is in range and not blocked so it will disappear since the real monster is not here
        monster.seen = false
        if (monster.sprite) {
          monster.sprite.setVisible(false)
        }
      }
    }
  }
}
