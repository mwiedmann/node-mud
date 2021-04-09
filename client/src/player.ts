import { MOBActivityLog, MOBAttackActivityLog } from 'dng-shared'
import { StatusBars } from './statusbars'

type MOB = {
  id: number
  x: number
  y: number
  dead: boolean
  hp: number
  hpMax: number
  ap: number
  apMax: number
  xp: number
  xpNext: number
  level: number
  invisible: boolean
  lastX: number
  lastY: number
  activityLog: MOBActivityLog[]
  attackActivityLog: MOBAttackActivityLog[]
  profession?: string
  race?: string
}

export type Player = MOB & {
  loggedIn: boolean
  visibleRange: number
}

export type Ghost = {
  seen: boolean
  ghostX: number
  ghostY: number
  sprite?: Phaser.GameObjects.Image
}

export type Monster = MOB &
  Ghost & {
    subType: string
    statusbars?: StatusBars
  }

export type Consumable = Ghost & {
  subType: string
  x: number
  y: number
  health?: number
  actionPoints?: number
  gone: boolean
}

export type Item = Ghost & {
  majorType: string
  subType: string
  x: number
  y: number
  description: string
  gone: boolean
}
