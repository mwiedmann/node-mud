import { MOB } from '.'
import { MOBSkills } from '..'
import { rollDice, RollResult } from '../../combat'
import { Weapon } from '../../item'

export function attackRoll(this: MOB, bestWeapon: () => Weapon | undefined, hitBonus: keyof MOBSkills): RollResult {
  const weapon = bestWeapon()
  if (weapon) {
    return rollDice(
      weapon.getShortDescription(),
      'd20',
      1,
      this.getBonusFromItems(hitBonus) + this[hitBonus],
      this.invisibleHitBonus()
    )
  }
  throw new Error(`attackRoll called without a weapon. Hitbonus ${hitBonus}`)
}

export function meleeAttackRoll(this: MOB): RollResult {
  return this.attackRoll(this.bestMeleeWeapon.bind(this), 'meleeHitBonus')
}

export function rangedAttackRoll(this: MOB): RollResult {
  return this.attackRoll(this.bestRangedWeapon.bind(this), 'rangedHitBonus')
}

export function meleeSpellAttackRoll(this: MOB): RollResult {
  return this.attackRoll(this.bestMeleeSpellWeapon.bind(this), 'spellHitBonus')
}

export function rangedSpellAttackRoll(this: MOB): RollResult {
  return this.attackRoll(this.bestRangedSpellWeapon.bind(this), 'spellHitBonus')
}

export function damageRoll(this: MOB, bestWeapon: () => Weapon | undefined, damageBonus: keyof MOBSkills): RollResult {
  const weapon = bestWeapon()
  if (weapon) {
    return rollDice(
      weapon.getShortDescription(),
      weapon.damageDie,
      1,
      this.getBonusFromItems(damageBonus) + this[damageBonus],
      this.invisibleDamageBonus()
    )
  }
  throw new Error(`damageRoll called without a weapon. Hitbonus ${damageBonus}`)
}

export function meleeDamageRoll(this: MOB): RollResult {
  return this.damageRoll(this.bestMeleeWeapon.bind(this), 'meleeDamageBonus')
}

export function rangedDamageRoll(this: MOB): RollResult {
  return this.damageRoll(this.bestRangedWeapon.bind(this), 'rangedDamageBonus')
}

export function meleeSpellDamageRoll(this: MOB): RollResult {
  return this.damageRoll(this.bestMeleeSpellWeapon.bind(this), 'spellDamageBonus')
}

export function rangedSpellDamageRoll(this: MOB): RollResult {
  return this.damageRoll(this.bestRangedSpellWeapon.bind(this), 'spellDamageBonus')
}

export function invisibleHitBonus(this: MOB): number {
  return this.invisible ? this.hitBonusWhenInvisible : 0
}

export function invisibleDamageBonus(this: MOB): number {
  return this.invisible ? this.damageBonusWhenInvisible : 0
}
