import {
  collection, doc,
  getDocs, addDoc, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db } from './index'
import type { TimeBlock, CreateTimeBlockPayload } from '../types/timeBlock'

const col = (uid: string) =>
  collection(db, 'users', uid, 'timeBlocks')

export async function fetchTimeBlocks(uid: string): Promise<TimeBlock[]> {
  const snap = await getDocs(query(col(uid), orderBy('createdAt', 'asc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TimeBlock))
}

export async function addTimeBlock(
  uid: string,
  payload: CreateTimeBlockPayload,
): Promise<string> {
  const ref = await addDoc(col(uid), {
    ...payload,
    exceptions: [],
    createdAt: Date.now(),
  })
  return ref.id
}

export async function updateTimeBlock(
  uid: string,
  blockId: string,
  changes: Partial<Omit<TimeBlock, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(col(uid), blockId), changes as Record<string, unknown>)
}

export async function deleteTimeBlock(uid: string, blockId: string): Promise<void> {
  await deleteDoc(doc(col(uid), blockId))
}

/** Add a single ISO date to a block's exceptions array */
export async function addBlockException(
  uid: string,
  blockId: string,
  date: string,
  currentExceptions: string[],
): Promise<void> {
  if (currentExceptions.includes(date)) return
  await updateDoc(doc(col(uid), blockId), {
    exceptions: [...currentExceptions, date],
  })
}