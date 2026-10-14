import {
  collection, doc,
  getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy,
} from 'firebase/firestore'
import { db } from './database'
import type { FunPoolItem, CreateFunPoolPayload } from '../types/funPool'

const col = (uid: string) =>
  collection(db, 'users', uid, 'funPool')

export async function fetchFunPool(uid: string): Promise<FunPoolItem[]> {
  const snap = await getDocs(query(col(uid), orderBy('createdAt', 'asc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FunPoolItem))
}

export async function addFunPoolItem(
  uid: string,
  payload: CreateFunPoolPayload,
): Promise<string> {
  const ref = await addDoc(col(uid), {
    title: payload.title,
    notes: payload.notes ?? '',
    status: 'active',
    assignedDates: [],
    createdAt: Date.now(),
  })
  return ref.id
}

export async function updateFunPoolItem(
  uid: string,
  itemId: string,
  changes: Partial<Omit<FunPoolItem, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(col(uid), itemId), changes as Record<string, unknown>)
}

export async function deleteFunPoolItem(uid: string, itemId: string): Promise<void> {
  await deleteDoc(doc(col(uid), itemId))
}

export async function assignFunItemToDate(
  uid: string,
  itemId: string,
  date: string,
  currentDates: string[],
): Promise<void> {
  if (currentDates.includes(date)) return
  await updateDoc(doc(col(uid), itemId), {
    assignedDates: [...currentDates, date],
  })
}

export async function unassignFunItemFromDate(
  uid: string,
  itemId: string,
  date: string,
  currentDates: string[],
): Promise<void> {
  await updateDoc(doc(col(uid), itemId), {
    assignedDates: currentDates.filter(d => d !== date),
  })
}