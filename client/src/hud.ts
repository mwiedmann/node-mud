import { gameState } from './init'
import { gameSettings } from './settings'

const hudSceneId = 'hud'
const lineHeight = 20

let healthText: Phaser.GameObjects.Text | undefined
let actionsText: Phaser.GameObjects.Text | undefined
let xpText: Phaser.GameObjects.Text | undefined
let levelText: Phaser.GameObjects.Text | undefined
let specialText: Phaser.GameObjects.Text | undefined

export function createHudScene(scene: Phaser.Scene): void {
  scene.scene.add(
    hudSceneId,
    {
      create: hudCreate,
      update: hudUpdate
    },
    true
  )
}

function hudCreate(this: Phaser.Scene) {
  this.add.rectangle(0, 0, 200, gameSettings.screenHeight).setOrigin(0, 0).setStrokeStyle(2, 0x0000ff)

  const x = 5
  let y = 5
  const col1 = 100
  const textStyle = { align: 'right' }

  this.add.text(col1, y, gameState.race || '', textStyle).setOrigin(1, 0)
  this.add.text(col1, (y += lineHeight), gameState.profession || '', textStyle).setOrigin(1, 0)

  this.add.text(col1, (y += lineHeight), 'Health', textStyle).setOrigin(1, 0)
  healthText = this.add.text(col1 + 5, y, '').setOrigin(0, 0)

  this.add.text(col1, (y += lineHeight), 'Actions', textStyle).setOrigin(1, 0)
  actionsText = this.add.text(col1 + 5, y, '').setOrigin(0, 0)

  this.add.text(col1, (y += lineHeight), 'Level', textStyle).setOrigin(1, 0)
  levelText = this.add.text(col1 + 5, y, '').setOrigin(0, 0)

  this.add.text(col1, (y += lineHeight), 'XP', textStyle).setOrigin(1, 0)
  xpText = this.add.text(col1 + 5, y, '').setOrigin(0, 0)

  this.add.text(col1, (y += lineHeight), 'Special', textStyle).setOrigin(1, 0)
  specialText = this.add.text(col1 + 5, y, '').setOrigin(0, 0)
}

export function hudCleanup(scene: Phaser.Scene): void {
  // TODO: Are all the gameobjects destroyed as well or do I need to manually destroy them?
  scene.scene.remove(hudSceneId)
}

function hudUpdate(this: Phaser.Scene): void {
  healthText?.setText(`${gameState.player.hp} / ${gameState.player.hpMax}`)
  actionsText?.setText(`${gameState.player.ap} / ${gameState.player.apMax}`)
  levelText?.setText(`${gameState.player.level}`)
  xpText?.setText(`${gameState.player.xp} / ${gameState.player.xpNext}`)
  specialText?.setText(`${gameState.player.special}`)
}
