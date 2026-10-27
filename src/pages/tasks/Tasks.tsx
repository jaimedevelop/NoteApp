import React, { useEffect, useState, useCallback, useRef } from 'react'
import styled from 'styled-components'
import NavBar from '../../components/NavBar'
import PageColumn from '../../components/PageColumn'
import RuleDivider from '../../components/RuleDivider'
import SectionHeader from '../../components/SectionHeader'
import CategoryTabs from './CategoryTabs'
import TaskList from './TaskList'
import DayView from './DayView'
import TaskComposer from './TaskComposer'
import SaveIndicator, { type SyncStatus } from './SaveIndicator'
import DateNavigator from '../summary/DateNavigator'
import {
    buildTaskTree,
    deriveParentStatus,
    updateTask,
    deleteTask,
    createTask,
    createSubTask,
} from '../../services/taskService'
import {
    fetchCategoriesForDate,
    saveCategoriesForDate,
    deleteTasksByCategory,
    fetchTasksByCategory,
    addTask as dbAddTask,
} from '../../firebase/database'
import { db } from '../../firebase/database'
import { currentUser } from '../../firebase/auth'
import type { Task, TaskTree, UpdateTaskPayload, CreateTaskPayload } from '../../types/task'
import { writeBatch, doc, collection } from 'firebase/firestore'
import { localDateString } from '../../utils/date'
import { WriteQueue } from '../../utils/writeQueue'
import { reorderTasks } from '../../utils/taskOrder'

// ─── Priority sort ────────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 }

const compareOrder = (a: Task, b: Task) =>
    (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER)
    || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]

const sortByPriority = (trees: TaskTree[]): TaskTree[] =>
    [...trees].sort((a, b) => compareOrder(a, b))

const sortChildren = (tree: TaskTree): TaskTree => ({
    ...tree,
    children: [...tree.children].sort((a, b) => compareOrder(a, b)),
})

const sortAll = (trees: TaskTree[]): TaskTree[] =>
    sortByPriority(trees.map(sortChildren))

// ─── Styled ───────────────────────────────────────────────────────────────────

const ViewSwitch = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  button {
    font: inherit;
    color: ${({ theme }) => theme.colors.inkSecondary};
    background: transparent;
    border: 1px solid ${({ theme }) => theme.colors.ruleLight};
    padding: 6px 20px;
    cursor: pointer;
  }
  button[aria-pressed="true"] {
    background: ${({ theme }) => theme.colors.surfaceAlt};
    border-color: ${({ theme }) => theme.colors.ruleHeavy};
    color: ${({ theme }) => theme.colors.inkPrimary};
  }
`

const EmptyLedger = styled.div`
  text-align:  center;
  padding:     ${({ theme }) => theme.spacing.xl} 0;
  color:       ${({ theme }) => theme.colors.inkMuted};
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style:  italic;
  font-size:   ${({ theme }) => theme.fontSizes.body};
  line-height: 1.7;
`

const ErrorNotice = styled(EmptyLedger)`
  color: ${({ theme }) => theme.colors.statusIncomplete};
`

const IndicatorRow = styled.div`
  display:         flex;
  justify-content: flex-end;
  min-height:      20px;
  margin-bottom:   ${({ theme }) => theme.spacing.xs};
