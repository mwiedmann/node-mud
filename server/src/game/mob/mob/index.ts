export * from './types'

import { MOBType } from '../monsterFactory'
import { Level } from '../../levels/level'
import { MeleeWeapon } from '../../item'
import { MOBActivityLog, MOBAttackActivityLog } from 'dng-shared'
import { MOB, MOBUpdateNotes } from '..'
import {
  bestMeleeSpellWeapon,
  bestMeleeWeapon,
  bestRangedSpellWeapon,
  bestRangedWeapon,
  getBonusFromItems,
  removeItem,
  useItem,
  usingItems
} from './items'
import {
  attackRoll,
  damageRoll,
  invisibleDamageBonus,
  invisibleHitBonus,
  meleeAttackRoll,
  meleeDamageRoll,
  meleeSpellAttackRoll,
  meleeSpellDamageRoll,
  rangedAttackRoll,
  rangedDamageRoll,
  rangedSpellAttackRoll,
  rangedSpellDamageRoll
} from './rolls'
import { gainActionPoints, heal, takeDamage } from './stats'
import { makeMeleeAttack, makeMeleeSpellAttack, makeRangedAttack, makeRangedSpellAttack } from './attacks'
import { haltEverything, moveDestinationInBounds, moveTowardsDestination, setDestination } from './move'

