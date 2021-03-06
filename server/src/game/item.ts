import { Dice } from './combat'
import { nextId } from './id'
import { MOBSkills } from './players'

export type ItemType =
  | 'melee'
  | 'ranged'
  | 'ring'
  | 'amulet'
  | 'head'
  | 'armor'
  | 'boots'
  | 'ranged-spell'
  | 'melee-spell'

export class Item {
  constructor(public type: ItemType, public name: string, public bonuses: Partial<MOBSkills>) {}

  id = nextId()
  x = 0
  y = 0
  lastState?: string
  gone?: boolean

  getDescription(): string {
    return `${this.type} ${this.name}`
  }

  getState(): string | undefined {
    const state = JSON.stringify({
      type: 'item',
      data: {
        subType: this.type,
        id: this.id,
        x: this.x,
        y: this.y,
        description: this.getDescription(),
        gone: this.gone
      }
    })

    if (this.lastState !== state) {
      this.lastState = state
      return state
    }

    return undefined
  }

  key(): string {
    return `${this.x},${this.y}`
  }
}

export class MeleeWeapon extends Item {
  constructor(name: string, bonuses: Partial<MOBSkills>, public damageDie: Dice) {
    super('melee', name, bonuses)
  }
}

export class RangedWeapon extends Item {
  constructor(name: string, bonuses: Partial<MOBSkills>, public damageDie: Dice) {
    super('ranged', name, bonuses)
  }
}

export class MeleeSpell extends Item {
  constructor(name: string, bonuses: Partial<MOBSkills>, public damageDie: Dice) {
    super('melee-spell', name, bonuses)
  }
}

export class RangedSpell extends Item {
  constructor(name: string, bonuses: Partial<MOBSkills>, public damageDie: Dice) {
    super('ranged-spell', name, bonuses)
  }
}
