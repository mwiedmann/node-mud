import { MOBType, xpForKill } from './monsters'
import { Level } from './level'
import { Dice, rollDice, RollResult } from './combat'
import { Moved } from './map'
import { Item, MajorItemType, MeleeSpell, MeleeWeapon, RangedSpell, RangedWeapon, Weapon } from './item'
import { MOBActivityLog, MOBAttackActivityLog } from 'dng-shared'
import { PlayerProfession } from './characters/professions'
import { LevelProgression, MOBSkills, PlayerRace } from './characters'
import { inRange } from './util'

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

  ticksPausedAfterMelee = 5
  ticksPausedAfterRanged = 10
  ticksPausedAfterSpell = 10

  lastMoveTick = 0
  lastMeleeActionTick = 0
  lastRangedActionTick = 0
  lastSpellActionTick = 0
  lastSpecialAbilityTick = 0

  lastState = ''
  tickPausedUntil = 0

  moveGraph: number[][] = []

  defaultMeleeItem = new MeleeWeapon('natural', 'fists', {}, 'd2')

  meleeHitBonus = 0
  meleeDamageBonus = 0
  rangedHitBonus = 0
  rangedDamageBonus = 0
  spellHitBonus = 0
  spellDamageBonus = 0

  physicalDefense = 10
  magicDefense = 10

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

  attackRoll(bestWeapon: () => Weapon | undefined, hitBonus: keyof MOBSkills): RollResult {
    const weapon = bestWeapon()
    if (weapon) {
      return rollDice(weapon.getShortDescription(), 'd20', 1, this.getBonusFromItems(hitBonus) + this[hitBonus])
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
        this.getBonusFromItems(damageBonus) + this[damageBonus]
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
      notes.notes.push('Actions paused')
      return notes
    }

    this.takeAction(tick, level, notes)
    return this.moveTowardsDestination(tick, level, notes)
  }

  checkDestinationBounds(level: Level<unknown>): void {
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

  moveTowardsDestination(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): MOBUpdateNotes {
    const startX = this.x
    const startY = this.y

    this.checkDestinationBounds(level)

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

    return notes
  }

  abstract specialAbilityAction(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void

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
        const attackLogEntry: MOBAttackActivityLog = {
          type: 'ranged',
          fromX: this.x,
          fromY: this.y,
          toX: mobToAttack.x,
          toY: mobToAttack.y,
          hit: false
        }

        const attackResult = this.rangedAttackRoll()

        if (attackResult.total >= mobToAttack.physicalDefense) {
          const dmgRoll = this.rangedDamageRoll()
          console.log(this.name, 'ranged hit', mobToAttack.name, 'roll:', attackResult.total, 'dmg:', dmgRoll.total)

          mobToAttack.takeDamage(dmgRoll)

          attackLogEntry.hit = true
          if (mobToAttack.dead) {
            this.gainXP(xpForKill(mobToAttack))
            level.removeMonster(mobToAttack.x, mobToAttack.y)
          }
        } else {
          mobToAttack.addActivity({ level: 'good', message: 'Dodged attack' })
          console.log(this.name, 'missed', mobToAttack.name, 'roll:', attackResult.total)
        }

        this.addAttackActivity(attackLogEntry)
        this.actionPoints -= this.actionPointsCostPerRangedAction
        this.lastRangedActionTick = tick
        this.tickPausedUntil = tick + this.ticksPausedAfterRanged
        return
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
        const attackLogEntry: MOBAttackActivityLog = {
          type: 'spell',
          fromX: this.x,
          fromY: this.y,
          toX: mobToAttack.x,
          toY: mobToAttack.y,
          hit: false
        }

        const attackResult = this.rangedSpellAttackRoll()

        if (attackResult.total >= mobToAttack.magicDefense) {
          const dmgRoll = this.rangedSpellDamageRoll()
          console.log(this.name, 'spell hit', mobToAttack.name, 'roll:', attackResult.total, 'dmg:', dmgRoll.total)

          mobToAttack.takeDamage(dmgRoll)

          attackLogEntry.hit = true
          if (mobToAttack.dead) {
            this.gainXP(xpForKill(mobToAttack))
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
        return
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
        const attackResult = this.meleeAttackRoll()

        if (attackResult.total >= mobToAttack.physicalDefense) {
          const dmgRoll = this.meleeDamageRoll()
          console.log(this.name, 'melee hit', mobToAttack.name, 'roll:', attackResult.total, 'dmg:', dmgRoll.total)

          mobToAttack.takeDamage(dmgRoll)

          if (mobToAttack.dead) {
            this.gainXP(xpForKill(mobToAttack))
            level.removeMonster(mobToAttack.x, mobToAttack.y)
          }
        } else {
          mobToAttack.addActivity({ level: 'good', message: 'Dodged attack' })
          console.log(this.name, 'missed', mobToAttack.name, 'roll:', attackResult.total)
        }

        this.actionPoints -= this.actionPointsCostPerMeleeAction
        this.lastMeleeActionTick = tick
        this.tickPausedUntil = tick + this.ticksPausedAfterMelee
        return
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
        const attackResult = this.meleeSpellAttackRoll()

        if (attackResult.total >= mobToAttack.magicDefense) {
          const dmgRoll = this.meleeSpellDamageRoll()
          console.log(this.name, 'spell hit', mobToAttack.name, 'roll:', attackResult.total, 'dmg:', dmgRoll.total)

          mobToAttack.takeDamage(dmgRoll)

          if (mobToAttack.dead) {
            this.gainXP(xpForKill(mobToAttack))
            level.removeMonster(mobToAttack.x, mobToAttack.y)
          }
        } else {
          mobToAttack.addActivity({ level: 'good', message: 'Dodged spell' })
          console.log(this.name, 'missed', mobToAttack.name, 'roll:', attackResult.total)
        }

        this.actionPoints -= this.actionPointsCostPerSpellAction
        this.lastSpellActionTick = tick
        this.tickPausedUntil = tick + this.ticksPausedAfterSpell
        return
      }
    }
  }

  setDestination(x: number, y: number): void {
    this.destinationX = x
    this.destinationY = y

    this.moveGraph = []
  }

  setSpecialAbilityLocation(x: number, y: number): void {
    this.specialAbilityX = x
    this.specialAbilityY = y
  }

  getState(): string | undefined {
    const state = JSON.stringify({
      type: this.type === 'player' ? 'player' : 'monster',
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
        visibleRange: this.visibleRange
      }
    })

    // Reset the log after the state is gathered
    this.activityLog = []
    this.attackActivityLog = []

    if (this.lastState !== state) {
      this.lastState = state
      return state
    }

    return undefined
  }
}

