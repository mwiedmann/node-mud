import { MOBAttackActivityLog } from 'dng-shared'
import { activityLogColor } from './activity'
import { addMessages } from './hud'
import { gameState, gameSettings, MOB, Monster } from '../../gameManagement'

type Floating = { timeStart: number; object: Phaser.GameObjects.Text | Phaser.GameObjects.Line; delete?: boolean }
type Projectile = Floating & { type: 'projectile' }
type FloatingText = Floating & {
  type: 'text'
  direction: number
}

let floatingObjects: (Projectile | FloatingText)[] = []

const createProjectile = (
  scene: Phaser.Scene,
  log: MOBAttackActivityLog,
  time: number,
  hitColor: number,
  missColor: number
) => {
  floatingObjects.push({
    type: 'projectile',
    timeStart: time,
    object: scene.add
      .line(
        0,
        0,
        gameSettings.screenPosFromMap(log.fromX),
        gameSettings.screenPosFromMap(log.fromY),
        gameSettings.screenPosFromMap(log.toX),
        gameSettings.screenPosFromMap(log.toY),
        log.hit ? hitColor : missColor
      )
      .setOrigin(0, 0)
  })
}

const createActivityLogText = (
  scene: Phaser.Scene,
  mob: MOB,
  time: number,
  direction: number,
  source?: string,
  flip?: boolean
) => {
  if (mob.activityLog.length > 0) {
    let offSet = 0
    mob.activityLog.forEach((a) => {
      floatingObjects.push({
        type: 'text',
        timeStart: time,
        direction,
        object: scene.add.text(
          gameSettings.screenPosFromMap(mob.x),
          gameSettings.screenPosFromMap(mob.y) + (gameSettings.halfCell + offSet),
          a.message,
          { color: activityLogColor(a.level, flip), align: 'center' }
        )
      })
      offSet += 16
    })
    addMessages(mob.activityLog, source, flip)
    mob.activityLog = []
  }
}

export const playerFloatingObjects = (scene: Phaser.Scene, time: number): void => {
  // Create floating text for any player activity
  createActivityLogText(scene, gameState.player, time, 1)

  if (gameState.player.attackActivityLog.length > 0) {
    gameState.player.attackActivityLog.forEach((a) => {
      createProjectile(scene, a, time, 0x00ff00, 0x00ffff)
    })
    gameState.player.attackActivityLog = []
  }
}

export const monsterFloatingObjects = (scene: Phaser.Scene, monster: Monster, time: number): void => {
  // First show any activity for the monster
  createActivityLogText(scene, monster, time, -1, monster.subType, true)

  if (monster.attackActivityLog.length > 0) {
    monster.attackActivityLog.forEach((a) => {
      createProjectile(scene, a, time, 0xff0000, 0x77ff77)
    })
    monster.attackActivityLog = []
  }
}

export const manageFloatingObjects = (time: number, delta: number): void => {
  // Manage any floating objects and destroy after a while
  floatingObjects.forEach((l) => {
    if (l.type === 'text') {
      l.object.y += 8 * l.direction * (delta / 100)
      if (time - l.timeStart >= 1250) {
        l.object.destroy()
        l.delete = true
      }
    } else {
      l.object.alpha = l.object.alpha - delta / 100
      if (time - l.timeStart >= 150) {
        l.object.destroy()
        l.delete = true
      }
    }
  })
  floatingObjects = floatingObjects.filter((f) => !f.delete)
}

export const cleanupFloatingObjects = (): void => {
  floatingObjects.forEach((p) => p.object.destroy())
  floatingObjects = []
}
