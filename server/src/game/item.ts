import { Dice } from './combat'
import { MOBSkills } from './players'

type ItemType = 'melee' | 'ranged' | 'ring' | 'amulet' | 'head' | 'armor' | 'boots' | 'ranged-spell' | 'melee-spell'

export class Item {
  constructor(public type: ItemType, public name: string, public bonuses: Partial<MOBSkills>) {}
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
