import { MOBActivityLog, MOBAttackActivityLog } from 'dng-shared'
import { RollResult } from '../../combat'
import { Item, MajorItemType, MeleeSpell, MeleeWeapon, RangedSpell, RangedWeapon, Weapon } from '../../item'
import { Level } from '../../levels/level'
import { Moved } from '../../map'
import { MOBType } from '../monsterFactory'

export type MOBUpdateNotes = { notes: string[]; moved: Moved | undefined }

export type MOBItems = {
  meleeItem?: MeleeWeapon
  rangedItem?: RangedWeapon
  ringItem?: Item
  amuletItem?: Item
  headItem?: Item
  armorItem?: Item
  bootsItem?: Item
  meleeSpell?: MeleeSpell
  rangedSpell?: RangedSpell
}

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

export type MOB = MOBSkills &
  MOBItems & {
    type: MOBType
    team: number
    id: number
    name?: string
    x: number
    y: number
    destinationX: number
    destinationY: number
    specialAbilityX: number | undefined
    specialAbilityY: number | undefined
    specialAbilityLength: number
    specialAbilityActivate: boolean
    invisible: boolean
    meleeOn: boolean
    rangedOn: boolean
    spellOn: boolean
    moveSearchLimit: number
    dead: boolean
    health: number
    actionPoints: number
    mode: 'hunt' | 'move'
    huntRange: number
    lastMoveTick: number
    lastMeleeActionTick: number
    lastRangedActionTick: number
    lastSpellActionTick: number
    lastSpecialAbilityTick: number
    lastState: string
    lastStateTick: number
    tickPausedUntil: number
    moveGraph: number[][]
    defaultMeleeItem: MeleeWeapon
    activityLog: MOBActivityLog[]
    attackActivityLog: MOBAttackActivityLog[]
    meleeItem?: MeleeWeapon
    rangedItem?: RangedWeapon
    ringItem?: Item
    amuletItem?: Item
    headItem?: Item
    armorItem?: Item
    bootsItem?: Item
    meleeSpell?: MeleeSpell
    rangedSpell?: RangedSpell
    inventory: Item[]
    xp: number
    gainXP(points: number): void
    init(): void
    addActivity(activity: MOBActivityLog): void
    addAttackActivity(activity: MOBAttackActivityLog): void
    removeItem(this: MOB, type: MajorItemType): Item | undefined
    useItem(this: MOB, item: Item): void
    usingItems(this: MOB): Item[]
    getBonusFromItems(this: MOB, skill: keyof MOBSkills): number
    bestMeleeWeapon(this: MOB): MeleeWeapon
    bestRangedWeapon(this: MOB): RangedWeapon | undefined
    bestMeleeSpellWeapon(this: MOB): MeleeSpell | undefined
    bestRangedSpellWeapon(this: MOB): RangedSpell | undefined
    makeRangedAttack(
      this: MOB,
      mobToAttack: MOB,
      tick: number,
      level: Level<unknown>,
      notes: MOBUpdateNotes,
      options?: { hasCost?: boolean; fromX?: number; fromY?: number }
    ): void
    makeRangedSpellAttack(this: MOB, mobToAttack: MOB, tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void
    makeMeleeAttack(
      this: MOB,
      mobToAttack: MOB,
      tick: number,
      level: Level<unknown>,
      notes: MOBUpdateNotes,
      hasCost?: boolean
    ): void
    makeMeleeSpellAttack(
      this: MOB,
      mobToAttack: MOB,
      tick: number,
      level: Level<unknown>,
      notes: MOBUpdateNotes,
      hasCost?: boolean
    ): void
    moveDestinationInBounds(this: MOB, level: Level<unknown>): void
    moveTowardsDestination(this: MOB, tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void
    setDestination(this: MOB, x: number, y: number): void
    haltEverything(this: MOB): void
    attackRoll(this: MOB, bestWeapon: () => Weapon | undefined, hitBonus: keyof MOBSkills): RollResult
    meleeAttackRoll(this: MOB): RollResult
    rangedAttackRoll(this: MOB): RollResult
    meleeSpellAttackRoll(this: MOB): RollResult
    rangedSpellAttackRoll(this: MOB): RollResult
    damageRoll(this: MOB, bestWeapon: () => Weapon | undefined, damageBonus: keyof MOBSkills): RollResult
    meleeDamageRoll(this: MOB): RollResult
    rangedDamageRoll(this: MOB): RollResult
    meleeSpellDamageRoll(this: MOB): RollResult
    rangedSpellDamageRoll(this: MOB): RollResult
    invisibleHitBonus(this: MOB): number
    invisibleDamageBonus(this: MOB): number
    heal(this: MOB, amount: number): void
    gainActionPoints(this: MOB, amount: number): void
    takeDamage(this: MOB, tick: number, roll: RollResult): void
    specialAbilityAction(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void
    setSpecialAbility(tick: number, x?: number, y?: number): void
    update(tick: number, level: Level<unknown>): MOBUpdateNotes
    takeAction(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void
    getState(tick: number, selfId: number, extraData?: Record<string, unknown>): string | undefined
  }
