import type { Task } from './task'

// ─── Calendar Types ──────────────────────────────────────────────────────────

/** A single day cell's data as used by the MonthGrid. */
export interface CalendarDay {
    date: string    // 'YYYY-MM-DD'
    isToday: boolean
    isCurrentMonth: boolean
    tasks: Task[]    // tasks whose dueDate falls on this day
}

/** The full month view: metadata + a flat array of CalendarDay cells. */
export interface MonthView {
    year: number
    month: number         // 0-indexed (Date convention)
    label: string         // e.g. "April 2026"
    days: CalendarDay[]  // always 35 or 42 cells (5 or 6 week rows)
}