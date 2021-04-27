import { MOB } from '.'
import { MeleeSpell, MeleeWeapon, RangedSpell, RangedWeapon } from '../../item'

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
