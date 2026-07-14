import { fetchProjects, fetchAllMilestones, fetchBlockedDays } from '../firebase/projects'
import { fetchAllTasks } from '../firebase/database'
import { localDateString, shiftDate } from '../utils/date'
import type { Project, Milestone, BlockedDay, DayPressure } from '../types/project'
import type { Task } from '../types/task'
import { expandBlockedDays } from '../utils/blockedDays'

// ─── Runway Health ────────────────────────────────────────────────────────────

export interface RunwayHealth {
    project: Project
    totalTasks: number
    completedTasks: number
    completionPct: number   // 0–100
    timeElapsedPct: number   // 0–100 (how far into the project window we are)
    /** Positive = ahead of schedule, negative = behind */
    scheduleSlack: number
    daysRemaining: number
    isOverdue: boolean
    workingDaysLeft: number   // excludes blocked days
}

/**
 * Calculates schedule health for a single project.
 * Tasks are matched by checking if their category contains the project title
 * (loose coupling — no hard foreign key on Task yet).
 * When a projectId field is added to Task, swap the filter here.
 */
export const getRunwayHealth = (
    project: Project,
    tasks: Task[],
    blockedDays: BlockedDay[]
): RunwayHealth => {
    const today = localDateString()
    const blockedSet = expandBlockedDays(blockedDays)

    const topLevel = tasks.filter(t => t.parentId === null)
    const total = topLevel.length
    const completed = topLevel.filter(t => t.status === 'complete').length
    const completionPct = total === 0 ? 0 : Math.round((completed / total) * 100)

    const start = new Date(`${project.startDate}T00:00:00`)
    const deadline = new Date(`${project.deadline}T00:00:00`)
    const now = new Date(`${today}T00:00:00`)

    const totalDuration = Math.max(1, deadline.getTime() - start.getTime())
    const elapsed = Math.max(0, now.getTime() - start.getTime())
    const timeElapsedPct = Math.min(100, Math.round((elapsed / totalDuration) * 100))

    const scheduleSlack = completionPct - timeElapsedPct

    const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / 86_400_000)

    // Count working days between today and deadline (exclusive of blocked days)
    let workingDaysLeft = 0
    for (let i = 1; i <= Math.max(0, daysRemaining); i++) {
        const d = shiftDate(today, i)
        if (!blockedSet.has(d)) workingDaysLeft++
    }

    return {
        project,
        totalTasks: total,
        completedTasks: completed,
        completionPct,
        timeElapsedPct,
        scheduleSlack,
        daysRemaining,
        isOverdue: daysRemaining < 0 && project.status !== 'complete',
        workingDaysLeft,
    }
}

// ─── Backwards Planning ───────────────────────────────────────────────────────

export interface PlannedPhase {
    title: string
    startDate: string   // YYYY-MM-DD
    endDate: string   // YYYY-MM-DD
    daysAvail: number   // working days in this window
}

/**
 * Given a project deadline, a buffer (days to keep free before deadline),
 * an ordered list of phase names, and blocked days — returns suggested
 * date windows for each phase working backwards from the deadline.
 *
 * Phases are assumed equal-weight. Pass explicit weights (0–1, summing to 1)
 * as the optional `weights` array to allocate time unevenly.
 */
