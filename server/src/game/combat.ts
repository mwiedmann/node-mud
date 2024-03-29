export type Dice = 'd2' | 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'

export type RollResult = {
  description: string
  total: number
  rollTotal: number
  bonus: number
  stealthBonus: number
  rolls: { type: Dice; roll: number }[]
}

const diceRange = (type: Dice) =>
  ({
    d2: { min: 1, max: 2 },
    d4: { min: 1, max: 4 },
    d6: { min: 1, max: 6 },
    d8: { min: 1, max: 8 },
    d10: { min: 1, max: 10 },
    d12: { min: 1, max: 12 },
    d20: { min: 1, max: 20 }
  }[type])

export const rollDice = (
  description: string,
  type: Dice,
  count: number,
  bonus: number,
  stealthBonus: number
): RollResult => {
  const range = diceRange(type)
  const result: RollResult = {
    description,
    total: 0,
    rollTotal: 0,
    bonus,
    stealthBonus,
    rolls: []
  }

  for (let i = 0; i < count; i++) {
    result.rolls.push({ type, roll: Math.ceil(Math.random() * range.max) })
  }

  const rollTotal = result.rolls.reduce((total, next) => total + next.roll, 0)
  result.total = rollTotal + bonus + stealthBonus
  result.rollTotal = rollTotal

  return result
}
