import { StatusBars } from './statusbars'

export type ActivityLogLevel = 'great' | 'good' | 'neutral' | 'bad' | 'terrible'

export type ActivityLog = {
  level: ActivityLogLevel
  message: string
}

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
  activityLog: ActivityLog[]
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
  activityLog: ActivityLog[]
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