export const buildBackwardsplan = (
    deadline: string,
    bufferDays: number,
    phases: string[],
    blockedDays: BlockedDay[],
    weights?: number[]
): PlannedPhase[] => {
    if (phases.length === 0) return []

    const blockedSet = expandBlockedDays(blockedDays)
    const today = localDateString()

    // Collect all working days from today → deadline (exclusive of buffer)
    const bufferStart = shiftDate(deadline, -bufferDays)
    const workingDays: string[] = []
    let cursor = today
    while (cursor < bufferStart) {
        if (!blockedSet.has(cursor)) workingDays.push(cursor)
        cursor = shiftDate(cursor, 1)
    }

    const total = workingDays.length
    const w = weights ?? phases.map(() => 1 / phases.length)
    // Normalise weights just in case they don't sum to 1
    const wSum = w.reduce((a, b) => a + b, 0)
    const normW = w.map(x => x / wSum)

    const result: PlannedPhase[] = []
    let idx = 0
    for (let i = 0; i < phases.length; i++) {
        const allocated = i === phases.length - 1
            ? total - idx                              // give remainder to last phase
            : Math.round(normW[i] * total)
        const slice = workingDays.slice(idx, idx + allocated)
        if (slice.length === 0) break
        result.push({
            title: phases[i],
            startDate: slice[0],
            endDate: slice[slice.length - 1],
            daysAvail: slice.length,
        })
        idx += allocated
    }
    return result
}

// ─── Pressure Scores ──────────────────────────────────────────────────────────

const WINDOW_DAYS = 14   // how many days around a deadline/milestone create pressure

/**
 * Builds a pressure score map (date → DayPressure) for a full month grid.
 * Score contributions:
 *   +0.5  per project whose deadline falls within WINDOW_DAYS ahead of this date
 *   +0.35 per milestone falling within WINDOW_DAYS ahead of this date
 *   +0.15 per incomplete task with a dueDate on or before this date
 * Scores are clamped to [0, 1]. Blocked days are scored 0.
 */
export const buildPressureMap = (
    dates: string[],
    projects: Project[],
    milestones: Milestone[],
    tasks: Task[],
    blockedDays: BlockedDay[]
): Map<string, DayPressure> => {
    const blockedSet = expandBlockedDays(blockedDays)
    const map = new Map<string, DayPressure>()

    for (const date of dates) {
        if (blockedSet.has(date)) {
            map.set(date, { date, score: 0, isBlocked: true, nearDeadlines: [] })
            continue
        }

        let score = 0
        const nearDeadlines: string[] = []

        for (const p of projects) {
            if (p.status === 'archived' || p.status === 'complete') continue
            const daysUntil = Math.ceil(
                (new Date(`${p.deadline}T00:00:00`).getTime() - new Date(`${date}T00:00:00`).getTime())
                / 86_400_000
            )
            if (daysUntil >= 0 && daysUntil <= WINDOW_DAYS) {
                score += 0.5 * (1 - daysUntil / WINDOW_DAYS)
                nearDeadlines.push(p.title)
            }
        }

        for (const m of milestones) {
            if (m.status === 'reached') continue
            const daysUntil = Math.ceil(
                (new Date(`${m.date}T00:00:00`).getTime() - new Date(`${date}T00:00:00`).getTime())
                / 86_400_000
            )
            if (daysUntil >= 0 && daysUntil <= WINDOW_DAYS) {
                score += 0.35 * (1 - daysUntil / WINDOW_DAYS)
                nearDeadlines.push(m.title)
            }
        }

        const incompleteDue = tasks.filter(
            t => t.parentId === null && t.dueDate && t.dueDate <= date && t.status !== 'complete'
        )
        score += incompleteDue.length * 0.15

        map.set(date, {
            date,
            score: Math.min(1, score),
            isBlocked: false,
            nearDeadlines: [...new Set(nearDeadlines)],
        })
    }

    return map
}

// ─── Full Calendar Data Loader ────────────────────────────────────────────────

export interface CalendarProjectData {
    projects: Project[]
    milestones: Milestone[]
    blockedDays: BlockedDay[]
    pressureMap: Map<string, DayPressure>
}

export const loadCalendarProjectData = async (
    uid: string,
    dates: string[]
): Promise<CalendarProjectData> => {
    const [projects, milestones, blockedDays, tasks] = await Promise.all([
        fetchProjects(uid),
        fetchAllMilestones(uid),
        fetchBlockedDays(uid),
        fetchAllTasks(uid),
    ])

    const pressureMap = buildPressureMap(dates, projects, milestones, tasks, blockedDays)

    return { projects, milestones, blockedDays, pressureMap }
}