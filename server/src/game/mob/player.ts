import { LevelProgression } from '../characters'
import { MOB, MOBItems } from './mob'
import { PlayerProfession, PlayerRace, WeaponDetails } from 'dng-shared'
import { MOBSkills } from '.'

export abstract class Player<T> extends MOB {
  constructor(
    name: string,
    public race: PlayerRace,
    public profession: PlayerProfession,
    public startingProfessionSettings: Partial<MOBSkills> & Partial<MOBItems>,
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
  movedLevels = false
  kills = 0
  damageDone = 0
  gold = 0
  deadSent = false

  levelsGained: Record<number, { xp: number; gained?: boolean }> = {
    1: { xp: 0, gained: true },
    2: { xp: 20 }, // 20: 1
    3: { xp: 60 }, // 25: 1,2
    4: { xp: 120 }, // 30: 2
    5: { xp: 250 }, // 35: 2,3
    6: { xp: 450 }, // 40: 3
    7: { xp: 800 }, // 45: 3,4
    8: { xp: 1300 }, // 50: 4
    9: { xp: 2200 }, // 55: 4,5
    10: { xp: 4000 } // 75: 5
  }

  getState(tick: number, selfId: number): string | undefined {
    const nextLevel = this.levelsGained[this.level + 1] || this.levelsGained[10]
    const meleeWeapon = this.bestMeleeWeapon()
    const meleeSkills = meleeWeapon
      ? ({
          weapon: meleeWeapon.getDescription(),
          hitBonus: this.meleeHitBonus,
          dmgBonus: this.meleeDamageBonus
        } as WeaponDetails)
      : undefined
    const rangedWeapon = this.bestRangedWeapon()
    const rangedSkills = rangedWeapon
      ? ({
          weapon: rangedWeapon.getDescription(),
          hitBonus: this.rangedHitBonus,
          dmgBonus: this.rangedDamageBonus
        } as WeaponDetails)
      : undefined
    const rangedSpell = this.bestRangedSpellWeapon()
    const rangedSpellSkills = rangedSpell
      ? ({
          weapon: rangedSpell.getDescription(),
          hitBonus: this.spellHitBonus,
          dmgBonus: this.spellDamageBonus
        } as WeaponDetails)
      : undefined
    const meleeSpell = this.bestMeleeSpellWeapon()
    const meleeSpellSkills = meleeSpell
      ? ({
          weapon: meleeSpell.getDescription(),
          hitBonus: this.spellHitBonus,
          dmgBonus: this.spellDamageBonus
        } as WeaponDetails)
      : undefined

    return super.getState(tick, selfId, {
      race: this.race,
      profession: this.profession,
      xp: this.xp,
      xpNext: nextLevel.xp,
      meleeOn: this.meleeOn,
      rangedOn: this.rangedOn,
      spellOn: this.spellOn,
      meleeDefense: this.meleeDefense,
      rangedDefense: this.rangedDefense,
      magicDefense: this.magicDefense,
      level: this.level,
      special: tick - this.lastSpecialAbilityTick >= this.ticksPerSpecialAbility,
      meleeHitBonus: this.meleeHitBonus,
      meleeDamageBonus: this.meleeDamageBonus,
      meleeSkills,
      rangedSkills,
      rangedSpellSkills,
      meleeSpellSkills
    })
  }

  gainXP(points: number): void {
    // Only players can gain XP (for now)
    this.xp += points

    Object.entries(this.levelsGained).forEach(([levelNum, levelData]) => {
      if (!levelData.gained && this.xp >= levelData.xp) {
        levelData.gained = true
        if (parseInt(levelNum) > this.level) {
          this.level = parseInt(levelNum)
        }
        this.addActivity({ level: 'great', message: `LEVEL UP!!!` })

        // Get and apply the upgrades for this level for the character's profession
        console.log('Profession Upgrades')
        const professionUpgrade = this.professionProgression.find((p) => p.level === parseInt(levelNum))
        this.applyLevelProgression(professionUpgrade?.upgrades)

        // Get and apply the upgrades for this level for the character's race
        console.log('Race Upgrades')
        const raceUpgrade = this.raceProgression.find((p) => p.level === parseInt(levelNum))
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
}
