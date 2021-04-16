import { MOBActivityLog, WeaponDetails } from 'dng-shared'
import { gameSettings, gameState } from '../../gameManagement'
import { activityLogColor } from './activity'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext'

const hudSceneId = 'hud'
const lineHeight = 20

let healthText: Phaser.GameObjects.Text | undefined
let actionsText: Phaser.GameObjects.Text | undefined
let xpText: Phaser.GameObjects.Text | undefined
let meleeDefText: Phaser.GameObjects.Text | undefined
let rangedDefText: Phaser.GameObjects.Text | undefined
let magicDefText: Phaser.GameObjects.Text | undefined
let levelText: Phaser.GameObjects.Text | undefined
let attacksText: Phaser.GameObjects.Text
let logText: Phaser.GameObjects.Text
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

  const right = { align: 'right' }
  const center = { align: 'center' }

  this.add.text(x, y, gameState.player.name).setOrigin(0, 0)
  levelText = this.add.text(gameSettings.hudWidth - 5, y, 'Level 1', right).setOrigin(1, 0)

  this.add.text(x, (y += lineHeight), gameState.race).setOrigin(0, 0)
  xpText = this.add.text(gameSettings.hudWidth - 5, y, 'XP 0/0', right).setOrigin(1, 0)

  this.add.text(x, (y += lineHeight), gameState.profession).setOrigin(0, 0)

  this.add.text(gameSettings.hudWidth / 4, (y += lineHeight), 'HP', right).setOrigin(1, 0)
  healthText = this.add.text(gameSettings.hudWidth / 4 + 5, y, '').setOrigin(0, 0)

  this.add.text(gameSettings.hudWidth * 0.65, y, 'AP', right).setOrigin(1, 0)
  actionsText = this.add.text(gameSettings.hudWidth * 0.65 + 5, y, '').setOrigin(0, 0)

  this.add.text(x, (y += lineHeight), 'Defense').setOrigin(0, 0)
  meleeDefText = this.add.text(x + 5, (y += lineHeight), 'MEL XX').setOrigin(0, 0)
  rangedDefText = this.add.text(gameSettings.hudWidth / 2, y, 'RNG XX', center).setOrigin(0.5, 0)
  magicDefText = this.add.text(gameSettings.hudWidth - 10, y, 'MAG XX', right).setOrigin(1, 0)

  this.add.text(x, (y += lineHeight), 'Attacks').setOrigin(0, 0)
  attacksText = new BBCodeText(this, x + 5, (y += lineHeight), '', {
    wrap: {
      mode: 1,
      width: gameSettings.hudWidth - 10
    }
  }).setOrigin(0, 0)
  this.add.existing(attacksText)

  this.add.text(gameSettings.hudWidth / 2, (y += lineHeight * 8), '----LOG----', center).setOrigin(0.5, 0)

  logText = new BBCodeText(this, 5, (y += lineHeight), '', {
    wrap: {
      mode: 1,
      width: gameSettings.hudWidth - 10
    }
  }).setOrigin(0, 0)

  this.add.existing(logText)
}

export const hudCleanup = (scene: Phaser.Scene): void => {
  // TODO: Are all the gameobjects destroyed as well or do I need to manually destroy them?
  scene.scene.remove(hudSceneId)
  log = []
  newLogs = false
}

function hudUpdate(this: Phaser.Scene): void {
  healthText?.setText(`${gameState.player.hp}/${gameState.player.hpMax}`)
  actionsText?.setText(`${gameState.player.ap}/${gameState.player.apMax}`)
  levelText?.setText(`Level ${gameState.player.level}`)
  xpText?.setText(`XP ${gameState.player.xp}/${gameState.player.xpNext}`)
  meleeDefText?.setText(`⚔️ ${gameState.player.meleeDefense}`)
  rangedDefText?.setText(`🏹 ${gameState.player.rangedDefense}`)
  magicDefText?.setText(`⚡️ ${gameState.player.magicDefense}`)

  const weaponDetails = (icon: string, on: boolean, details?: WeaponDetails) =>
    details
      ? on
        ? `${icon} ${details.weapon}\n  Bonus HIT ${details.hitBonus} DMG ${details.dmgBonus}`
        : `${icon} [color=#555555]${details.weapon}\n  Bonus HIT ${details.hitBonus} DMG ${details.dmgBonus}[/color]`
      : undefined

  attacksText?.setText(
    [
      weaponDetails('⚔️', gameState.player.meleeOn, gameState.player.meleeSkills),
      weaponDetails('🏹', gameState.player.rangedOn, gameState.player.rangedSkills),
      weaponDetails('⚡️', gameState.player.spellOn, gameState.player.rangedSpellSkills),
      weaponDetails('💥', gameState.player.spellOn, gameState.player.meleeSpellSkills)
    ]
      .filter((t) => t)
      .join('\n')
  )

  if (newLogs) {
    logText.setText(
      log
        .map(
          (l) =>
            `${l.source ? `[color=red]${l.source}:` : '[color=yellow]you:'}[/color] [color=${activityLogColor(
              l.entry.level,
              l.flip
            )}]${l.entry.message}[/color]`
        )
        .join('\n')
    )
    newLogs = false
  }
}

export const addMessages = (newEntries: MOBActivityLog[], source?: string, flip?: boolean): void => {
  log = [...newEntries.map((entry) => ({ entry, flip, source })), ...log].slice(0, 30)
  newLogs = true
}
