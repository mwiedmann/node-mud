export type MOBActivityLogLevel = 'great' | 'good' | 'neutral' | 'bad' | 'terrible'

export type MOBActivityLog = {
  level: MOBActivityLogLevel
  message: string
}

export type MOBAttackActivityLogType = 'ranged' | 'spell'
export type MOBAttackActivityLog = {
  type: MOBAttackActivityLogType
  fromX: number
  fromY: number
  toX: number
  toY: number
  hit: boolean
  targetId: number
}
