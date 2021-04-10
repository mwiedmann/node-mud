import { MOBType, xpForKill } from './monsterFactory'
import { Level } from '../levels/level'
import { rollDice, RollResult } from '../combat'
import { Moved } from '../map'
import { Item, MajorItemType, MeleeSpell, MeleeWeapon, RangedSpell, RangedWeapon, Weapon } from '../item'
import { MOBActivityLog, MOBAttackActivityLog } from 'dng-shared'
import { MOBSkills } from '.'

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

export abstract class MOB implements MOBSkills, MOBItems {
  constructor(public type: MOBType, public team: number, public id: number, public name?: string) {}
  x = 0
  y = 0
  destinationX = 0
  destinationY = 0
  specialAbilityX? = 0
  specialAbilityY? = 0
  specialAbilityLength = 10
  specialAbilityActivate = false
  invisible = false

  abstract moveSearchLimit: number

  level = 1
  dead = false
  rangedAttackOn = true

  visibleRange = 5
  maxHealth = 10
  health = 10
  maxAtionPoints = 100
  actionPoints = 100
  actionPointsGainedPerTick = 1
  actionPointCostPerMove = 1
  actionPointsCostPerMeleeAction = 15
  actionPointsCostPerRangedAction = 25
  actionPointsCostPerSpellAction = 25

  mode: 'hunt' | 'move' = 'hunt'
  huntRange = 1

  ticksPerMove = 3
  ticksPerMeleeAction = 7
  ticksPerRangedAction = 20
  ticksPerSpellAction = 20
  ticksPerSpecialAbility = 30

  ticksPausedAfterMelee = 7
  ticksPausedAfterRanged = 12
  ticksPausedAfterSpell = 15

  lastMoveTick = 0
  lastMeleeActionTick = 0
  lastRangedActionTick = 0
  lastSpellActionTick = 0
  lastSpecialAbilityTick = 0

  lastState = ''
  lastStateTick = 0

  tickPausedUntil = 0

  moveGraph: number[][] = []

  defaultMeleeItem = new MeleeWeapon('natural', 'fists', {}, 'd2')

  meleeHitBonus = 0
  meleeDamageBonus = 0
  rangedHitBonus = 0
  rangedDamageBonus = 0
  spellHitBonus = 0
  spellDamageBonus = 0

  meleeDefense = 10
  rangedDefense = 10
  magicDefense = 10

  hitBonusWhenInvisible = 0
  damageBonusWhenInvisible = 0
  isUnholy = 0

  activityLog: MOBActivityLog[] = []
  attackActivityLog: MOBAttackActivityLog[] = []

  meleeItem?: MeleeWeapon
  rangedItem?: RangedWeapon
  ringItem?: Item
  amuletItem?: Item
  headItem?: Item
  armorItem?: Item
  bootsItem?: Item
  meleeSpell?: MeleeSpell
  rangedSpell?: RangedSpell

  inventory: Item[] = []

  xp = 0

  gainXP(points: number): void {}

