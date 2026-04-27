/**
 * Returns the current local date as a YYYY-MM-DD string.
 * Uses local time — NOT UTC — so it never skips ahead at night.
 */
export const localDateString = (date: Date = new Date()): string => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

/**
 * Shifts a YYYY-MM-DD string by a given number of days.
 * Anchors to local midnight to avoid DST drift.
 */
export const shiftDate = (iso: string, days: number): string => {
    const d = new Date(`${iso}T00:00:00`)
    d.setDate(d.getDate() + days)
    return localDateString(d)
}