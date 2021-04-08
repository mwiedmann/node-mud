import { MOBActivityLog, MOBAttackActivityLog } from './activity'
import { SquareType } from './square'

export type MapMessage = {
  type: 'map'
  data: SquareType[][]
}

export type WelcomeMessage = {
  type: 'welcome'
  data: string
}

type MOBMessageData = {
  id: number
  subType: string
  dead: boolean
  x: number
  y: number
  hp: number
  hpMax: number
  ap: number
  apMax: number
  invisible: boolean
  activityLog: MOBActivityLog[]
  attackActivityLog: MOBAttackActivityLog[]
}

export type PlayerMessage = {
  type: 'player'
  data: MOBMessageData & {
    visibleRange: number
  }
}

export type PlayerSelfMessage = {
  type: 'self'
} & Pick<PlayerMessage, 'data'>

export type MonsterMessage = {
  type: 'monster'
  data: MOBMessageData
}

export type ConsumableMessage = {
  type: 'consumable'
  data: {
    subType: string
    id: number
    x: number
    y: number
    health: number
    actionPoints: number
    gone: boolean
  }
}

export type ItemMessage = {
  type: 'item'
  data: {
    majorType: string
    subType: string
    id: number
    x: number
    y: number
    description: string
    gone: boolean
  }
}

export type DeadMessage = {
  type: 'dead'
  gold: number
  kills: number
  damageDone: number
}

export type BaseMessage =
  | WelcomeMessage
  | MapMessage
  | PlayerMessage
  | PlayerSelfMessage
  | MonsterMessage
  | ConsumableMessage
  | ItemMessage
  | DeadMessage