export class Monster extends MOB {
  constructor(type: MOBType, team: number, id: number, name?: string) {
    super(type, team, id, name)

    this.huntRange = 9
  }
  moveRange = 5
  moveSearchLimit = 12
  playerRangeToActivate = 30

  specialAbilityAction(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void {
    // No specials for Monsters yet
  }

  update(tick: number, level: Level<unknown>): MOBUpdateNotes {
    if (this.dead) {
      return { notes: ['dead'], moved: undefined }
    }

    if (!level.playerInRange(this.x, this.y, this.playerRangeToActivate)) {
      return { notes: ['skipped'], moved: undefined }
    }

    return super.update(tick, level)
  }

  moveTowardsDestination(tick: number, level: Level<unknown>): MOBUpdateNotes {
    const notes: MOBUpdateNotes = { notes: [], moved: undefined }

    // If it's time to move, see if there are any close players
    if (tick - this.lastMoveTick >= this.ticksPerMove && this.actionPoints >= this.actionPointCostPerMove) {
      notes.notes.push('Looking for player')
      // Look for a close player
      const player = level.playerInRange(this.x, this.y, this.huntRange, undefined, true)

      if (player) {
        notes.notes.push('Found close player')
        this.setDestination(player.x, player.y)
      }
    }

    // If already at the desired spot, pick a new spot
    if (this.destinationX === this.x && this.destinationY === this.y) {
      notes.notes.push('At destination')

      // Check if the monster is tethered to a spot
      // This will force them to return to this spot when it walks out of range
      const nextLocation = level.getRandomLocation({ range: this.moveRange, x: this.x, y: this.y })

      // Need to prevent unreachable locations here because findPath will scan a large portion of the dungeon to get there
      // TODO: Can A* abort after a certain number of squares?
      this.setDestination(nextLocation.x, nextLocation.y)
      this.moveGraph = level.findPath(
        { x: this.x, y: this.y },
        { x: this.destinationX, y: this.destinationY },
        this.moveSearchLimit
      )

      // Check if not reachable
      if (this.moveGraph.length === 0) {
        notes.notes.push('Not reachable')
        this.setDestination(this.x, this.y)
      }
    }

    return super.moveTowardsDestination(tick, level, notes)
  }
}

export class Player<T> extends MOB {
  constructor(
    name: string,
    public race: PlayerRace,
    public profession: PlayerProfession,
    public professionProgression: LevelProgression[],
    public raceProgression: LevelProgression[],
    team: number,
    id: number,
    public connection: T
  ) {
    super('player', team, id, name)
    this.huntRange = 1
  }