export function createMOB(type: MOBType, team: number, id: number, name?: string): MOB {
  return {
    type,
    team,
    id,
    name,
    x: 0,
    y: 0,
    destinationX: 0,
    destinationY: 0,
    specialAbilityX: 0,
    specialAbilityY: 0,
    specialAbilityLength: 10,
    specialAbilityActivate: false,
    invisible: false,
    meleeOn: true,
    rangedOn: true,
    spellOn: true,

    moveSearchLimit: 0, //abstract moveSearchLimit: number

    level: 1,
    dead: false,

    visibleRange: 5,
    maxHealth: 10,
    health: 10,
    maxAtionPoints: 100,
    actionPoints: 100,
    actionPointsGainedPerTick: 1,
    actionPointCostPerMove: 1,
    actionPointsCostPerMeleeAction: 15,
    actionPointsCostPerRangedAction: 25,
    actionPointsCostPerSpellAction: 25,

    mode: 'hunt',
    huntRange: 1,

    ticksPerMove: 3,
    ticksPerMeleeAction: 7,
    ticksPerRangedAction: 20,
    ticksPerSpellAction: 20,
    ticksPerSpecialAbility: 30,

    ticksPausedAfterMelee: 7,
    ticksPausedAfterRanged: 12,
    ticksPausedAfterSpell: 15,

    lastMoveTick: 0,
    lastMeleeActionTick: 0,
    lastRangedActionTick: 0,
    lastSpellActionTick: 0,
    lastSpecialAbilityTick: 0,

    lastState: '',
    lastStateTick: 0,

    tickPausedUntil: 0,

    moveGraph: [],

    defaultMeleeItem: new MeleeWeapon('natural', 'fists', {}, 'd2'),

    meleeHitBonus: 0,
    meleeDamageBonus: 0,
    rangedHitBonus: 0,
    rangedDamageBonus: 0,
    spellHitBonus: 0,
    spellDamageBonus: 0,

    meleeDefense: 10,
    rangedDefense: 10,
    magicDefense: 10,

    hitBonusWhenInvisible: 0,
    damageBonusWhenInvisible: 0,
    isUnholy: 0,

    activityLog: [],
    attackActivityLog: [],

    inventory: [],

    xp: 0,

    gainXP(points: number): void {},

    init(): void {
      this.health = this.maxHealth
      this.actionPoints = this.maxAtionPoints
    },

    addActivity(activity: MOBActivityLog): void {
      this.activityLog.push(activity)
    },

    addAttackActivity(activity: MOBAttackActivityLog): void {
      this.attackActivityLog.push(activity)
    },

    // Items (includes weapon management)
    removeItem,
    useItem,
    usingItems,
    getBonusFromItems,

    // Weapons
    bestMeleeWeapon,
    bestRangedWeapon,
    bestMeleeSpellWeapon,
    bestRangedSpellWeapon,

    // Combat bonuses
    invisibleHitBonus,
    invisibleDamageBonus,

    // Combat rolls - Attacks
    attackRoll,
    meleeAttackRoll,
    rangedAttackRoll,
    meleeSpellAttackRoll,
    rangedSpellAttackRoll,

    // Combat rolls - Damage
    damageRoll,
    meleeDamageRoll,
    rangedDamageRoll,
    meleeSpellDamageRoll,
    rangedSpellDamageRoll,

    // Attacking
    makeRangedAttack,
    makeRangedSpellAttack,
    makeMeleeAttack,
    makeMeleeSpellAttack,

    // Stat adjustments
    heal,
    gainActionPoints,
    takeDamage,

    // Movement
    moveDestinationInBounds,
    moveTowardsDestination,

    haltEverything,
    setDestination,

    // Special abilities
    specialAbilityAction(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void {},

    setSpecialAbility(tick: number, x?: number, y?: number): void {
      if (tick - this.lastSpecialAbilityTick >= this.ticksPerSpecialAbility) {
        this.specialAbilityX = x
        this.specialAbilityY = y
        this.specialAbilityActivate = true
      }
    },

    update(tick: number, level: Level<unknown>): MOBUpdateNotes {
      if (this.dead) {
        return { notes: ['dead'], moved: undefined }
      }

      const notes: MOBUpdateNotes = { notes: [], moved: undefined }

      this.actionPoints += this.actionPointsGainedPerTick

      if (this.actionPoints > this.maxAtionPoints) {
        this.actionPoints = this.maxAtionPoints
      }

      // Combat actions prevent the MOB from taking other actions and moving for a bit
      if (this.tickPausedUntil > tick) {
        // Special Abilities still work when player is paused
        this.specialAbilityAction(tick, level, notes)
        notes.notes.push('Actions paused')
        return notes
      }

      this.takeAction(tick, level, notes)
      this.moveTowardsDestination(tick, level, notes)

      return notes
    },

    takeAction(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void {
      // Check Special Abilities
      this.specialAbilityAction(tick, level, notes)

      // Check if a ranged attack is possible
      // TODO: REFACTOR - The ranged and melee attacks are the same with a few params/functions
      const selectedRangedItem = this.bestRangedWeapon()
      if (
        this.rangedOn &&
        selectedRangedItem &&
        tick - this.lastRangedActionTick >= this.ticksPerRangedAction &&
        this.actionPoints >= this.actionPointsCostPerRangedAction
      ) {
        const mobToAttack =
          this.type === 'player'
            ? level.monsterInRange(this.x, this.y, selectedRangedItem.range, 2, true)
            : level.playerInRange(this.x, this.y, selectedRangedItem.range, 2, true)

        if (mobToAttack) {
          this.makeRangedAttack(mobToAttack, tick, level, notes)
        }
      }

      // Check ranged spells
      const selectedRangedSpellItem = this.bestRangedSpellWeapon()
      if (
        this.spellOn &&
        selectedRangedSpellItem &&
        tick - this.lastSpellActionTick >= this.ticksPerSpellAction &&
        this.actionPoints >= this.actionPointsCostPerSpellAction
      ) {
        const mobToAttack =
          this.type === 'player'
            ? level.monsterInRange(this.x, this.y, selectedRangedSpellItem.range, 2, true)
            : level.playerInRange(this.x, this.y, selectedRangedSpellItem.range, 2, true)

        if (mobToAttack) {
          this.makeRangedSpellAttack(mobToAttack, tick, level, notes)
        }
      }

      // Check melee attack
      if (
        this.meleeOn &&
        this.bestMeleeWeapon() &&
        tick - this.lastMeleeActionTick >= this.ticksPerMeleeAction &&
        this.actionPoints >= this.actionPointsCostPerMeleeAction
      ) {
        const mobToAttack =
          this.type === 'player' ? level.monsterInRange(this.x, this.y, 1) : level.playerInRange(this.x, this.y, 1)

        if (mobToAttack) {
          this.makeMeleeAttack(mobToAttack, tick, level, notes)
        }
      }

      // Check melee spell attack
      if (
        this.spellOn &&
        this.bestMeleeSpellWeapon() &&
        tick - this.lastSpellActionTick >= this.ticksPerSpellAction &&
        this.actionPoints >= this.actionPointsCostPerSpellAction
      ) {
        const mobToAttack =
          this.type === 'player' ? level.monsterInRange(this.x, this.y, 1) : level.playerInRange(this.x, this.y, 1)

        if (mobToAttack) {
          this.makeMeleeSpellAttack(mobToAttack, tick, level, notes)
        }
      }
    },

    getState(tick: number, selfId: number, extraData: Record<string, unknown> = {}): string | undefined {
      const state = JSON.stringify({
        type: this.type === 'player' ? (selfId === this.id ? 'self' : 'player') : 'monster',
        data: {
          subType: this.type,
          id: this.id,
          x: this.x,
          y: this.y,
          apMax: this.maxAtionPoints,
          ap: this.actionPoints,
          hp: this.health,
          hpMax: this.maxHealth,
          dead: this.dead,
          activityLog: this.activityLog,
          attackActivityLog: this.attackActivityLog,
          visibleRange: this.visibleRange,
          invisible: this.invisible,
          ...extraData
        }
      })

      // Reset the log after the state is gathered
      this.activityLog = []
      this.attackActivityLog = []

      // Store the state if it changed
      if (this.lastState !== state) {
        this.lastState = state
        this.lastStateTick = tick
      }

      // If the state was changed this tick, send it, otherwise skip
      return this.lastStateTick === tick ? state : undefined
    }
  }
}
