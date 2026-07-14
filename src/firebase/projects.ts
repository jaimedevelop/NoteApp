import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    writeBatch,
    type DocumentData,
} from 'firebase/firestore'
import { db } from './database'
import type {
    Project,
    Milestone,
    BlockedDay,
    CreateProjectPayload,
    UpdateProjectPayload,
    CreateMilestonePayload,
    UpdateMilestonePayload,
} from '../types/project'

// ─── Collection References ────────────────────────────────────────────────────

const projectsCol = (uid: string) => collection(db, 'users', uid, 'projects')
const projectDoc = (uid: string, pid: string) => doc(db, 'users', uid, 'projects', pid)
const milestonesCol = (uid: string, pid: string) => collection(db, 'users', uid, 'projects', pid, 'milestones')
const milestoneDoc = (uid: string, pid: string, mid: string) => doc(db, 'users', uid, 'projects', pid, 'milestones', mid)
const blockedCol = (uid: string) => collection(db, 'users', uid, 'blockedDays')
const blockedDoc = (uid: string, bid: string) => doc(db, 'users', uid, 'blockedDays', bid)

// ─── Projects ─────────────────────────────────────────────────────────────────

export const fetchProjects = async (uid: string): Promise<Project[]> => {
    const snap = await getDocs(query(projectsCol(uid), orderBy('createdAt', 'asc')))
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Project))
}

export const fetchProject = async (uid: string, pid: string): Promise<Project | null> => {
    const snap = await getDoc(projectDoc(uid, pid))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as Project
}

export const addProject = async (uid: string, payload: CreateProjectPayload): Promise<string> => {
    const ref = await addDoc(projectsCol(uid), { ...payload, createdAt: serverTimestamp() })
    return ref.id
}

export const updateProject = async (uid: string, pid: string, updates: UpdateProjectPayload): Promise<void> => {
    await updateDoc(projectDoc(uid, pid), updates as DocumentData)
}

/**
 * Deletes a project and all its milestones in a single batch.
 * Does NOT delete tasks — tasks retain their data; they just lose their
 * project association visually (projectId on the task type is optional).
 */
export const deleteProject = async (uid: string, pid: string): Promise<void> => {
    const batch = writeBatch(db)
    const mSnap = await getDocs(milestonesCol(uid, pid))
    mSnap.docs.forEach(d => batch.delete(d.ref))
    batch.delete(projectDoc(uid, pid))
    await batch.commit()
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export const fetchMilestones = async (uid: string, pid: string): Promise<Milestone[]> => {
    const snap = await getDocs(query(milestonesCol(uid, pid), orderBy('date', 'asc')))
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Milestone))
}

export const fetchAllMilestones = async (uid: string): Promise<Milestone[]> => {
    const projects = await fetchProjects(uid)
    const nested = await Promise.all(projects.map(p => fetchMilestones(uid, p.id)))
    return nested.flat()
}

export const addMilestone = async (
    uid: string,
    pid: string,
    payload: CreateMilestonePayload
): Promise<string> => {
    const ref = await addDoc(milestonesCol(uid, pid), { ...payload, createdAt: serverTimestamp() })
    return ref.id
}

export const updateMilestone = async (
    uid: string,
    pid: string,
    mid: string,
    updates: UpdateMilestonePayload
): Promise<void> => {
    await updateDoc(milestoneDoc(uid, pid, mid), updates as DocumentData)
}

export const deleteMilestone = async (uid: string, pid: string, mid: string): Promise<void> => {
    await deleteDoc(milestoneDoc(uid, pid, mid))
}

// ─── Blocked Days ─────────────────────────────────────────────────────────────

export const fetchBlockedDays = async (uid: string): Promise<BlockedDay[]> => {
    const snap = await getDocs(blockedCol(uid))
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BlockedDay))
}

/**
 * Adds a blocked entry. Pass the same value for startDate and endDate
 * to block a single day.
 */
export const addBlockedDay = async (
    uid: string,
    startDate: string,
    endDate: string,
    label: string
): Promise<string> => {
    const ref = await addDoc(blockedCol(uid), { startDate, endDate, label })
    return ref.id
}

export const deleteBlockedDay = async (uid: string, bid: string): Promise<void> => {
    await deleteDoc(blockedDoc(uid, bid))
}