  moveSearchLimit = 20
  lastTickReceivedState = 0

  levelsGained: { level: number; xp: number; gained?: boolean }[] = [
    { level: 1, xp: 0, gained: true },
    { level: 2, xp: 5 },
    { level: 3, xp: 10 },
    { level: 4, xp: 15 },
    { level: 5, xp: 20 },
    { level: 6, xp: 25 },
    { level: 7, xp: 30 },
    { level: 8, xp: 35 },
    { level: 9, xp: 40 },
    { level: 10, xp: 45 }
  ]

  gainXP(points: number): void {
    // Only players can gain XP (for now)
    this.xp += points

    this.levelsGained.forEach((l) => {
      if (!l.gained && this.xp >= l.xp) {
        l.gained = true
        this.addActivity({ level: 'great', message: `LEVEL UP!!!` })

        // Get and apply the upgrades for this level for the character's profession
        console.log('Profession Upgrades')
        const professionUpgrade = this.professionProgression.find((p) => p.level === l.level)
        this.applyLevelProgression(professionUpgrade?.upgrades)

        // Get and apply the upgrades for this level for the character's race
        console.log('Race Upgrades')
        const raceUpgrade = this.raceProgression.find((p) => p.level === l.level)
        this.applyLevelProgression(raceUpgrade?.upgrades)

        this.init()
      }
    })
  }

  applyLevelProgression(upgrades?: Partial<MOBSkills>): void {
    // If there are upgrades for the level, apply each one
    // Each upgrade is a number added to an existing MOBSkill
    if (upgrades) {
      Object.entries(upgrades).forEach(([key, value]) => {
        console.log('Upgrading', key, value)
        console.log('Before', this[key as keyof MOBSkills])
        this[key as keyof MOBSkills] += value as number
        console.log('After', this[key as keyof MOBSkills])
      })
    }
  }

  specialAbilityAction(tick: number, level: Level<unknown>, notes: MOBUpdateNotes): void {
    if (tick - this.lastSpecialAbilityTick >= this.ticksPerSpecialAbility) {
      // Check the wizard's teleport
      if (
        // this.profession === 'wizard' &&
        this.specialAbilityX &&
        this.specialAbilityY &&
        !level.locationIsBlocked(this.specialAbilityX, this.specialAbilityY) &&
        inRange(this.visibleRange, this.x, this.y, this.specialAbilityX, this.specialAbilityY)
      ) {
        console.log('Teleporting')
        // Simply teleport the wizard there.
        this.x = this.specialAbilityX
        this.y = this.specialAbilityY
        this.setDestination(this.x, this.y)
        this.lastSpecialAbilityTick = tick
        this.specialAbilityX = undefined
        this.specialAbilityY = undefined
        notes.notes.push('Wizard teleporting')
      }
    }
  }

  moveTowardsDestination(tick: number, level: Level<unknown>): MOBUpdateNotes {
    const notes: MOBUpdateNotes = { notes: [], moved: undefined }

    // if (
    //   this.mode === 'hunt' &&
    //   tick - this.lastMoveTick >= this.ticksPerMove &&
    //   this.actionPoints >= this.actionPointCostPerMove
    // ) {
    //   // If the player is hunting, look for close monsters
    //   const monster = level.monsterInRange(this.x, this.y, this.huntRange)

    //   if (monster) {
    //     this.setDestination(monster.x, monster.y)
    //   }
    // }

    return super.moveTowardsDestination(tick, level, notes)
  }
}