`

// ─── Component ────────────────────────────────────────────────────────────────

const Tasks: React.FC = () => {
    const uid = currentUser()?.uid ?? ''

    // ── Date state ───────────────────────────────────────────────────────────
    const [date, setDate] = useState(localDateString())
    const [view, setView] = useState<'list' | 'day'>('list')
    const [dayVisited, setDayVisited] = useState(false)

    // ── Per-date category + task cache ───────────────────────────────────────
    const cache = useRef<Record<string, {
        categories: string[]
        tasksByCategory: Record<string, TaskTree[]>
    }>>({})

    const [categories, setCategories] = useState<string[]>([])
    const [activeCategory, setActiveCategory] = useState<string>('')
    const [tasks, setTasks] = useState<TaskTree[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')

    // ── Today's categories (for the copy-to-today picker) ────────────────────
    // Kept separately so it's always reflecting today regardless of viewed date.
    const [todayCategories, setTodayCategories] = useState<string[]>([])

    const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const markSaved = () => {
        setSyncStatus('saved')
        if (savedTimer.current) clearTimeout(savedTimer.current)
        savedTimer.current = setTimeout(() => setSyncStatus('idle'), 2000)
    }

    // ── Ensure today's categories are loaded (used by copy-to-today) ─────────
    const ensureTodayCategories = useCallback(async (): Promise<string[]> => {
        const today = localDateString()
        const cached = cache.current[today]
        if (cached) {
            setTodayCategories(cached.categories)
            return cached.categories
        }
        const cats = await fetchCategoriesForDate(uid, today)
        setTodayCategories(cats)
        return cats
    }, [uid])

    // Load today's categories on mount so the picker is pre-populated
    useEffect(() => {
        if (uid) ensureTodayCategories()
    }, [uid, ensureTodayCategories])

    // If the user navigates to today, keep todayCategories in sync with `categories`
    useEffect(() => {
        if (date === localDateString()) {
            setTodayCategories(categories)
        }
    }, [date, categories])

    // ── Load categories + all their tasks for a given date ───────────────────
    const loadDate = useCallback(async (d: string) => {
        if (!uid) return
        setLoading(true)
        setError(null)
        try {
            const cats = await fetchCategoriesForDate(uid, d)
            const taskArrays = await Promise.all(
                cats.map(cat => fetchTasksByCategory(uid, cat, d))
            )
            const tasksByCategory: Record<string, TaskTree[]> = {}
            cats.forEach((cat, i) => {
                tasksByCategory[cat] = sortAll(buildTaskTree(taskArrays[i]))
            })
            cache.current[d] = { categories: cats, tasksByCategory }

            if (visible.current.date !== d) return
            setCategories(cats)
            const firstCat = cats[0] ?? ''
            setActiveCategory(firstCat)
            setTasks(tasksByCategory[firstCat] ?? [])

            // Keep todayCategories fresh if we just loaded today
            if (d === localDateString()) setTodayCategories(cats)
        } catch (err) {
            console.error('Failed to load ledger:', err)
            if (visible.current.date === d) setError('The ledger could not be retrieved from the archive.')
        } finally {
            if (visible.current.date === d) setLoading(false)
        }
    }, [uid])

    useEffect(() => {
        const cached = cache.current[date]
        if (cached) {
            setCategories(cached.categories)
            const firstCat = cached.categories[0] ?? ''
            setActiveCategory(firstCat)
            setTasks(cached.tasksByCategory[firstCat] ?? [])
            setLoading(false)
        } else {
            loadDate(date)
        }
    }, [date, loadDate])

    // ── Category switch — instant from cache ─────────────────────────────────
    const handleCategorySelect = (cat: string) => {
        setActiveCategory(cat)
        const cached = cache.current[date]
        if (cached?.tasksByCategory[cat]) {
            setTasks(cached.tasksByCategory[cat])
        } else {
            setLoading(true)
            fetchTasksByCategory(uid, cat, date)
                .then(flat => {
                    const sorted = sortAll(buildTaskTree(flat))
                    if (visible.current.date === date && visible.current.activeCategory === cat) setTasks(sorted)
                    if (cache.current[date]) {
                        cache.current[date].tasksByCategory[cat] = sorted
                    }
                })
                .catch(() => setError('Could not load tasks for this category.'))
                .finally(() => { if (visible.current.date === date && visible.current.activeCategory === cat) setLoading(false) })
        }
    }

    // ── Keep cache in sync after mutations ───────────────────────────────────
    const updateCache = useCallback((d: string, cat: string, newTasks: TaskTree[]) => {
        if (!cache.current[d]) return
        cache.current[d].tasksByCategory[cat] = newTasks
    }, [])

    // Mutate the cache synchronously so batched React renders and navigation cannot
    // make a later edit read an older snapshot.
    const visible = useRef({ date, activeCategory })
    visible.current = { date, activeCategory }
    const pendingWrites = useRef(0)
    const queues = useRef(new WriteQueue())
    const saveFailed = useRef(false)
    const mutate = (d: string, cat: string, change: (tasks: TaskTree[]) => TaskTree[]) => {
        const entry = cache.current[d]
        if (!entry) return
        const next = sortAll(change(entry.tasksByCategory[cat] ?? []))
        entry.tasksByCategory[cat] = next
        if (visible.current.date === d) {
            setTasks([...(entry.tasksByCategory[visible.current.activeCategory] ?? [])])
        }
    }
    const persist = async (d: string, cat: string, write: () => Promise<unknown>, rollback: () => void) => {
        const key = `${d}/${cat}`
        if (pendingWrites.current === 0) {
            saveFailed.current = false
            setError(null)
        }
        pendingWrites.current++
        if (savedTimer.current) clearTimeout(savedTimer.current)
        setSyncStatus('saving')
        const operation = queues.current.enqueue(key, write)
        try {
            await operation
        } catch (err) {
            saveFailed.current = true
            console.error('Failed to save task:', err)
            rollback()
            setError('A task change could not be saved. Please try again.')
            throw err
        } finally {
            if (--pendingWrites.current === 0) {
                if (saveFailed.current) setSyncStatus('idle')
                else markSaved()
            }
        }
    }
    const applyUpdate = (trees: TaskTree[], taskId: string, updates: UpdateTaskPayload) =>
        trees.map(parent => {
            if (parent.id === taskId) return { ...parent, ...updates }
            if (!parent.children.some(child => child.id === taskId)) return parent
            const children = parent.children.map(child => child.id === taskId ? { ...child, ...updates } : child)
            return { ...parent, children, ...('status' in updates ? { status: deriveParentStatus(children) } : {}) }
        })
    const saveUpdate = async (taskId: string, updates: UpdateTaskPayload, cat = activeCategory) => {
        const d = date
        const before = cache.current[d]?.tasksByCategory[cat]?.flatMap(t => [t, ...t.children]).find(t => t.id === taskId)
        mutate(d, cat, trees => applyUpdate(trees, taskId, updates))
        const parent = cache.current[d]?.tasksByCategory[cat]?.find(t => t.children.some(c => c.id === taskId))
        const context = { parentId: parent?.id ?? null, parentStatus: parent?.status }
        await persist(d, cat, () => updateTask(uid, taskId, updates, context), () => {
            // Roll back only fields still holding this operation's value.
            if (!before) return
            mutate(d, cat, trees => {
                const current = trees.flatMap(t => [t, ...t.children]).find(t => t.id === taskId)
                const rollback = Object.fromEntries(Object.keys(updates)
                    .filter(key => current?.[key as keyof Task] === updates[key as keyof UpdateTaskPayload])
                    .map(key => [key, before[key as keyof Task]])) as UpdateTaskPayload
                return applyUpdate(trees, taskId, rollback)
            })
        })
    }
    const handleUpdate = async (taskId: string, updates: UpdateTaskPayload) => {
        try { await saveUpdate(taskId, updates) } catch { /* Error notice is shared by both views. */ }
    }

    const [reordering, setReordering] = useState(false)
    const handleReorder = async (sourceId: string, targetId: string, after: boolean) => {
        if (reordering || sourceId === targetId) return
        setError(null)
        const result = reorderTasks(tasks, sourceId, targetId, after)
        if (!result) return
        const next = result.tasks
        setTasks(next)
        updateCache(date, activeCategory, next)
        setReordering(true)
        const d = date, cat = activeCategory
        try {
            await persist(d, cat, async () => {
                const batch = writeBatch(db)
                result.updates.forEach((updates, id) => batch.update(doc(db, 'users', uid, 'tasks', id), updates))
                await batch.commit()
            }, () => {
                // Do not restore an old snapshot over tasks changed while saving.
                if (cache.current[d]?.tasksByCategory[cat] === next) mutate(d, cat, () => tasks)
            })
        } catch { /* Shared save error. */ }
        finally { setReordering(false) }
    }

    const handleDelete = async (taskId: string) => {
        const d = date, cat = activeCategory
        const before = cache.current[d]?.tasksByCategory[cat] ?? []
        mutate(d, cat, trees => trees.filter(t => t.id !== taskId).map(t => {
            const children = t.children.filter(c => c.id !== taskId)
            return { ...t, children, childIds: children.map(c => c.id),
                status: children.length !== t.children.length ? deriveParentStatus(children) : t.status }
        }))
        try {
            await persist(d, cat, () => deleteTask(uid, taskId), () => {
                mutate(d, cat, trees => {
                    const deleted = before.find(t => t.id === taskId)
                    if (deleted) return [...trees, deleted]
                    const parent = before.find(t => t.children.some(c => c.id === taskId))
                    const child = parent?.children.find(c => c.id === taskId)
                    return trees.map(t => {
                        if (t.id !== parent?.id || !child) return t
                        const children = [...t.children, child]
                        return { ...t, children, childIds: children.map(c => c.id), status: deriveParentStatus(children) }
                    })
                })
            })
        } catch { /* Shared error notice. */ }
    }

    const handleCreate = async (
        input: Omit<CreateTaskPayload, 'parentId' | 'childIds' | 'collapsed'> & { initialSubtask?: string },
        parentId?: string
    ) => {
        const { initialSubtask, ...payload } = input
        const d = payload.date, cat = payload.category
        const id = doc(collection(db, 'users', uid, 'tasks')).id
        const task: TaskTree = { ...payload, id, parentId: parentId ?? null,
            childIds: [], collapsed: false, children: [], createdAt: null }
        mutate(d, cat, trees => parentId ? trees.map(t => {
            if (t.id !== parentId) return t
            const children = [...t.children, task]
            return { ...t, children, childIds: children.map(c => c.id), status: deriveParentStatus(children) }
        }) : [...trees, task])
        const rollback = () => mutate(d, cat, trees => trees.filter(t => t.id !== id).map(t => {
            const children = t.children.filter(c => c.id !== id)
            return { ...t, children, childIds: children.map(c => c.id),
                status: t.id === parentId ? deriveParentStatus(children) : t.status }
        }))
        if (initialSubtask) {
            const { startMinute, endMinute, ...parentPayload } = payload
            mutate(d, cat, trees => applyUpdate(trees, id, { startMinute: null, endMinute: null }))
            void persist(d, cat, () => createTask(uid, parentPayload, id), rollback).catch(() => {})
            await handleCreate({ ...payload, title: initialSubtask, startMinute, endMinute }, id)
            return
        }
        const parentStatus = parentId ? cache.current[d]?.tasksByCategory[cat]?.find(t => t.id === parentId)?.status : undefined
        try {
            await persist(d, cat, () => parentId
                ? createSubTask(uid, parentId, payload, id, parentStatus)
                : createTask(uid, payload, id), rollback)
        } catch { /* Shared error notice; the composer remains available. */ }
    }

    // ── Promote task → category ──────────────────────────────────────────────
    const handlePromote = useCallback(async (task: TaskTree) => {
        const newCategory = task.title.trim()
        if (!newCategory || categories.includes(newCategory)) return

        setSyncStatus('saving')
        try {
            const updatedCats = [...categories, newCategory]
            setCategories(updatedCats)
            await saveCategoriesForDate(uid, date, updatedCats)

            const newTasks: TaskTree[] = []
            for (const child of task.children) {
                const id = await dbAddTask(uid, {
                    title: child.title,
                    status: child.status === 'complete' ? 'complete' : 'pending',
                    priority: child.priority,
                    category: newCategory,
                    dueDate: child.dueDate ?? null,
                    date,
                    parentId: null,
                    childIds: [],
                    collapsed: false,
                })
                newTasks.push({ ...child, id, parentId: null, childIds: [], children: [] })
            }

            await deleteTask(uid, task.id)

            setTasks(prev => {
                const next = prev.filter(t => t.id !== task.id)
                updateCache(date, activeCategory, next)
                return next
            })

            if (!cache.current[date]) {
                cache.current[date] = { categories: updatedCats, tasksByCategory: {} }
            }
            cache.current[date].categories = updatedCats
            cache.current[date].tasksByCategory[newCategory] = sortAll(newTasks)

            setActiveCategory(newCategory)
            setTasks(sortAll(newTasks))
            markSaved()
        } catch (err) {
            console.error('Failed to promote task to category:', err)
            setSyncStatus('idle')
            loadDate(date)
        }
    }, [uid, date, categories, activeCategory, updateCache, loadDate])

    // ── Copy task (+ subtasks) to today ──────────────────────────────────────
    const handleCopyToToday = useCallback(async (task: TaskTree, category: string) => {
        const today = localDateString()
        setSyncStatus('saving')
        try {
            // 1. Ensure the category exists in today's category list
            const currentTodayCats = await ensureTodayCategories()
            if (!currentTodayCats.includes(category)) {
                const updatedCats = [...currentTodayCats, category]
                await saveCategoriesForDate(uid, today, updatedCats)
                // Update today's cache entry
                if (!cache.current[today]) {
                    cache.current[today] = { categories: updatedCats, tasksByCategory: {} }
                } else {
                    cache.current[today].categories = updatedCats
                }
                setTodayCategories(updatedCats)
            }

            // 2. Create the parent task on today's date
            const parentPayload: Omit<CreateTaskPayload, 'parentId' | 'childIds' | 'collapsed'> = {
                title: task.title,
                status: task.status,
                priority: task.priority,
                category,
                dueDate: task.dueDate ?? null,
                date: today,
            }
            const newParentId = await createTask(uid, parentPayload)

            // 3. Create each subtask under the new parent
            for (const child of task.children) {
                await createSubTask(uid, newParentId, {
                    title: child.title,
                    status: child.status,
                    priority: child.priority,
                    category,
                    dueDate: child.dueDate ?? null,
                    date: today,
                })
            }

            // 4. Reload today's tasks for that category into state + cache
            const freshFlat = await fetchTasksByCategory(uid, category, today)
            const freshTrees = sortAll(buildTaskTree(freshFlat))

            if (!cache.current[today]) {
                cache.current[today] = { categories: todayCategories, tasksByCategory: {} }
            }
            cache.current[today].tasksByCategory[category] = freshTrees

            // If the user is currently viewing today + that category, update visible tasks
            if (date === today && activeCategory === category) {
                setTasks(freshTrees)
            }

            markSaved()
        } catch (err) {
            console.error('Failed to copy task to today:', err)
            setSyncStatus('idle')
            throw err // Let TaskItem show the button as failed
        }
    }, [uid, ensureTodayCategories])

    // ── Category management ──────────────────────────────────────────────────
    const handleAddCategory = async (name: string) => {
        const next = [...categories, name]
        setCategories(next)
        setActiveCategory(name)
        setTasks([])
        if (!cache.current[date]) {
            cache.current[date] = { categories: next, tasksByCategory: {} }
        }
        cache.current[date].categories = next
        cache.current[date].tasksByCategory[name] = []
        await saveCategoriesForDate(uid, date, next)
        // If adding a category on today's view, keep todayCategories in sync
        if (date === today) setTodayCategories(next)
    }

    const today = localDateString()

    const handleRename = async (oldName: string, newName: string) => {
        const updatedCats = categories.map(c => c === oldName ? newName : c)
        setCategories(updatedCats)
        if (activeCategory === oldName) setActiveCategory(newName)
        await saveCategoriesForDate(uid, date, updatedCats)

        setTasks(prev => prev.map(t =>
            t.category === oldName ? { ...t, category: newName } : t
        ))

        if (cache.current[date]) {
            const old = cache.current[date].tasksByCategory[oldName] ?? []
            cache.current[date].tasksByCategory[newName] = old
            delete cache.current[date].tasksByCategory[oldName]
            cache.current[date].categories = updatedCats
        }

        const affected = tasks.filter(t => t.category === oldName)
        if (affected.length === 0) return
        const batch = writeBatch(db)
        affected.forEach(t => batch.update(doc(db, 'users', uid, 'tasks', t.id), { category: newName }))
        await batch.commit()
    }

    const handleRemove = async (name: string) => {
        const updatedCats = categories.filter(c => c !== name)
        setCategories(updatedCats)
        const nextActive = activeCategory === name ? (updatedCats[0] ?? '') : activeCategory
        setActiveCategory(nextActive)
        setTasks(cache.current[date]?.tasksByCategory[nextActive] ?? [])

        if (cache.current[date]) {
            delete cache.current[date].tasksByCategory[name]
            cache.current[date].categories = updatedCats
        }

        await saveCategoriesForDate(uid, date, updatedCats)
        await deleteTasksByCategory(uid, date, name)
    }

    const handleDayStatus = (task: Task, status: Task['status']) => saveUpdate(task.id, { status }, task.category)

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            <NavBar />
            <PageColumn style={view === 'day' ? { maxWidth: 1120 } : undefined}>
                <SectionHeader
                    title="The Ledger"
                    byline="All tasks, dispatches & standing orders"
                />
                <RuleDivider variant="light" spacing="md" />

                <DateNavigator date={date} onChange={d => { setDate(d) }} />
                <ViewSwitch aria-label="Ledger view">
                    <button aria-pressed={view === 'list'} onClick={() => setView('list')}>List</button>
                    <button aria-pressed={view === 'day'} onClick={() => { setDayVisited(true); setView('day') }}>Day View</button>
                </ViewSwitch>

                <RuleDivider variant="light" spacing="md" />

                <CategoryTabs
                    categories={categories}
                    activeCategory={activeCategory}
                    onSelect={handleCategorySelect}
                    onAdd={handleAddCategory}
                    onRename={handleRename}
                    onRemove={handleRemove}
                />

                <RuleDivider variant="mid" spacing="md" />

                <IndicatorRow>
                    <SaveIndicator status={syncStatus} />
                </IndicatorRow>

                {error && <ErrorNotice>{error}</ErrorNotice>}

                {!error && !loading && categories.length === 0 && (
                    <EmptyLedger>
                        No columns have been opened for today's edition.<br />
                        Add a category above to begin the day's ledger.
                    </EmptyLedger>
                )}

                {!loading && dayVisited && (
                    <div hidden={view !== 'day'}><DayView key={date} uid={uid} date={date} categories={categories}
                        tasks={Object.values(cache.current[date]?.tasksByCategory ?? {}).flat()}
                        onCreate={handleCreate} onUpdate={(task, updates) => saveUpdate(task.id, updates, task.category)} onStatusChange={handleDayStatus} /></div>
                )}

                {!loading && view === 'list' && activeCategory && (
                    <>
                        <TaskList
                            tasks={tasks}
                            onReorder={handleReorder}
                            reorderDisabled={reordering}
                            uid={uid}
                            date={date}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                            onCreate={handleCreate}
                            onPromote={handlePromote}
                            todayCategories={todayCategories}
                            onCopyToToday={handleCopyToToday}
                        />
                        <TaskComposer
                            uid={uid}
                            category={activeCategory}
                            date={date}
                            onCreated={handleCreate}
                            autoFocus
                        />
                    </>
                )}
            </PageColumn>
        </>
    )
}

export default Tasks