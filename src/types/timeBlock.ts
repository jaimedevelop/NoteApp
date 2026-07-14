export type RecurrenceType = 'weekly' | 'set_of_days' | 'monthly'

export interface RecurrenceRule {
  type: RecurrenceType
  /** Day-of-week indices 0–6 (Sun=0). Used by 'weekly'. */
  days?: number[]
  /** ISO date strings. Used by 'set_of_days'. */
  dates?: string[]
  /** 1–31. Used by 'monthly'. */
  dayOfMonth?: number
  /** Optional recurrence end date (ISO). */
  endDate?: string
}

export interface TimeBlock {
  id: string
  title: string
  startTime: string   // "HH:MM" 24-hour
  endTime: string     // "HH:MM" 24-hour
  color: string
  /** null = one-off block; check oneOffDate */
  recurrence: RecurrenceRule | null
  /** ISO date for one-off blocks */
  oneOffDate?: string
  /** ISO dates where a recurring block is skipped */
  exceptions: string[]
  createdAt: number
}

export interface CreateTimeBlockPayload {
  title: string
  startTime: string
  endTime: string
  color: string
  recurrence: RecurrenceRule | null
  oneOffDate?: string
}