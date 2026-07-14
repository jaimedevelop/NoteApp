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

/** Expands a BlockedDay (single or range) into every YYYY-MM-DD it covers. */
export const expandBlockedDays = (blocked: BlockedDay[]): Set<string> => {
    const set = new Set<string>()
    for (const b of blocked) {
        let cur = b.startDate
        while (cur <= b.endDate) {
            set.add(cur)
            // advance by one day
            const d = new Date(`${cur}T00:00:00`)
            d.setDate(d.getDate() + 1)
            cur = localDateString(d)
        }
    }
    return set
}