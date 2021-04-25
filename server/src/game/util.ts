export const inRange = (visibleRange: number, startX: number, startY: number, endX: number, endY: number): boolean =>
  Math.abs(endX - startX) <= visibleRange && Math.abs(endY - startY) <= visibleRange

export const randomRange = (min: number, max: number): number => {
  const sizeRange = max - min + 1

  return min + Math.floor(Math.random() * sizeRange)
}

export const randomPick = <T>(arr: T[]): T => {
  const index = randomRange(0, arr.length - 1)
  return arr[index]
}
