import { MOB } from '.'
import { MOBSkills } from '..'
import { Item, MajorItemType, MeleeSpell, MeleeWeapon, RangedSpell, RangedWeapon } from '../../item'

export function bestMeleeWeapon(this: MOB): MeleeWeapon {
  return this.meleeItem || this.defaultMeleeItem
}

export function bestRangedWeapon(this: MOB): RangedWeapon | undefined {
  return this.rangedItem
}

export function bestMeleeSpellWeapon(this: MOB): MeleeSpell | undefined {
  return this.meleeSpell
}

export function bestRangedSpellWeapon(this: MOB): RangedSpell | undefined {
  return this.rangedSpell
}

export function removeItem(this: MOB, type: MajorItemType): Item | undefined {
  let item: Item | undefined
  switch (type) {
    case 'amulet':
      item = this.amuletItem
      this.amuletItem = undefined
      break
    case 'armor':
      item = this.armorItem
      this.armorItem = undefined
      break
    case 'boots':
      item = this.bootsItem
      this.bootsItem = undefined
      break
    case 'head':
      item = this.headItem
      this.headItem = undefined
      break
    case 'melee':
      item = this.meleeItem
      this.meleeItem = undefined
      break
    case 'melee-spell':
      item = this.meleeSpell
      this.meleeSpell = undefined
      break
    case 'ranged':
      item = this.rangedItem
      this.rangedItem = undefined
      break
    case 'ranged-spell':
      item = this.rangedSpell
      this.rangedSpell = undefined
      break
    case 'ring':
      item = this.ringItem
      this.ringItem = undefined
      break
  }

  if (item) {
    this.addActivity({ level: 'neutral', message: `Dropped ${item.getDescription()}` })
    item.lastState = undefined
    item.gone = false
  }
  return item
}

export function useItem(this: MOB, item: Item): void {
  switch (item.type) {
    case 'amulet':
      this.amuletItem = item
      break
    case 'armor':
      this.armorItem = item
      break
    case 'boots':
      this.bootsItem = item
      break
    case 'head':
      this.headItem = item
      break
    case 'melee':
      this.meleeItem = item as MeleeWeapon
      break
    case 'melee-spell':
      this.meleeSpell = item as MeleeSpell
      break
    case 'ranged':
      this.rangedItem = item as RangedWeapon
      break
    case 'ranged-spell':
      this.rangedSpell = item as RangedSpell
      break
    case 'ring':
      this.ringItem = item
      break
  }

  item.lastState = undefined
  item.gone = true
  this.addActivity({ level: 'neutral', message: `Picked up ${item.getDescription()}` })
}

export function usingItems(this: MOB): Item[] {
  return [
    this.meleeItem,
    this.meleeSpell,
    this.rangedSpell,
    this.rangedItem,
    this.ringItem,
    this.amuletItem,
    this.headItem,
    this.armorItem,
    this.bootsItem
  ].filter((i) => i) as Item[]
}

export function getBonusFromItems(this: MOB, skill: keyof MOBSkills): number {
  return this.usingItems().reduce((prev, next) => {
    return prev + (next.bonuses[skill] || 0)
  }, 0)
}
