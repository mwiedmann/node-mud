class GameSettings {
  constructor() {
    this.halfCell = this.cellSize / 2
    this.fieldWidth = this.cellCountX * this.cellSize
    this.fieldHeight = this.cellCountY * this.cellSize
    this.fieldWidthMid = this.fieldWidth / 2
    this.fieldHeightMid = this.fieldHeight / 2
    this.screenWidthMid = this.screenWidth / 2
    this.screenHeightMid = this.screenHeight / 2
  }

  cellCountX = 200
  cellCountY = 100
  cellSize = 32
  screenWidth = 1920
  screenHeight = 1080
  screenWidthMid: number
  screenHeightMid: number
  gameCameraZoom = 1.4
  ghostAlpha = 0.4
  hiddenTileAlpha = 0.3

  wallTilesStartIndex = 64

  halfCell: number
  fieldWidth: number
  fieldHeight: number
  fieldWidthMid: number
  fieldHeightMid: number

  cellFromScreenPos(pixel: number) {
    return Math.floor(pixel / this.cellSize)
  }

  screenPosFromMap(pos: number) {
    return pos * gameSettings.cellSize + gameSettings.halfCell
  }

  changeZoom(amount: number) {
    let newZoom = this.gameCameraZoom + amount

    newZoom = Math.max(0.5, newZoom)
    newZoom = Math.min(3, newZoom)

    this.gameCameraZoom = newZoom
  }
}

export const gameSettings = new GameSettings()
