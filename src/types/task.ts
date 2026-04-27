import type { Timestamp } from 'firebase/firestore'

// ─── Enums ───────────────────────────────────────────────────────────────────

export type TaskStatus =
    | 'incomplete'   // not yet started — brick/rust red
    | 'in_progress'  // at least one subtask done — amber
    | 'complete'     // fully done — forest green
    | 'pending'      // created but not yet touched (default) — no highlight

export type TaskPriority = 'high' | 'medium' | 'low'

// ─── Core Task Interface ──────────────────────────────────────────────────────

export interface Task {
    id: string           // Firestore document ID
    title: string           // Task display text

    status: TaskStatus
    priority: TaskPriority

    category: string           // User-defined label, e.g. "Schoolwork"

    // Subtask linkage — flat Firestore structure, assembled into tree in service layer
    parentId: string | null    // null = top-level task
    childIds: string[]         // ordered list of subtask IDs

    // Scheduling
    dueDate: string | null    // ISO date string: 'YYYY-MM-DD', null if no deadline
    date: string           // The day this task was created / belongs to ('YYYY-MM-DD')

    // Flags
    collapsed: boolean          // UI state — hide subtasks in TaskList

    createdAt: Timestamp | null // Firestore server timestamp; null before first write
}

// ─── Derived / UI Types ──────────────────────────────────────────────────────

/** A top-level task with its subtasks hydrated inline — used in the UI layer. */
export interface TaskTree extends Task {
    children: Task[]
}

/** Payload for creating a new task — omits server-managed fields. */
export type CreateTaskPayload = Omit<Task, 'id' | 'createdAt'>

/** Payload for updating an existing task. */
export type UpdateTaskPayload = Partial<Omit<Task, 'id' | 'createdAt'>>