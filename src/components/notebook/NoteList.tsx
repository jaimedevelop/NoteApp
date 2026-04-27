import { useState, useCallback } from 'react';
import styled from 'styled-components';
import type { NotebookEntry, UpdateEntryPayload } from '../../types/notebook';
import NoteEntry from './NoteEntry';

// ── Styled ─────────────────────────────────────────────────────────────────────

const Scroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
  scrollbar-width: thin;
  scrollbar-color: ${p => p.theme.colors.inkMuted} transparent;
`;

const RuledLine = styled.div`
  border-bottom: 1px solid rgba(0,0,0,0.07);
`;

const Empty = styled.p`
  font-family: ${p => p.theme.fonts.serif};
  font-size: 13px;
  font-style: italic;
  color: ${p => p.theme.colors.inkMuted};
  text-align: center;
  margin-top: 32px;
`;

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
    entries: NotebookEntry[];
    onUpdate: (id: string, data: UpdateEntryPayload) => void;
    onDelete: (id: string) => void;
    onReorder: (reordered: NotebookEntry[]) => void;
}

export default function NoteList({ entries, onUpdate, onDelete, onReorder }: Props) {
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);

    const handleDrop = useCallback(() => {
        if (!draggingId || !overId || draggingId === overId) {
            setDraggingId(null); setOverId(null); return;
        }
        const from = entries.findIndex(e => e.id === draggingId);
        const to = entries.findIndex(e => e.id === overId);
        if (from === -1 || to === -1) return;
        const next = [...entries];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        onReorder(next);
        setDraggingId(null); setOverId(null);
    }, [draggingId, overId, entries, onReorder]);

    if (entries.length === 0) {
        return <Scroll><Empty>— No entries yet. File one below. —</Empty></Scroll>;
    }

    return (
        <Scroll>
            {entries.map(e => (
                <RuledLine key={e.id}>
                    <NoteEntry
                        entry={e}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onDragStart={id => setDraggingId(id)}
                        onDragOver={id => setOverId(id)}
                        onDrop={handleDrop}
                        isDragging={draggingId === e.id}
                        isOver={overId === e.id && draggingId !== e.id}
                    />
                </RuledLine>
            ))}
        </Scroll>
    );
}