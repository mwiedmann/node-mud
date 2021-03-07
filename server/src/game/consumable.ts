import { idText } from 'typescript'
import { nextId } from './id'
import { MOB } from './mob'

export type ConsumableTypes = 'healing' | 'action'

export class Consumable {
  type: ConsumableTypes = 'healing'
  x = 0
  y = 0
  gone = false
  id = nextId()

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

  getState(currentTick: number, lastTickReceivedState: number): string | undefined {
    const state = JSON.stringify({
      type: 'consumable',
      data: {
        subType: this.type,
        id: this.id,
        x: this.x,
        y: this.y,
        health: this.health,
        actionPoints: this.actionPoints,
        gone: this.gone
      }
    })

    const sendState = currentTick - lastTickReceivedState > 1 || this.lastState !== state
    if (this.lastState !== state) {
      this.lastState = state
    }

    return sendState ? state : undefined
  }

  key(): string {
    return `${this.x},${this.y}`
  }
}
