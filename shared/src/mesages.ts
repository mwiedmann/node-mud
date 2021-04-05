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

export type PlayerMessage = {
  type: 'player'
  data: {
    x: number
    y: number
    hp: number
    hpMax: number
    ap: number
    apMax: number
    invisible: boolean
    activityLog: MOBActivityLog[]
    attackActivityLog: MOBAttackActivityLog[]
    visibleRange: number
  }
}

export type MonsterMessage = {
  type: 'monster'
  data: {
    id: number
    subType: string
    x: number
    y: number
    dead: boolean
    hp: number
    hpMax: number
    ap: number
    apMax: number
    invisible: boolean
    activityLog: MOBActivityLog[]
    attackActivityLog: MOBAttackActivityLog[]
  }
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
  | MonsterMessage
  | ConsumableMessage
  | ItemMessage
  | DeadMessage
