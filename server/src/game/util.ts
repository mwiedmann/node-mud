export const distance = (x1: number, y1: number, x2: number, y2: number): number =>
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
