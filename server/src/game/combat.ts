export type Dice = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'

type RollResult = {
  total: number
  rollTotal: number
  bonus: number
  rolls: { type: Dice; roll: number }[]
}

const diceRange = (type: Dice) =>
  ({
    d4: { min: 1, max: 4 },
    d6: { min: 1, max: 6 },
    d8: { min: 1, max: 8 },
    d10: { min: 1, max: 10 },
    d12: { min: 1, max: 12 },
    d20: { min: 1, max: 20 }
  }[type])

export const rollDice = (type: Dice, count: number, bonus: number): RollResult => {
  const range = diceRange(type)
  const result: RollResult = {
    total: 0,
    rollTotal: 0,
    bonus,
    rolls: []
  }

  for (let i = 0; i < count; i++) {
    result.rolls.push({ type, roll: Math.ceil(Math.random() * range.max) })
  }

  const rollTotal = result.rolls.reduce((total, next) => total + next.roll, 0)
  result.total = rollTotal + bonus
  result.rollTotal = rollTotal

  return result
}
