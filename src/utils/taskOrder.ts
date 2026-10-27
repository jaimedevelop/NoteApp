import type { Task, TaskTree, UpdateTaskPayload } from '../types/task'
import { deriveParentStatus } from '../services/taskService'

/** Dropping a subtask on a main task appends it; dropping on a subtask inserts beside it. */
export function reorderTasks(tasks: TaskTree[], sourceId: string, targetId: string, after: boolean) {
    if (sourceId === targetId) return null
    const sourceParent = tasks.find(t => t.children.some(c => c.id === sourceId))
    const targetParent = tasks.find(t => t.children.some(c => c.id === targetId))
    const source = sourceParent?.children.find(c => c.id === sourceId) ?? tasks.find(t => t.id === sourceId)
    const destination = sourceParent ? targetParent ?? tasks.find(t => t.id === targetId) : undefined
    if (!source || (!sourceParent && targetParent) || (sourceParent && !destination)) return null
    const affected = [source, sourceParent, destination, ...(sourceParent?.children ?? tasks), ...(destination?.children ?? [])]
    if (affected.some(t => t?.id.startsWith('temp_'))) return null

    const updates = new Map<string, UpdateTaskPayload>()
    function rank(items: Task[]) {
        return items.map((task, sortOrder) => {
            updates.set(task.id, { ...updates.get(task.id), sortOrder })
            return { ...task, sortOrder }
        })
    }
    if (!sourceParent) {
        const ordered = tasks.filter(t => t.id !== sourceId)
        const index = ordered.findIndex(t => t.id === targetId)
        if (index < 0) return null
        ordered.splice(index + (after ? 1 : 0), 0, source as TaskTree)
        return { tasks: rank(ordered) as TaskTree[], updates }
    }
    if (!destination) return null
    const ordered = destination.children.filter(t => t.id !== sourceId)
    const index = targetId === destination.id ? ordered.length : ordered.findIndex(t => t.id === targetId) + (after ? 1 : 0)
    const moved = { ...source, parentId: destination.id, category: destination.category, date: destination.date }
    ordered.splice(index, 0, moved)
    updates.set(source.id, { parentId: moved.parentId, category: moved.category, date: moved.date })
    const destinationChildren = rank(ordered)
    const next = tasks.map(parent => {
        if (parent.id !== sourceParent.id && parent.id !== destination.id) return parent
        const children = parent.id === destination.id ? destinationChildren : rank(parent.children.filter(t => t.id !== sourceId))
        const patch: UpdateTaskPayload = { childIds: children.map(c => c.id), status: deriveParentStatus(children) }
        if (parent.id === destination.id) patch.collapsed = false
        updates.set(parent.id, patch)
        return { ...parent, ...patch, children }
    })
    return { tasks: next, updates }
}
