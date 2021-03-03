import * as Phaser from 'phaser'
import { gameSettings } from './settings'

const barWidth = gameSettings.cellSize

export class StatusBars {
  constructor(scene: Phaser.Scene) {
    this.healthBar = scene.add.rectangle(0, 0, barWidth, 5, 0x00ff00)
    this.apBar = scene.add.rectangle(0, 0, barWidth, 5, 0x0000ff)
  }

  healthBar: Phaser.GameObjects.Rectangle
  apBar: Phaser.GameObjects.Rectangle

  set(x: number, y: number, hp: number, hpMax: number, ap: number, apMax: number): void {
    const hpPercent = hp / hpMax
    const hpColor = hpPercent < 25 ? 0xff0000 : hpPercent < 60 ? 0xffff00 : 0x00ff00

    this.healthBar.setPosition(x, y - 26)
    this.healthBar.width = Math.ceil(barWidth * hpPercent)
    this.healthBar.fillColor = hpColor

    this.apBar.setPosition(x, y - 20)
    this.apBar.width = Math.ceil(barWidth * (ap / apMax))
  }

  setVisibility(visible: boolean): void {
    this.healthBar.setVisible(visible)
    this.apBar.setVisible(visible)
  }

  destroy(): void {
    this.healthBar.destroy()
    this.apBar.destroy()
  }
}
