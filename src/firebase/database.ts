import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    writeBatch,
    type DocumentData,
    type QuerySnapshot,
} from 'firebase/firestore'
import app from './index'
import type { Task } from '../types/task'

export const db = getFirestore(app)

// ─── Collection References ────────────────────────────────────────────────────

const tasksCol = (uid: string) => collection(db, 'users', uid, 'tasks')
const categoryDoc = (uid: string, date: string) =>
    doc(db, 'users', uid, 'categoryDays', date)

// ─── Categories (per-day) ─────────────────────────────────────────────────────

/** Returns the ordered category list for a given day. Empty array if none saved yet. */
export const fetchCategoriesForDate = async (
    uid: string,
    date: string
): Promise<string[]> => {
    const snap = await getDoc(categoryDoc(uid, date))
    if (!snap.exists()) return []
    return (snap.data().categories as string[]) ?? []
}

/** Overwrites the category list for a given day. */
export const saveCategoriesForDate = async (
    uid: string,
    date: string,
    categories: string[]
): Promise<void> => {
    await setDoc(categoryDoc(uid, date), { categories })
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

/** Fetch all tasks for a user, ordered by creation time. */
export const fetchAllTasks = async (uid: string): Promise<Task[]> => {
    const snap: QuerySnapshot<DocumentData> = await getDocs(
        query(tasksCol(uid), orderBy('createdAt', 'asc'))
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Task))
}

/**
 * Fetch tasks belonging to a specific category AND date.
 * Both fields are required to prevent same-name categories on different days
 * from bleeding into each other.
 */
export const fetchTasksByCategory = async (
    uid: string,
    category: string,
    date: string
): Promise<Task[]> => {
    const snap = await getDocs(
        query(
            tasksCol(uid),
            where('category', '==', category),
            where('date', '==', date),
            orderBy('createdAt', 'asc')
        )
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Task))
}

/** Fetch tasks that have a due date on a specific day (YYYY-MM-DD). */
export const fetchTasksByDate = async (
    uid: string,
    date: string
): Promise<Task[]> => {
    const snap = await getDocs(
        query(tasksCol(uid), where('dueDate', '==', date))
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Task))
}

/** Add a new task. Returns the Firestore-generated document ID. */
export const addTask = async (
    uid: string,
    task: Omit<Task, 'id' | 'createdAt'>
): Promise<string> => {
    const ref = await addDoc(tasksCol(uid), {
        ...task,
        createdAt: serverTimestamp(),
    })
    return ref.id
}

/** Update arbitrary fields on an existing task. */
export const updateTask = async (
    uid: string,
    taskId: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt'>>
): Promise<void> => {
    const ref = doc(tasksCol(uid), taskId)
    await updateDoc(ref, updates as DocumentData)
}

/** Delete a task document by ID. */
export const deleteTask = async (
    uid: string,
    taskId: string
): Promise<void> => {
    await deleteDoc(doc(tasksCol(uid), taskId))
}

/** Fetch a single task by ID. */
export const fetchTask = async (
    uid: string,
    taskId: string
): Promise<Task | null> => {
    const snap = await getDoc(doc(tasksCol(uid), taskId))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as Task
}

/** Delete all tasks for a given category + date combination. */
export async function deleteTasksByCategory(uid: string, date: string, category: string) {
    const q = query(
        tasksCol(uid),
        where('date', '==', date),
        where('category', '==', category)
    )
    const snap = await getDocs(q)
    const batch = writeBatch(db)
    snap.docs.forEach(d => batch.delete(d.ref))
    await batch.commit()
}