import {
    fetchAllTasks,
    fetchTasksByCategory,
    fetchTasksByDate,
    addTask as dbAddTask,
    updateTask as dbUpdateTask,
    deleteTask as dbDeleteTask,
} from '../firebase/database'
import type {
    Task,
    TaskTree,
    TaskStatus,
    CreateTaskPayload,
    UpdateTaskPayload,
} from '../types/task'

// ─── Tree Assembly ────────────────────────────────────────────────────────────

/**
 * Converts a flat array of Task documents (as stored in Firestore) into a
 * tree of TaskTree objects — top-level tasks with their children hydrated.
 * Subtasks are ordered by their parent's childIds array.
 */
export const buildTaskTree = (tasks: Task[]): TaskTree[] => {
    const byId = new Map(tasks.map(t => [t.id, t]))

    const topLevel = tasks.filter(t => t.parentId === null)

    return topLevel.map(parent => ({
        ...parent,
        children: (parent.childIds ?? [])
            .map(id => byId.get(id))
            .filter((t): t is Task => t !== undefined),
    }))
}

// ─── Status Derivation ────────────────────────────────────────────────────────

/**
 * Derives the correct status for a parent task based on its children's statuses.
 * - All complete            → complete
 * - All pending/incomplete  → pending (untouched) or incomplete
 * - Any mix                 → in_progress
 */
export const deriveParentStatus = (children: Task[]): TaskStatus => {
    if (children.length === 0) return 'pending'

    const statuses = children.map(c => c.status)
    const allComplete = statuses.every(s => s === 'complete')
    const noneStarted = statuses.every(s => s === 'pending' || s === 'incomplete')

    if (allComplete) return 'complete'
    if (noneStarted) return statuses.includes('incomplete') ? 'incomplete' : 'pending'
    return 'in_progress'
}

// ─── Read Operations ──────────────────────────────────────────────────────────

export const getAllTasks = (uid: string) =>
    fetchAllTasks(uid)

export const getTasksByCategory = (uid: string, category: string, date: string) =>
    fetchTasksByCategory(uid, category, date)

export const getTasksForDay = (uid: string, date: string) =>
    fetchTasksByDate(uid, date)

/** Returns all unique category names present across a user's tasks. */
export const getCategories = async (uid: string): Promise<string[]> => {
    const tasks = await fetchAllTasks(uid)
    const cats = [...new Set(tasks.map(t => t.category).filter(Boolean))]
    return cats.sort()
}

// ─── Write Operations ─────────────────────────────────────────────────────────

/**
 * Creates a new top-level task.
 * Returns the new task's Firestore ID.
 */
export const createTask = async (
    uid: string,
    payload: Omit<CreateTaskPayload, 'parentId' | 'childIds' | 'collapsed'>
): Promise<string> => {
    return dbAddTask(uid, {
        ...payload,
        parentId: null,
        childIds: [],
        collapsed: false,
    })
}

/**
 * Creates a subtask under an existing parent.
 * Appends the new subtask's ID to the parent's childIds array,
 * then re-derives and updates the parent's status.
 */
export const createSubTask = async (
    uid: string,
    parentId: string,
    payload: Omit<CreateTaskPayload, 'parentId' | 'childIds' | 'collapsed'>
): Promise<string> => {
    // 1. Create the subtask document
    const subtaskId = await dbAddTask(uid, {
        ...payload,
        parentId,
        childIds: [],
        collapsed: false,
    })

    // 2. Append to parent's childIds
    const allTasks = await fetchAllTasks(uid)
    const parent = allTasks.find(t => t.id === parentId)
    if (!parent) throw new Error(`Parent task ${parentId} not found`)

    const updatedChildIds = [...(parent.childIds ?? []), subtaskId]

    // 3. Derive new parent status
    const siblings = allTasks.filter(t => parent.childIds.includes(t.id))
    const newStatus = deriveParentStatus([...siblings, { status: payload.status } as Task])

    await dbUpdateTask(uid, parentId, {
        childIds: updatedChildIds,
        status: newStatus,
    })

    return subtaskId
}

/**
 * Updates a task's fields. If the task has a parent, re-derives and
 * propagates the parent's status after the update.
 */
export const updateTask = async (
    uid: string,
    taskId: string,
    updates: UpdateTaskPayload
): Promise<void> => {
    await dbUpdateTask(uid, taskId, updates)

    // Propagate status change up to parent if needed
    if ('status' in updates) {
        const allTasks = await fetchAllTasks(uid)
        const updated = allTasks.find(t => t.id === taskId)
        if (updated?.parentId) {
            const parent = allTasks.find(t => t.id === updated.parentId)
            if (parent) {
                const siblings = allTasks.filter(t => parent.childIds.includes(t.id))
                const newStatus = deriveParentStatus(siblings)
                await dbUpdateTask(uid, parent.id, { status: newStatus })
            }
        }
    }
}

/**
 * Toggles a task's collapsed state (UI-only, persisted to Firestore
 * so it survives page refreshes).
 */
export const toggleCollapsed = (
    uid: string,
    taskId: string,
    current: boolean
): Promise<void> => dbUpdateTask(uid, taskId, { collapsed: !current })

/**
 * Deletes a task and any of its subtasks recursively.
 * Also removes the task's ID from its parent's childIds if applicable.
 */
export const deleteTask = async (
    uid: string,
    taskId: string
): Promise<void> => {
    const allTasks = await fetchAllTasks(uid)
    const target = allTasks.find(t => t.id === taskId)
    if (!target) return

    // Delete all children recursively
    for (const childId of target.childIds ?? []) {
        await deleteTask(uid, childId)
    }

    // Remove from parent's childIds
    if (target.parentId) {
        const parent = allTasks.find(t => t.id === target.parentId)
        if (parent) {
            await dbUpdateTask(uid, parent.id, {
                childIds: parent.childIds.filter(id => id !== taskId),
            })
        }
    }

    await dbDeleteTask(uid, taskId)
}

// ─── Carry Forward ────────────────────────────────────────────────────────────

/**
 * Returns all incomplete/in_progress tasks from a given date
 * that should be surfaced as carry-forward suggestions.
 */
export const getCarryForwardCandidates = async (
    uid: string,
    fromDate: string
): Promise<Task[]> => {
    const tasks = await fetchTasksByDate(uid, fromDate)
    return tasks.filter(
        t =>
            t.parentId === null &&
            (t.status === 'incomplete' || t.status === 'in_progress')
    )
}

/**
 * Carries a task forward to a new date by updating its `date` field.
 * Creates a fresh task entry for the new date, preserving title/priority/category.
 */
export const carryTaskForward = async (
    uid: string,
    task: Task,
    toDate: string
): Promise<string> => {
    return createTask(uid, {
        title: task.title,
        status: 'pending',
        priority: task.priority,
        category: task.category,
        dueDate: task.dueDate,
        date: toDate,
    })
}