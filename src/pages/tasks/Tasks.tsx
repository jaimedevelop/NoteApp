import React, { useEffect, useState, useCallback, useRef } from 'react'
import styled from 'styled-components'
import NavBar from '../../components/NavBar'
import PageColumn from '../../components/PageColumn'
import RuleDivider from '../../components/RuleDivider'
import SectionHeader from '../../components/SectionHeader'
import CategoryTabs from './CategoryTabs'
import TaskList from './TaskList'
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
import { writeBatch, doc } from 'firebase/firestore'
import { localDateString } from '../../utils/date'

// ─── Priority sort ────────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 }

const sortByPriority = (trees: TaskTree[]): TaskTree[] =>
    [...trees].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

const sortChildren = (tree: TaskTree): TaskTree => ({
    ...tree,
    children: [...tree.children].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
})

const sortAll = (trees: TaskTree[]): TaskTree[] =>
    sortByPriority(trees.map(sortChildren))

// ─── Styled ───────────────────────────────────────────────────────────────────

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
        // Warm the cache entry minimally so a subsequent loadDate is still a
        // full fetch, but repeated ensureTodayCategories calls are instant.
        if (!cache.current[today]) {
            cache.current[today] = { categories: cats, tasksByCategory: {} }
        } else {
            cache.current[today].categories = cats
        }
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

            setCategories(cats)
            const firstCat = cats[0] ?? ''
            setActiveCategory(firstCat)
            setTasks(tasksByCategory[firstCat] ?? [])

            // Keep todayCategories fresh if we just loaded today
            if (d === localDateString()) setTodayCategories(cats)
        } catch (err) {
            console.error('Failed to load ledger:', err)
            setError('The ledger could not be retrieved from the archive.')
        } finally {
            setLoading(false)
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
                    setTasks(sorted)
                    if (cache.current[date]) {
                        cache.current[date].tasksByCategory[cat] = sorted
                    }
                })
                .catch(() => setError('Could not load tasks for this category.'))
                .finally(() => setLoading(false))
        }
    }

    // ── Keep cache in sync after mutations ───────────────────────────────────
    const updateCache = useCallback((d: string, cat: string, newTasks: TaskTree[]) => {
        if (!cache.current[d]) return
        cache.current[d].tasksByCategory[cat] = newTasks
    }, [])

    // ── Optimistic update ────────────────────────────────────────────────────
    const handleUpdate = useCallback(async (taskId: string, updates: UpdateTaskPayload) => {
        setTasks(prev => {
            const next = sortAll(prev.map(parent => {
                if (parent.id === taskId) return { ...parent, ...updates }
                const childIdx = parent.children.findIndex(c => c.id === taskId)
                if (childIdx === -1) return parent
                const updatedChildren = parent.children.map(c =>
                    c.id === taskId ? { ...c, ...updates } : c
                )
                const updatedParent = { ...parent, children: updatedChildren }
                if ('status' in updates) {
                    updatedParent.status = deriveParentStatus(updatedChildren)
                }
                return sortChildren(updatedParent)
            }))
            updateCache(date, activeCategory, next)
            return next
        })

        setSyncStatus('saving')
        try {
            await updateTask(uid, taskId, updates)
            markSaved()
        } catch (err) {
            console.error('Failed to save update:', err)
            setSyncStatus('idle')
            loadDate(date)
        }
    }, [uid, date, activeCategory, updateCache, loadDate])

    // ── Optimistic delete ────────────────────────────────────────────────────
    const handleDelete = useCallback(async (taskId: string) => {
        setTasks(prev => {
            const next = prev
                .filter(t => t.id !== taskId)
                .map(t => ({ ...t, children: t.children.filter(c => c.id !== taskId) }))
            updateCache(date, activeCategory, next)
            return next
        })
        setSyncStatus('saving')
        try {
            await deleteTask(uid, taskId)
            markSaved()
        } catch (err) {
            console.error('Failed to delete task:', err)
            setSyncStatus('idle')
            loadDate(date)
        }
    }, [uid, date, activeCategory, updateCache, loadDate])

    // ── Optimistic create ────────────────────────────────────────────────────
    const handleCreate = useCallback(async (
        payload: Omit<CreateTaskPayload, 'parentId' | 'childIds' | 'collapsed'>,
        parentId?: string
    ) => {
        const tempId = `temp_${Date.now()}`
        const tempTask: TaskTree = {
            id: tempId,
            ...payload,
            parentId: parentId ?? null,
            childIds: [],
            collapsed: false,
            children: [],
            createdAt: null,
        }

        setTasks(prev => {
            let next: TaskTree[]
            if (parentId) {
                next = prev.map(t =>
                    t.id === parentId
                        ? sortChildren({ ...t, children: [...t.children, tempTask] })
                        : t
                )
            } else {
                next = sortAll([...prev, tempTask])
            }
            updateCache(date, activeCategory, next)
            return next
        })

        setSyncStatus('saving')
        try {
            const realId = parentId
                ? await createSubTask(uid, parentId, payload)
                : await createTask(uid, payload)

            setTasks(prev => {
                const next = prev.map(t => {
                    if (t.id === tempId) return { ...t, id: realId }
                    return {
                        ...t,
                        children: t.children.map(c => c.id === tempId ? { ...c, id: realId } : c),
                    }
                })
                updateCache(date, activeCategory, next)
                return next
            })
            markSaved()
        } catch (err) {
            console.error('Failed to create task:', err)
            setSyncStatus('idle')
            setTasks(prev => {
                const next = prev
                    .filter(t => t.id !== tempId)
                    .map(t => ({ ...t, children: t.children.filter(c => c.id !== tempId) }))
                updateCache(date, activeCategory, next)
                return next
            })
        }
    }, [uid, date, activeCategory, updateCache])

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

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            <NavBar />
            <PageColumn>
                <SectionHeader
                    title="The Ledger"
                    byline="All tasks, dispatches & standing orders"
                />
                <RuleDivider variant="light" spacing="md" />

                <DateNavigator date={date} onChange={d => { setDate(d) }} />

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

                {!error && !loading && activeCategory && (
                    <>
                        <TaskList
                            tasks={tasks}
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