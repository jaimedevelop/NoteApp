import {
    collection, doc, getDocs, addDoc, updateDoc,
    deleteDoc, query, orderBy, writeBatch, CollectionReference,
} from 'firebase/firestore';
import { db } from './database';
import type { NotebookList, NotebookEntry, CreateListPayload, CreateEntryPayload, UpdateEntryPayload } from '../types/notebook';

// ── Collection refs ────────────────────────────────────────────────────────────

const listsCol = (uid: string) =>
    collection(db, 'users', uid, 'notebookLists') as CollectionReference<Omit<NotebookList, 'id'>>;

const entriesCol = (uid: string, listId: string) =>
    collection(db, 'users', uid, 'notebookLists', listId, 'entries') as CollectionReference<Omit<NotebookEntry, 'id'>>;

// ── Lists ──────────────────────────────────────────────────────────────────────

export async function fetchLists(uid: string): Promise<NotebookList[]> {
    const snap = await getDocs(query(listsCol(uid), orderBy('order')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as NotebookList));
}

export async function addList(uid: string, payload: CreateListPayload): Promise<NotebookList> {
    const ref = await addDoc(listsCol(uid), payload);
    return { id: ref.id, ...payload };
}

export async function updateList(uid: string, listId: string, data: Partial<Omit<NotebookList, 'id'>>): Promise<void> {
    await updateDoc(doc(db, 'users', uid, 'notebookLists', listId), data);
}

export async function deleteList(uid: string, listId: string): Promise<void> {
    // Delete all entries first, then the list doc
    const snap = await getDocs(entriesCol(uid, listId));
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(doc(db, 'users', uid, 'notebookLists', listId));
    await batch.commit();
}

export async function reorderLists(uid: string, lists: NotebookList[]): Promise<void> {
    const batch = writeBatch(db);
    lists.forEach((l, i) => {
        batch.update(doc(db, 'users', uid, 'notebookLists', l.id), { order: i });
    });
    await batch.commit();
}

// ── Entries ────────────────────────────────────────────────────────────────────

export async function fetchEntries(uid: string, listId: string): Promise<NotebookEntry[]> {
    const snap = await getDocs(query(entriesCol(uid, listId), orderBy('order')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as NotebookEntry));
}

export async function addEntry(uid: string, listId: string, payload: CreateEntryPayload): Promise<NotebookEntry> {
    const ref = await addDoc(entriesCol(uid, listId), payload);
    return { id: ref.id, ...payload };
}

export async function updateEntry(uid: string, listId: string, entryId: string, data: UpdateEntryPayload): Promise<void> {
    await updateDoc(doc(db, 'users', uid, 'notebookLists', listId, 'entries', entryId), data as Record<string, unknown>);
}

export async function deleteEntry(uid: string, listId: string, entryId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'notebookLists', listId, 'entries', entryId));
}

export async function reorderEntries(uid: string, listId: string, entries: NotebookEntry[]): Promise<void> {
    const batch = writeBatch(db);
    entries.forEach((e, i) => {
        batch.update(doc(db, 'users', uid, 'notebookLists', listId, 'entries', e.id), { order: i });
    });
    await batch.commit();
}