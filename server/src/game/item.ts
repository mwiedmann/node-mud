import { Dice } from './combat'
import { nextId } from './id'
import { MOBSkills } from './mob'

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
      getBonusesDescription(this.bonuses.meleeDefense, 'AC')
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

export class Weapon extends Item {
  constructor(type: MajorItemType, subType: string, name: string, bonuses: Partial<MOBSkills>, public damageDie: Dice) {
    super(type, subType, name, bonuses)
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
export class MeleeWeapon extends Weapon {
  constructor(subType: MeleeType, name: string, bonuses: Partial<MOBSkills>, damageDie: Dice) {
    super('melee', subType, name, bonuses, damageDie)
  }
  getSubTypeDescription(): string {
    return `(${this.subType} ${this.damageDie})`
  }
}
export const MeleeWeaponFactory = (type: MeleeType, name = ''): MeleeWeapon => {
  const weapons: Record<MeleeType, Dice> = {
    natural: 'd2',
    dagger: 'd2',
    staff: 'd2',
    shortsword: 'd4',
    spear: 'd4',
    axe: 'd6',
    mace: 'd6',
    broadsword: 'd6',
    longsword: 'd8',
    greatsword: 'd10',
    battleaxe: 'd10'
  }

  return new MeleeWeapon(type, name, {}, weapons[type])
}

export type RangedType = 'natural' | 'blowgun' | 'shortbow' | 'light-crossbow' | 'longbow' | 'heavy-crossbow'
export class RangedWeapon extends Weapon {
  constructor(subType: RangedType, name: string, bonuses: Partial<MOBSkills>, public range: number, damageDie: Dice) {
    super('ranged', subType, name, bonuses, damageDie)
  }
  getSubTypeDescription(): string {
    return `(${this.subType} ${this.damageDie})`
  }
}
export const RangedWeaponFactory = (type: RangedType, name = ''): RangedWeapon => {
  const weapon: Record<RangedType, [range: number, damageDie: Dice]> = {
    natural: [5, 'd2'],
    blowgun: [5, 'd2'],
    shortbow: [6, 'd4'],
    'light-crossbow': [7, 'd4'],
    longbow: [8, 'd6'],
    'heavy-crossbow': [10, 'd8']
  }

  const selectedWeapon = weapon[type]

  return new RangedWeapon(type, name, {}, selectedWeapon[0], selectedWeapon[1])
}

export class MeleeSpell extends Weapon {
  constructor(name: string, bonuses: Partial<MOBSkills>, damageDie: Dice) {
    super('melee-spell', '', name, bonuses, damageDie)
  }
}

export class RangedSpell extends Weapon {
  constructor(name: string, bonuses: Partial<MOBSkills>, public range: number, damageDie: Dice) {
    super('ranged-spell', '', name, bonuses, damageDie)
  }
}
