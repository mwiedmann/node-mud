import { MOBActivityLog, MOBAttackActivityLog } from 'dng-shared'
import { StatusBars } from './statusbars'

export type Player = {
  loggedIn: boolean
  x: number
  y: number
  dead: boolean
  hp: number
  hpMax: number
  ap: number
  apMax: number
  invisible: boolean
  lastX: number
  lastY: number
  visibleRange: number
  activityLog: MOBActivityLog[]
  attackActivityLog: MOBAttackActivityLog[]
}

export type Ghost = {
  seen: boolean
  ghostX: number
  ghostY: number
  sprite?: Phaser.GameObjects.Image
}

export type Monster = Ghost & {
  subType: string
  id: number
  x: number
  y: number
  hp: number
  hpMax: number
  ap: number
  apMax: number
  invisible: boolean
  lastX: number
  lastY: number
  dead: boolean
  activityLog: MOBActivityLog[]
  attackActivityLog: MOBAttackActivityLog[]
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
