import { MOBActivityLog } from 'dng-shared'
import { activityLogColor } from './activity'
import { gameState } from './init'
import { gameSettings } from './settings'

const hudSceneId = 'hud'
const lineHeight = 20

let healthText: Phaser.GameObjects.Text | undefined
let actionsText: Phaser.GameObjects.Text | undefined
let xpText: Phaser.GameObjects.Text | undefined
let levelText: Phaser.GameObjects.Text | undefined
let logText: Phaser.GameObjects.Text // Phaser.GameObjects.Text[] | undefined
let newLogs = false

let log: { entry: MOBActivityLog; source?: string; flip?: boolean }[] = []

export const createHudScene = (scene: Phaser.Scene): void => {
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
  this.add.rectangle(0, 0, gameSettings.hudWidth, gameSettings.screenHeight).setOrigin(0, 0).setStrokeStyle(2, 0x0000ff)

  const x = 5
  let y = 5
  const col1 = gameSettings.hudWidth / 2
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

  this.add.text(col1, (y += lineHeight), 'LOG', textStyle).setOrigin(1, 0)
  logText = this.add
    .text(5, (y += lineHeight), '', {
      wordWrap: {
        width: gameSettings.hudWidth - 10
      }
    })
    .setOrigin(0, 0)
}

export const hudCleanup = (scene: Phaser.Scene): void => {
  // TODO: Are all the gameobjects destroyed as well or do I need to manually destroy them?
  scene.scene.remove(hudSceneId)
}

function hudUpdate(this: Phaser.Scene): void {
  healthText?.setText(`${gameState.player.hp} / ${gameState.player.hpMax}`)
  actionsText?.setText(`${gameState.player.ap} / ${gameState.player.apMax}`)
  levelText?.setText(`${gameState.player.level}`)
  xpText?.setText(`${gameState.player.xp} / ${gameState.player.xpNext}`)

  if (newLogs) {
    // This was way too slow
    // if (logText) {
    //   logText.forEach((l) => l.destroy())
    // }
    // let y = 125
    // logText = log.map((l) =>
    //   this.add.text(5, (y += lineHeight), `${l.source ? `${l.source}:` : ''}${l.entry.message}`, {
    //     color: activityLogColor(l.entry.level, l.flip)
    //   })
    // )
    logText.setText(log.map((l) => `${l.source ? `${l.source}:` : ''}${l.entry.message}`).join('\n'))
    newLogs = false
  }
}

export const addMessages = (newEntries: MOBActivityLog[], source?: string, flip?: boolean): void => {
  log = [...newEntries.map((entry) => ({ entry, flip, source })), ...log].slice(0, 40)
  newLogs = true
}
