import { MOB } from './mob'

export type ConsumableTypes = 'healing' | 'action'

export class Consumable {
  type: ConsumableTypes = 'healing'
  x = 0
  y = 0
  gone = false

  health?: number
  actionPoints?: number

  lastState?: string

  apply(player: MOB): void {
    if (this.health) {
      player.heal(this.health)
    }

    if (this.actionPoints) {
      player.gainActionPoints(this.actionPoints)
    }

    this.gone = true
  }

  getState(): string | undefined {
    const state = JSON.stringify({
      type: 'consumable',
      data: {
        subType: this.type,
        x: this.x,
        y: this.y,
        health: this.health,
        actionPoints: this.actionPoints,
        gone: this.gone
      }
    })

    if (this.lastState !== state) {
      this.lastState = state
      return state
    }

    return undefined
  }

  key(): string {
    return `${this.x},${this.y}`
  }
}
