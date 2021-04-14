import { MOBActivityLog, MOBAttackActivityLog } from './activity'
import { SquareType } from './square'

export type MapMessage = {
  type: 'map'
  data: {
    map: SquareType[][]
    id: number
  }
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
  profession?: string
  race?: string
}

export type WeaponDetails = { weapon: string; hitBonus: number; dmgBonus: number }

export type PlayerMessage = {
  type: 'player'
  data: MOBMessageData & {
    visibleRange: number
    xp: number
    xpNext: number
    level: number
    special: boolean
    meleeOn: boolean
    rangedOn: boolean
    spellOn: boolean
    meleeDefense: number
    rangedDefense: number
    magicDefense: number
    meleeSkills: WeaponDetails
    rangedSkills: WeaponDetails
    rangedSpellSkills: WeaponDetails
    meleeSpellSkills: WeaponDetails
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

/**
 * This is used when a MOB needs to be removed from the player's game.
 * It is usually due to the MOB switching levels.
 * Death is handled separately.
 */
export type RemoveMessage = {
  type: 'remove'
  id: number
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
  | RemoveMessage
