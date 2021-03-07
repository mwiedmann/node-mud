import { Dice } from './combat'
import { nextId } from './id'
import { MOBSkills } from './players'

export type MajorItemType =
  | 'melee'
  | 'ranged'
  | 'ring'
  | 'amulet'
  | 'head'
  | 'armor'
  | 'boots'
  | 'ranged-spell'
  | 'melee-spell'

const getBonusesDescription = (amount: number | undefined, description: string) =>
  amount && amount !== 0 ? `${amount > 0 ? '+' : '-'}${amount} ${description}` : undefined

export class Item {
  constructor(
    public type: MajorItemType,
    public subType: string,
    public name: string,
    public bonuses: Partial<MOBSkills>
  ) {}

  id = nextId()
  x = 0
  y = 0
  lastState?: string
  gone?: boolean

  getSubTypeDescription(): string {
    return this.subType
  }

  getShortDescription(): string {
    return this.name || this.subType
  }

  getDescription(): string {
    return [
      this.name,
      this.getSubTypeDescription(),
      getBonusesDescription(this.bonuses.meleeHitBonus, 'hit'),
      getBonusesDescription(this.bonuses.meleeDamageBonus, 'dmg'),
      getBonusesDescription(this.bonuses.physicalDefense, 'AC')
    ]
      .filter((d) => d)
      .join(' ')
  }

  getState(currentTick: number, lastTickReceivedState: number): string | undefined {
    const state = JSON.stringify({
      type: 'item',
      data: {
        majorType: this.type,
        subType: this.subType,
        id: this.id,
        x: this.x,
        y: this.y,
        description: this.getDescription(),
        gone: this.gone
      }
    })

    const sendState = currentTick - lastTickReceivedState > 1 || this.lastState !== state
    if (this.lastState !== state) {
      this.lastState = state
    }

    return sendState ? state : undefined
  }

  key(): string {
    return `${this.x},${this.y}`
  }
}

export type MeleeType =
  | 'natural'
  | 'dagger'
  | 'staff'
  | 'shortsword'
  | 'broadsword'
  | 'longsword'
  | 'greatsword'
  | 'axe'
  | 'battleaxe'
  | 'mace'
  | 'spear'
export class MeleeWeapon extends Item {
  constructor(subType: MeleeType, name: string, bonuses: Partial<MOBSkills>, public damageDie: Dice) {
    super('melee', subType, name, bonuses)
  }
  getSubTypeDescription(): string {
    return `(${this.subType} ${this.damageDie})`
  }
}
export const MeleeWeaponFactory = (type: MeleeType, name = ''): MeleeWeapon => {
  const weapons: Record<MeleeType, Dice> = {
    natural: 'd4',
    dagger: 'd4',
    staff: 'd4',
    shortsword: 'd6',
    broadsword: 'd8',
    longsword: 'd10',
    greatsword: 'd12',
    axe: 'd6',
    battleaxe: 'd12',
    mace: 'd8',
    spear: 'd6'
  }

  return new MeleeWeapon(type, name, {}, weapons[type])
}

export type RangedType = 'shortbow' | 'longbow' | 'crossbow'
export class RangedWeapon extends Item {
  constructor(subType: RangedType, name: string, bonuses: Partial<MOBSkills>, public damageDie: Dice) {
    super('ranged', subType, name, bonuses)
  }
}

export class MeleeSpell extends Item {
  constructor(name: string, bonuses: Partial<MOBSkills>, public damageDie: Dice) {
    super('melee-spell', '', name, bonuses)
  }
}

export class RangedSpell extends Item {
  constructor(name: string, bonuses: Partial<MOBSkills>, public damageDie: Dice) {
    super('ranged-spell', '', name, bonuses)
  }
}
