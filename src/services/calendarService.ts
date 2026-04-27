import { fetchAllTasks } from '../firebase/database'
import type { Task } from '../types/task'
import type { CalendarDay, MonthView } from '../types/calendar'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISODate = (d: Date): string => d.toISOString().split('T')[0]

const todayISO = (): string => toISODate(new Date())

// ─── Month View Builder ───────────────────────────────────────────────────────

/**
 * Builds a full MonthView for a given year and month (0-indexed).
 * Fetches all tasks with a dueDate and maps them onto the correct day cells.
 * The grid always starts on Sunday and fills 35 or 42 cells.
 */
export const buildMonthView = async (
    uid: string,
    year: number,
    month: number
): Promise<MonthView> => {
    // Fetch tasks that have a due date
    const allTasks: Task[] = await fetchAllTasks(uid)
    const tasksWithDue = allTasks.filter(t => t.dueDate !== null)

    // Index tasks by due date for O(1) lookup
    const tasksByDate = new Map<string, Task[]>()
    for (const task of tasksWithDue) {
        if (!task.dueDate) continue
        const bucket = tasksByDate.get(task.dueDate) ?? []
        bucket.push(task)
        tasksByDate.set(task.dueDate, bucket)
    }

    // Build the grid
    const firstOfMonth = new Date(year, month, 1)
    const startDay = firstOfMonth.getDay()          // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = todayISO()

    // Pad backward to the preceding Sunday
    const gridStart = new Date(firstOfMonth)
    gridStart.setDate(1 - startDay)

    // Determine grid size: 35 or 42 cells
    const totalCells = startDay + daysInMonth > 35 ? 42 : 35
    const days: CalendarDay[] = []

    for (let i = 0; i < totalCells; i++) {
        const cellDate = new Date(gridStart)
        cellDate.setDate(gridStart.getDate() + i)

        const iso = toISODate(cellDate)
        days.push({
            date: iso,
            isToday: iso === today,
            isCurrentMonth: cellDate.getMonth() === month,
            tasks: tasksByDate.get(iso) ?? [],
        })
    }

    const label = firstOfMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    })

    return { year, month, label, days }
}

// ─── Deadline Lookups ─────────────────────────────────────────────────────────

/**
 * Returns top-level tasks whose dueDate is today or earlier and are
 * not yet complete — used by the DeadlineAlert component.
 */
export const getOverdueTasks = async (uid: string): Promise<Task[]> => {
    const today = todayISO()
    const allTasks = await fetchAllTasks(uid)

    return allTasks.filter(
        t =>
            t.parentId === null &&
            t.dueDate !== null &&
            t.dueDate <= today &&
            t.status !== 'complete'
    )
}

/**
 * Returns tasks due on a specific date string ('YYYY-MM-DD').
 * Used by the DayDetailPanel in the Calendar page.
 */
export const getTasksDueOn = async (
    uid: string,
    date: string
): Promise<Task[]> => {
    const allTasks = await fetchAllTasks(uid)
    return allTasks.filter(t => t.dueDate === date)
}