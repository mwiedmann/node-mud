export const inRange = (visibleRange: number, startX: number, startY: number, endX: number, endY: number): boolean =>
  Math.abs(endX - startX) <= visibleRange && Math.abs(endY - startY) <= visibleRange
