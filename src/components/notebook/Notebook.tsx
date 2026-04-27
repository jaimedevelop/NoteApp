import { useEffect, useState, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import useAuth from '../../hooks/useAuth';
import type { NotebookList, NotebookEntry, UpdateEntryPayload } from '../../types/notebook';
import {
    fetchLists, addList, updateList, deleteList,
    fetchEntries, addEntry, updateEntry, deleteEntry, reorderEntries,
} from '../../firebase/notebook';
import NotebookTabs from './NotebookTabs';
import NoteList from './NoteList';
import NoteComposer from './NoteComposer';

// ── Animations ─────────────────────────────────────────────────────────────────
export const NOTEBOOK_WIDTH = 420;
const slideIn = keyframes`from { transform: translateX(100%); } to { transform: translateX(0); }`;
const slideOut = keyframes`from { transform: translateX(0); } to { transform: translateX(100%); }`;

// ── Styled ─────────────────────────────────────────────────────────────────────

const Panel = styled.div<{ $closing: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  max-width: 92vw;
  height: 100vh;
  z-index: 299;
  display: flex;
  flex-direction: column;
  background: #f5f0e4;
  background-image:
    repeating-linear-gradient(
      transparent,
      transparent 27px,
      rgba(180,160,120,0.25) 27px,
      rgba(180,160,120,0.25) 28px
    );
  border-left: 3px solid #c8b89a;
  box-shadow: -4px 0 24px rgba(0,0,0,0.18);
  animation: ${p => p.$closing ? slideOut : slideIn} 0.35s cubic-bezier(0.4,0,0.2,1) forwards;
`;

// Spiral binding on the left edge
const Spiral = styled.div`
  position: absolute;
  left: -14px;
  top: 24px;
  bottom: 24px;
  width: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  pointer-events: none;
  z-index: 301;
`;

const Ring = styled.div`
  width: 14px;
  height: 14px;
  border: 2.5px solid #8a7a60;
  border-radius: 50%;
  background: #d4c9a8;
`;

// Title bar at top of panel
const Header = styled.div`
  padding: 14px 12px 0;
  flex-shrink: 0;
`;

const Title = styled.h2`
  font-family: ${p => p.theme.fonts.serif};
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${p => p.theme.colors.inkPrimary};
  margin: 0 0 10px;
  text-align: center;
  border-bottom: 2px double ${p => p.theme.colors.inkSecondary};
  padding-bottom: 8px;
`;

const StatusLine = styled.p`
  font-family: ${p => p.theme.fonts.serif};
  font-size: 11px;
  font-style: italic;
  color: ${p => p.theme.colors.inkMuted};
  text-align: center;
  margin: 8px 0 0;
  min-height: 16px;
`;

const NoListsMsg = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: ${p => p.theme.fonts.serif};
  font-size: 13px;
  font-style: italic;
  color: ${p => p.theme.colors.inkMuted};
  text-align: center;
  padding: 24px;
`;

// ── Notebook ───────────────────────────────────────────────────────────────────

const RING_COUNT = 18;

interface Props {
    closing: boolean;
}

export default function Notebook({ closing }: Props) {
    const { user } = useAuth();
    const uid = user?.uid ?? '';

    const [lists, setLists] = useState<NotebookList[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [entries, setEntries] = useState<NotebookEntry[]>([]);
    const [status, setStatus] = useState('');

    // Cache entries per list so switching tabs is instant
    const cache = useRef<Record<string, NotebookEntry[]>>({});

    // ── Load lists on open ───────────────────────────────────────────────────────

    useEffect(() => {
        if (!uid || !open) return;
        fetchLists(uid).then(ls => {
            setLists(ls);
            if (ls.length > 0 && !activeId) setActiveId(ls[0].id);
        });
    }, [uid, open]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Load entries when active list changes ────────────────────────────────────

    useEffect(() => {
        if (!uid || !activeId) return;
        if (cache.current[activeId]) {
            setEntries(cache.current[activeId]);
            return;
        }
        fetchEntries(uid, activeId).then(es => {
            cache.current[activeId] = es;
            setEntries(es);
        });
    }, [uid, activeId]);

    function flash(msg: string) {
        setStatus(msg);
        setTimeout(() => setStatus(''), 2000);
    }

    // ── List operations ──────────────────────────────────────────────────────────

    async function handleAddList(name: string) {
        const order = lists.length;
        const l = await addList(uid, { name, order });
        const next = [...lists, l];
        setLists(next);
        cache.current[l.id] = [];
        setActiveId(l.id);
        setEntries([]);
    }

    async function handleDeleteList(id: string) {
        if (!window.confirm('Delete this list and all its entries?')) return;
        await deleteList(uid, id);
        delete cache.current[id];
        const next = lists.filter(l => l.id !== id);
        setLists(next);
        if (activeId === id) {
            const newActive = next[0]?.id ?? null;
            setActiveId(newActive);
            setEntries(newActive ? (cache.current[newActive] ?? []) : []);
        }
    }

    async function handleRenameList(id: string, name: string) {
        await updateList(uid, id, { name });
        setLists(ls => ls.map(l => l.id === id ? { ...l, name } : l));
    }

    // ── Entry operations ─────────────────────────────────────────────────────────

    async function handleAddEntry(text: string, dueDate?: string) {
        if (!activeId) return;
        const order = entries.length;
        const payload = { listId: activeId, text, done: false, order, createdAt: Date.now(), ...(dueDate ? { dueDate } : {}) };
        const entry = await addEntry(uid, activeId, payload);
        const next = [...entries, entry];
        cache.current[activeId] = next;
        setEntries(next);
        flash('Filed.');
    }

    const handleUpdateEntry = useCallback(async (id: string, data: UpdateEntryPayload) => {
        if (!activeId) return;
        setEntries(es => {
            const next = es.map(e => e.id === id ? { ...e, ...data } : e);
            cache.current[activeId] = next;
            return next;
        });
        await updateEntry(uid, activeId, id, data);
    }, [uid, activeId]);

    const handleDeleteEntry = useCallback(async (id: string) => {
        if (!activeId) return;
        setEntries(es => {
            const next = es.filter(e => e.id !== id);
            cache.current[activeId] = next;
            return next;
        });
        await deleteEntry(uid, activeId, id);
    }, [uid, activeId]);

    const handleReorder = useCallback(async (reordered: NotebookEntry[]) => {
        if (!activeId) return;
        const withOrder = reordered.map((e, i) => ({ ...e, order: i }));
        cache.current[activeId] = withOrder;
        setEntries(withOrder);
        await reorderEntries(uid, activeId, withOrder);
    }, [uid, activeId]);

    // ── Render ───────────────────────────────────────────────────────────────────

    return (
        <Panel $closing={closing} aria-label="Field Notes notebook">
            <Spiral>
                {Array.from({ length: RING_COUNT }).map((_, i) => <Ring key={i} />)}
            </Spiral>

            <Header>
                <Title>— Field Notes —</Title>
            </Header>

            <NotebookTabs
                lists={lists}
                activeId={activeId}
                onSelect={id => { setActiveId(id); setEntries(cache.current[id] ?? []); }}
                onAdd={handleAddList}
                onDelete={handleDeleteList}
                onRename={handleRenameList}
            />

            {lists.length === 0 ? (
                <NoListsMsg>
                    <span>No lists yet.</span>
                    <span>Press <strong>+</strong> above to open your first column.</span>
                </NoListsMsg>
            ) : (
                <>
                    <NoteList
                        entries={entries}
                        onUpdate={handleUpdateEntry}
                        onDelete={handleDeleteEntry}
                        onReorder={handleReorder}
                    />
                    <StatusLine>{status}</StatusLine>
                    <NoteComposer onAdd={handleAddEntry} />
                </>
            )}
        </Panel>
    );
}