import { StatusBars } from './statusbars'

export type Player = {
  loggedIn: boolean
  x: number
  y: number
  hp: number
  hpMax: number
  ap: number
  apMax: number
  lastX: number
  lastY: number
  visibleRange: number
  activityLog: string[]
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
  lastX: number
  lastY: number
  dead: boolean
  activityLog: string[]
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
