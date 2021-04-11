import { MOBActivityLogLevel } from 'dng-shared'

export const activityColors: Record<MOBActivityLogLevel, string> = {
  great: '#00FF00',
  good: '#00FF88',
  neutral: '#00DDFF',
  bad: '#FF6f00',
  terrible: '#FF0000'
}

export const activityLogColor = (level: MOBActivityLogLevel, flip?: boolean): string =>
  (level === 'great' && !flip) || (level === 'terrible' && flip)
    ? activityColors.great
    : (level === 'good' && !flip) || (level === 'bad' && flip)
    ? activityColors.good
    : level === 'neutral'
    ? activityColors.neutral
    : (level === 'bad' && !flip) || (level === 'good' && flip)
    ? activityColors.bad
    : (level === 'terrible' && !flip) || (level === 'great' && flip)
    ? activityColors.terrible
    : activityColors.neutral
