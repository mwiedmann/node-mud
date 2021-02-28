export type Player = {
  x: number
  y: number
  activityLog: string[]
}

export type Monster = {
  subType: string
  id: number
  x: number
  y: number
  dead: boolean
  activityLog: string[]
  sprite?: Phaser.GameObjects.Image
}
