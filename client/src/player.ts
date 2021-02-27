export type Player = {
  x: number
  y: number
}

export type Monster = {
  subType: string
  id: number
  x: number
  y: number
  dead: boolean
  sprite?: Phaser.GameObjects.Image
}