  removeItem(type: MajorItemType): Item | undefined {
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

  useItem(item: Item): void {
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

  usingItems(): Item[] {
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

  getBonusFromItems(skill: keyof MOBSkills): number {
    return this.usingItems().reduce((prev, next) => {
      return prev + (next.bonuses[skill] || 0)
    }, 0)
  }

  init(): void {
    this.health = this.maxHealth
    this.actionPoints = this.maxAtionPoints
  }

  addActivity(activity: MOBActivityLog): void {
    this.activityLog.push(activity)
  }

  addAttackActivity(activity: MOBAttackActivityLog): void {
    this.attackActivityLog.push(activity)
  }

  bestMeleeWeapon(): MeleeWeapon {
    return this.meleeItem || this.defaultMeleeItem
  }
  bestRangedWeapon(): RangedWeapon | undefined {
    return this.rangedItem
  }
  bestMeleeSpellWeapon(): MeleeSpell | undefined {
    return this.meleeSpell
  }
  bestRangedSpellWeapon(): RangedSpell | undefined {
    return this.rangedSpell
  }

  invisibleHitBonus(): number {
    return this.invisible ? this.hitBonusWhenInvisible : 0
  }

  invisibleDamageBonus(): number {
    return this.invisible ? this.damageBonusWhenInvisible : 0
  }

  attackRoll(bestWeapon: () => Weapon | undefined, hitBonus: keyof MOBSkills): RollResult {
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

  meleeAttackRoll(): RollResult {
    return this.attackRoll(this.bestMeleeWeapon.bind(this), 'meleeHitBonus')
  }
  rangedAttackRoll(): RollResult {
    return this.attackRoll(this.bestRangedWeapon.bind(this), 'rangedHitBonus')
  }
  meleeSpellAttackRoll(): RollResult {
    return this.attackRoll(this.bestMeleeSpellWeapon.bind(this), 'spellHitBonus')
  }
  rangedSpellAttackRoll(): RollResult {
    return this.attackRoll(this.bestRangedSpellWeapon.bind(this), 'spellHitBonus')
  }

  damageRoll(bestWeapon: () => Weapon | undefined, damageBonus: keyof MOBSkills): RollResult {
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

  meleeDamageRoll(): RollResult {
    return this.damageRoll(this.bestMeleeWeapon.bind(this), 'meleeDamageBonus')
  }
  rangedDamageRoll(): RollResult {
    return this.damageRoll(this.bestRangedWeapon.bind(this), 'rangedDamageBonus')
  }
  meleeSpellDamageRoll(): RollResult {
    return this.damageRoll(this.bestMeleeSpellWeapon.bind(this), 'spellDamageBonus')
  }
  rangedSpellDamageRoll(): RollResult {
    return this.damageRoll(this.bestRangedSpellWeapon.bind(this), 'spellDamageBonus')
  }

  heal(amount: number): void {
    this.health += amount
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth
    }

    this.addActivity({ level: 'good', message: `Healed ${amount}` })
  }

  gainActionPoints(amount: number): void {
    this.actionPoints += amount

    if (this.actionPoints > this.maxAtionPoints) {
      this.actionPoints = this.maxAtionPoints
    }

    this.addActivity({ level: 'good', message: `${amount} action points` })
  }

  takeDamage(roll: RollResult): void {
    this.health -= roll.total

    this.addActivity({ level: 'bad', message: `${roll.total} damage from ${roll.description}` })
    if (roll.stealthBonus) {
      this.addActivity({ level: 'bad', message: `${roll.stealthBonus} sneak attack damage` })
    }

    if (this.health <= 0) {
      this.addActivity({ level: 'terrible', message: 'DEAD' })
      this.dead = true
      console.log(this.name, 'is dead!!!')
    }
  }

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
  }

  moveDestinationInBounds(level: Level<unknown>): void {
    // Make sure the requested cell is in bounds
    if (this.destinationX >= level.wallsAndMobs[0].length) {
      this.destinationX = level.wallsAndMobs[0].length - 1
    }
    if (this.destinationX < 0) {
      this.destinationX = 0
    }
    if (this.destinationY >= level.wallsAndMobs.length) {
      this.destinationY = level.wallsAndMobs.length - 1
    }
    if (this.destinationY < 0) {
      this.destinationY = 0
    }
  }

  moveTowardsDestination(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void {
    const startX = this.x
    const startY = this.y

    this.moveDestinationInBounds(level)

    if (
      (this.destinationX !== this.x || this.destinationY !== this.y) &&
      tick - this.lastMoveTick >= this.ticksPerMove &&
      this.actionPoints >= this.actionPointCostPerMove
    ) {
      // See if we need to calculate the move graph
      if (this.moveGraph.length === 0) {
        notes.notes.push('Finding path')
        // Use the A* Algorithm to find a path
        this.moveGraph = level.findPath(
          { x: this.x, y: this.y },
          { x: this.destinationX, y: this.destinationY },
          this.moveSearchLimit
        )
      }

      const moveToX = this.moveGraph.length > 0 ? this.moveGraph[0][0] : this.x
      const moveToY = this.moveGraph.length > 0 ? this.moveGraph[0][1] : this.y

      // Only move if the location is open
      if (!level.locationIsBlocked(moveToX, moveToY)) {
        // Set the next x/y from the path
        this.x = moveToX
        this.y = moveToY

        if (this.type === 'player') {
          level.grabConsumable(this)
        }

        // Remove the move just made
        this.moveGraph.shift()

        this.actionPoints -= this.actionPointCostPerMove
        this.lastMoveTick = tick
      } else {
        // The next step in the path is blocked
        // Let's just clear it so it will be recalculated
        // Most likely another MOB moved in the way
        notes.notes.push(`location blocked ${moveToX} ${moveToY}`)
        this.moveGraph = []
        this.destinationX = this.x
        this.destinationY = this.y
      }
    }

    // Return if the MOB actually moved
    notes.moved =
      startX !== this.x || startY !== this.y ? { fromX: startX, fromY: startY, toX: this.x, toY: this.y } : undefined
  }

  haltEverything(): void {
    this.moveGraph = []
    this.destinationX = this.x
    this.destinationY = this.y
    this.specialAbilityX = undefined
    this.specialAbilityY = undefined
    this.specialAbilityActivate = false
  }

  abstract specialAbilityAction(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void

  makeRangedAttack(mobToAttack: MOB, tick: number, level: Level<unknown>, notes: MOBUpdateNotes, hasCost = true): void {
    const attackLogEntry: MOBAttackActivityLog = {
      type: 'ranged',
      fromX: this.x,
      fromY: this.y,
      toX: mobToAttack.x,
      toY: mobToAttack.y,
      hit: false,
      targetId: mobToAttack.id
    }

    const attackResult = this.rangedAttackRoll()

    if (attackResult.total >= mobToAttack.rangedDefense) {
      const dmgRoll = this.rangedDamageRoll()
      console.log(this.name, 'ranged hit', mobToAttack.name, 'roll:', attackResult.total, 'dmg:', dmgRoll.total)

      mobToAttack.takeDamage(dmgRoll)

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
    if (hasCost) {
      this.actionPoints -= this.actionPointsCostPerRangedAction
      this.lastRangedActionTick = tick
      this.tickPausedUntil = tick + this.ticksPausedAfterRanged
      this.invisible = false
    }
  }

  makeRangedSpellAttack(mobToAttack: MOB, tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void {
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

      mobToAttack.takeDamage(dmgRoll)

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

  makeMeleeAttack(mobToAttack: MOB, tick: number, level: Level<unknown>, notes: MOBUpdateNotes, hasCost = true): void {
    const attackResult = this.meleeAttackRoll()

    if (attackResult.total >= mobToAttack.meleeDefense) {
      const dmgRoll = this.meleeDamageRoll()
      console.log(this.name, 'melee hit', mobToAttack.name, 'roll:', attackResult.total, 'dmg:', dmgRoll.total)

      mobToAttack.takeDamage(dmgRoll)

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

  makeMeleeSpellAttack(
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

      mobToAttack.takeDamage(dmgRoll)

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

  takeAction(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void {
    // Check Special Abilities
    this.specialAbilityAction(tick, level, notes)

    // Check if a ranged attack is possible
    // TODO: REFACTOR - The ranged and melee attacks are the same with a few params/functions
    const selectedRangedItem = this.bestRangedWeapon()
    if (
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
  }

  setDestination(x: number, y: number): void {
    this.destinationX = x
    this.destinationY = y

    this.moveGraph = []
  }

  setSpecialAbility(tick: number, x?: number, y?: number): void {
    if (tick - this.lastSpecialAbilityTick >= this.ticksPerSpecialAbility) {
      this.specialAbilityX = x
      this.specialAbilityY = y
      this.specialAbilityActivate = true
    }
  }

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
