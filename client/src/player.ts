export type Player = {
  loggedIn: boolean
  x: number
  y: number
  lastX: number
  lastY: number
  visibleRange: number
  activityLog: string[]
}

export type Monster = {
  subType: string
  id: number
  x: number
  y: number
  lastX: number
  lastY: number
  seen: boolean
  ghostX: number
  ghostY: number
  dead: boolean
  activityLog: string[]
  sprite?: Phaser.GameObjects.Image
}
