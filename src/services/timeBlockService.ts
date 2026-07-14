import type { TimeBlock } from '../types/timeBlock'

/**
 * Returns all TimeBlocks that apply to a given ISO date string,
 * respecting recurrence rules and exceptions.
 */
export function resolveBlocksForDate(
  blocks: TimeBlock[],
  isoDate: string,
): TimeBlock[] {
  return blocks
    .filter(b => appliesToDate(b, isoDate))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

/**
 * Returns a Map<isoDate, TimeBlock[]> for every date in the provided array.
 */
export function resolveBlocksForDates(
  blocks: TimeBlock[],
  dates: string[],
): Map<string, TimeBlock[]> {
  const map = new Map<string, TimeBlock[]>()
  for (const date of dates) {
    map.set(date, resolveBlocksForDate(blocks, date))
  }
  return map
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function appliesToDate(block: TimeBlock, isoDate: string): boolean {
  // Skip if this date is in the exceptions list
  if (block.exceptions.includes(isoDate)) return false

  const rule = block.recurrence

  // One-off block
  if (!rule) {
    return block.oneOffDate === isoDate
  }

  // Check recurrence end date
  if (rule.endDate && isoDate > rule.endDate) return false

  switch (rule.type) {
    case 'weekly': {
      if (!rule.days?.length) return false
      const dow = dayOfWeek(isoDate)
      return rule.days.includes(dow)
    }

    case 'set_of_days': {
      return rule.dates?.includes(isoDate) ?? false
    }

    case 'monthly': {
      if (!rule.dayOfMonth) return false
      const dom = parseInt(isoDate.split('-')[2], 10)
      return dom === rule.dayOfMonth
    }

    default:
      return false
  }
}

/** Returns 0 (Sun) – 6 (Sat) for a local ISO date string */
function dayOfWeek(isoDate: string): number {
  // Anchor to local midnight to avoid UTC offset flipping the day
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

/** Human-readable summary of a recurrence rule, used in the UI */
export function describeRecurrence(block: TimeBlock): string {
  if (!block.recurrence) {
    return block.oneOffDate ? `Once on ${block.oneOffDate}` : 'One-off'
  }

  const r = block.recurrence
  const end = r.endDate ? ` until ${r.endDate}` : ''

  switch (r.type) {
    case 'weekly': {
      const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const labels = (r.days ?? []).map(d => DAYS[d]).join(', ')
      return `Every ${labels}${end}`
    }
    case 'set_of_days':
      return `On ${(r.dates ?? []).length} specific dates${end}`
    case 'monthly':
      return `Monthly on the ${ordinal(r.dayOfMonth ?? 1)}${end}`
    default:
      return 'Recurring'
  }
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}