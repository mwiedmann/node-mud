export * from './mob'
export * from './player'
export * from './monster'

export type MOBSkills = {
  level: number
  visibleRange: number
  maxHealth: number
  maxAtionPoints: number
  actionPointsGainedPerTick: number
  actionPointCostPerMove: number
  actionPointsCostPerMeleeAction: number
  actionPointsCostPerRangedAction: number
  actionPointsCostPerSpellAction: number

  ticksPerMove: number
  ticksPerMeleeAction: number
  ticksPerRangedAction: number
  ticksPerSpellAction: number
  ticksPerSpecialAbility: number

  ticksPausedAfterMelee: number
  ticksPausedAfterRanged: number
  ticksPausedAfterSpell: number

  meleeHitBonus: number
  meleeDamageBonus: number
  rangedHitBonus: number
  rangedDamageBonus: number
  spellHitBonus: number
  spellDamageBonus: number

  meleeDefense: number
  rangedDefense: number
  magicDefense: number

  hitBonusWhenInvisible: number
  damageBonusWhenInvisible: number
  isUnholy: number
}
