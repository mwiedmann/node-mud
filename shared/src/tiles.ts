type FloorType = 'blueMarble' | 'brownPebble' | 'grayTetris' | 'greenCrystal'

export const floorRanges: Record<FloorType, { start: number; length: number }> = {
  blueMarble: { start: 0, length: 5 },
  brownPebble: { start: 8, length: 8 },
  grayTetris: { start: 16, length: 4 },
  greenCrystal: { start: 24, length: 6 }
}

type WallType = 'grayBrick' | 'darkStone' | 'yellowVines' | 'orangeBrick' | 'whiteBrick'

export const wallRanges: Record<WallType, { start: number; length: number }> = {
  grayBrick: { start: 64, length: 4 },
  darkStone: { start: 72, length: 7 },
  yellowVines: { start: 80, length: 4 },
  orangeBrick: { start: 88, length: 8 },
  whiteBrick: { start: 96, length: 8 }
}

export const stairsDownTile = 56
export const stairsUpTile = 57
export const wallTilesStart = 64
