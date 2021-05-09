import { MOB } from '.'
import { RollResult } from '../../combat'

export function heal(this: MOB, amount: number): void {
  this.health += amount
  if (this.health > this.maxHealth) {
    this.health = this.maxHealth
  }

  this.addActivity({ level: 'good', message: `Healed ${amount}` })
}

export function gainActionPoints(this: MOB, amount: number): void {
  this.actionPoints += amount

  if (this.actionPoints > this.maxAtionPoints) {
    this.actionPoints = this.maxAtionPoints
  }

  this.addActivity({ level: 'good', message: `${amount} action points` })
}

export function takeDamage(this: MOB, tick: number, roll: RollResult): void {
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
