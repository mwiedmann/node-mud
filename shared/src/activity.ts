export type ActivityLogLevel = 'great' | 'good' | 'neutral' | 'bad' | 'terrible'

export type ActivityLog = {
  level: ActivityLogLevel
  message: string
}
