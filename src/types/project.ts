import type { Timestamp } from 'firebase/firestore'

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ProjectStatus = 'active' | 'complete' | 'paused' | 'archived'

export type MilestoneStatus = 'pending' | 'reached' | 'missed'

// ─── Core Interfaces ──────────────────────────────────────────────────────────

export interface Project {
    id: string
    title: string
    description: string
    status: ProjectStatus
    color: string          // hex — used for runway pill + heat tint
    startDate: string          // YYYY-MM-DD
    deadline: string          // YYYY-MM-DD
    createdAt: Timestamp | null
}

export interface Milestone {
    id: string
    projectId: string
    title: string
    date: string          // YYYY-MM-DD — the target date
    status: MilestoneStatus
    description: string
    createdAt: Timestamp | null
}

/**
 * A day OR range the user has explicitly blocked out (vacation, unavailable, etc.).
 * - Single day:  startDate === endDate
 * - Range:       startDate < endDate
 * Blocked days are excluded from backwards-planning pressure calculations.
 */
export interface BlockedDay {
    id: string
    startDate: string   // YYYY-MM-DD  (replaces `date`)
    endDate: string   // YYYY-MM-DD  (same as startDate for single days)
    label: string   // e.g. "Vacation", "Holiday"
    date: string;   // ← add this

}
// ─── Derived / UI Types ───────────────────────────────────────────────────────

/** A project with its milestones hydrated — used in panels and planning views. */
export interface ProjectWithMilestones extends Project {
    milestones: Milestone[]
}

/**
 * Per-day pressure score (0–1) derived from:
 *   - Number of project deadlines / milestones converging near this day
 *   - Proportion of incomplete tasks due on or before this day
 *   - Whether the day is blocked out (score forced to 0)
 */
export interface DayPressure {
    date: string
    score: number   // 0 = clear, 1 = maximum pressure
    isBlocked: boolean
    nearDeadlines: string[]   // project/milestone titles contributing to score
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export type CreateProjectPayload = Omit<Project, 'id' | 'createdAt'>
export type UpdateProjectPayload = Partial<Omit<Project, 'id' | 'createdAt'>>
export type CreateMilestonePayload = Omit<Milestone, 'id' | 'createdAt'>
export type UpdateMilestonePayload = Partial<Omit<Milestone, 'id' | 'createdAt'>>