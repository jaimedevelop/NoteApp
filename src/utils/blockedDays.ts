import { localDateString } from './date'
import type { BlockedDay } from '../types/project'

/**
 * Expands a BlockedDay (single day or range) into every YYYY-MM-DD it covers.
 * Single day:  startDate === endDate → one entry in the set.
 * Range:       startDate < endDate  → every date inclusive.
 */
export const expandBlockedDays = (blocked: BlockedDay[]): Set<string> => {
    const set = new Set<string>()
    for (const b of blocked) {
        let cur = b.startDate
        while (cur <= b.endDate) {
            set.add(cur)
            const d = new Date(`${cur}T00:00:00`)
            d.setDate(d.getDate() + 1)
            cur = localDateString(d)
        }
    }
    return set
}