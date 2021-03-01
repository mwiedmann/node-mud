export type MapTiles = Map<
  string,
  {
    x: number
    y: number
    seen: boolean
    sprite: Phaser.GameObjects.Image
  }
>

export const setMapTilesSight = (mapTiles: MapTiles, visibleRange: number, startX: number, startY: number): void => {
  // Calculate visible spaces
  mapTiles.forEach((m) => {
    const isInRange = Math.abs(m.x - startX) <= visibleRange && Math.abs(m.y - startY) <= visibleRange
    let isBlocked = false

    // Is this tile in range?
    if (isInRange) {
      isBlocked = tileIsBlocked(mapTiles, startX, startY, m.x, m.y)
    }

    if (isInRange && !isBlocked) {
      m.sprite.setVisible(true)
      m.seen = true
      m.sprite.alpha = 1
    } else if (m.seen) {
      m.sprite.alpha = 0.2
    } else {
      m.sprite.setVisible(false)
    }
  })
}

const tileIsBlocked = (mapTiles: MapTiles, startX: number, startY: number, endX: number, endY: number): boolean => {
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
      const hasTile = !isStart && !isEnd && mapTiles.has(`${x},${y}`)
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
