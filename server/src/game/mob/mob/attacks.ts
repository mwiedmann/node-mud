import { MOBAttackActivityLog } from 'dng-shared'
import { MOB, MOBUpdateNotes } from '.'
import { Level } from '../../levels/level'
import { xpForKill } from '../monsterFactory'

export function makeRangedAttack(
  this: MOB,
  mobToAttack: MOB,
  tick: number,
  level: Level<unknown>,
  notes: MOBUpdateNotes,
  options: { hasCost?: boolean; fromX?: number; fromY?: number } = { hasCost: true }
): void {
  const attackLogEntry: MOBAttackActivityLog = {
    type: 'ranged',
    fromX: options.fromX || this.x,
    fromY: options.fromY || this.y,
    toX: mobToAttack.x,
    toY: mobToAttack.y,
    hit: false,
    targetId: mobToAttack.id
  }

  const attackResult = this.rangedAttackRoll()

  if (attackResult.total >= mobToAttack.rangedDefense) {
    const dmgRoll = this.rangedDamageRoll()
    console.log(this.name, 'ranged hit', mobToAttack.name, 'roll:', attackResult.total, 'dmg:', dmgRoll.total)

    mobToAttack.takeDamage(tick, dmgRoll)

    attackLogEntry.hit = true
    if (mobToAttack.dead) {
      this.gainXP(xpForKill(this.level, mobToAttack))
      level.removeMonster(mobToAttack.x, mobToAttack.y)
    }
  } else {
    mobToAttack.addActivity({ level: 'good', message: 'Dodged attack' })
    console.log(this.name, 'missed', mobToAttack.name, 'roll:', attackResult.total)
  }

  this.addAttackActivity(attackLogEntry)

  // Some special abilities make extra attacks at no cost
  if (options.hasCost) {
    this.actionPoints -= this.actionPointsCostPerRangedAction
    this.lastRangedActionTick = tick
    this.tickPausedUntil = tick + this.ticksPausedAfterRanged
    this.invisible = false
  }
}

export function makeRangedSpellAttack(
  this: MOB,
  mobToAttack: MOB,
  tick: number,
  level: Level<unknown>,
  notes: MOBUpdateNotes
): void {
  const attackLogEntry: MOBAttackActivityLog = {
    type: 'spell',
    fromX: this.x,
    fromY: this.y,
    toX: mobToAttack.x,
    toY: mobToAttack.y,
    hit: false,
    targetId: mobToAttack.id
  }

  const attackResult = this.rangedSpellAttackRoll()

  if (attackResult.total >= mobToAttack.magicDefense) {
    const dmgRoll = this.rangedSpellDamageRoll()
    console.log(this.name, 'spell hit', mobToAttack.name, 'roll:', attackResult.total, 'dmg:', dmgRoll.total)

    mobToAttack.takeDamage(tick, dmgRoll)

    attackLogEntry.hit = true
    if (mobToAttack.dead) {
      this.gainXP(xpForKill(this.level, mobToAttack))
      level.removeMonster(mobToAttack.x, mobToAttack.y)
    }
  } else {
    mobToAttack.addActivity({ level: 'good', message: 'Dodged spell' })
    console.log(this.name, 'missed', mobToAttack.name, 'roll:', attackResult.total)
  }

  this.addAttackActivity(attackLogEntry)
  this.actionPoints -= this.actionPointsCostPerSpellAction
  this.lastSpellActionTick = tick
  this.tickPausedUntil = tick + this.ticksPausedAfterSpell
  this.invisible = false
}

export function makeMeleeAttack(
  this: MOB,
  mobToAttack: MOB,
  tick: number,
  level: Level<unknown>,
  notes: MOBUpdateNotes,
  hasCost = true
): void {
  const attackResult = this.meleeAttackRoll()

  if (attackResult.total >= mobToAttack.meleeDefense) {
    const dmgRoll = this.meleeDamageRoll()
    console.log(this.name, 'melee hit', mobToAttack.name, 'roll:', attackResult.total, 'dmg:', dmgRoll.total)

    mobToAttack.takeDamage(tick, dmgRoll)

    if (mobToAttack.dead) {
      this.gainXP(xpForKill(this.level, mobToAttack))
      level.removeMonster(mobToAttack.x, mobToAttack.y)
    }
  } else {
    mobToAttack.addActivity({ level: 'good', message: 'Dodged attack' })
    console.log(this.name, 'missed', mobToAttack.name, 'roll:', attackResult.total)
  }

  // Some special abilities make extra attacks at no cost
  if (hasCost) {
    this.actionPoints -= this.actionPointsCostPerMeleeAction
    this.lastMeleeActionTick = tick
    this.tickPausedUntil = tick + this.ticksPausedAfterMelee
    this.invisible = false
  }
}

export function makeMeleeSpellAttack(
  this: MOB,
  mobToAttack: MOB,
  tick: number,
  level: Level<unknown>,
  notes: MOBUpdateNotes,
  hasCost = true
): void {
  const attackResult = this.meleeSpellAttackRoll()

  if (attackResult.total >= mobToAttack.magicDefense) {
    const dmgRoll = this.meleeSpellDamageRoll()
    console.log(this.name, 'spell hit', mobToAttack.name, 'roll:', attackResult.total, 'dmg:', dmgRoll.total)

    mobToAttack.takeDamage(tick, dmgRoll)

    if (mobToAttack.dead) {
      this.gainXP(xpForKill(this.level, mobToAttack))
      level.removeMonster(mobToAttack.x, mobToAttack.y)
    }
  } else {
    mobToAttack.addActivity({ level: 'good', message: 'Dodged spell' })
    console.log(this.name, 'missed', mobToAttack.name, 'roll:', attackResult.total)
  }

  // Some special abilities make extra attacks at no cost
  if (hasCost) {
    this.actionPoints -= this.actionPointsCostPerSpellAction
    this.lastSpellActionTick = tick
    this.tickPausedUntil = tick + this.ticksPausedAfterSpell
    this.invisible = false
  }
}
