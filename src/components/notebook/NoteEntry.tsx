import { useState, useRef } from 'react';
import styled from 'styled-components';
import type { NotebookEntry, UpdateEntryPayload } from '../../types/notebook';
import { localDateString } from '../../utils/date';

// ── Styled ─────────────────────────────────────────────────────────────────────

const Row = styled.div<{ $done: boolean; $dragging: boolean; $over: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 4px;
  border-radius: 3px;
  background: ${p => p.$over ? 'rgba(0,0,0,0.06)' : 'transparent'};
  opacity: ${p => p.$dragging ? 0.4 : 1};
  cursor: grab;
  transition: background 0.1s;

  &:hover .entry-actions { opacity: 1; }
`;

const DragHandle = styled.span`
  font-size: 12px;
  color: ${p => p.theme.colors.inkMuted};
  cursor: grab;
  margin-top: 2px;
  user-select: none;
  flex-shrink: 0;
`;

const Checkbox = styled.input`
  margin-top: 3px;
  flex-shrink: 0;
  accent-color: ${p => p.theme.colors.inkPrimary};
  cursor: pointer;
`;

const TextArea = styled.div`
  flex: 1;
  min-width: 0;
`;

const EntryText = styled.span<{ $done: boolean }>`
  font-family: ${p => p.theme.fonts.serif};
  font-size: 13px;
  color: ${p => p.$done ? p.theme.colors.inkMuted : p.theme.colors.inkPrimary};
  text-decoration: ${p => p.$done ? 'line-through' : 'none'};
  line-height: 1.45;
  cursor: text;
  word-break: break-word;
`;

const EditInput = styled.input`
  width: 100%;
  font-family: ${p => p.theme.fonts.serif};
  font-size: 13px;
  color: ${p => p.theme.colors.inkPrimary};
  background: transparent;
  border: none;
  border-bottom: 1px solid ${p => p.theme.colors.inkMuted};
  outline: none;
  padding: 0;
`;

const DueTag = styled.span<{ $overdue: boolean }>`
  display: inline-block;
  margin-top: 2px;
  font-family: ${p => p.theme.fonts.sansSerif};
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 2px;
  background: ${p => p.$overdue ? p.theme.colors.statusIncomplete : p.theme.colors.inkMuted};
  color: ${p => p.theme.colors.pageBg};
  cursor: pointer;
  user-select: none;
`;

const DueDateInput = styled.input`
  font-family: ${p => p.theme.fonts.sansSerif};
  font-size: 11px;
  margin-top: 3px;
  display: block;
  border: 1px solid ${p => p.theme.colors.inkMuted};
  border-radius: 2px;
  padding: 2px 4px;
  background: ${p => p.theme.colors.pageBg};
  color: ${p => p.theme.colors.inkPrimary};
  outline: none;
`;

const Actions = styled.div`
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
  margin-top: 2px;
`;

const ActionBtn = styled.button`
  font-size: 12px;
  background: none;
  border: none;
  color: ${p => p.theme.colors.inkMuted};
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;

  &:hover { color: ${p => p.theme.colors.statusIncomplete}; }
`;

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
    entry: NotebookEntry;
    onUpdate: (id: string, data: UpdateEntryPayload) => void;
    onDelete: (id: string) => void;
    onDragStart: (id: string) => void;
    onDragOver: (id: string) => void;
    onDrop: () => void;
    isDragging: boolean;
    isOver: boolean;
}

export default function NoteEntry({ entry, onUpdate, onDelete, onDragStart, onDragOver, onDrop, isDragging, isOver }: Props) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(entry.text);
    const [editingDue, setEditingDue] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const today = localDateString();
    const overdue = !!entry.dueDate && entry.dueDate < today && !entry.done;

    function commitText() {
        const t = draft.trim();
        if (t && t !== entry.text) onUpdate(entry.id, { text: t });
        else setDraft(entry.text);
        setEditing(false);
    }

    function commitDue(val: string) {
        setEditingDue(false);
        onUpdate(entry.id, { dueDate: val || undefined });
    }

    return (
        <Row
            $done={entry.done}
            $dragging={isDragging}
            $over={isOver}
            draggable
            onDragStart={() => onDragStart(entry.id)}
            onDragOver={e => { e.preventDefault(); onDragOver(entry.id); }}
            onDrop={e => { e.preventDefault(); onDrop(); }}
        >
            <DragHandle>⠿</DragHandle>

            <Checkbox
                type="checkbox"
                checked={entry.done}
                onChange={e => onUpdate(entry.id, { done: e.target.checked })}
            />

            <TextArea>
                {editing ? (
                    <EditInput
                        ref={inputRef}
                        autoFocus
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onBlur={commitText}
                        onKeyDown={e => {
                            if (e.key === 'Enter') commitText();
                            if (e.key === 'Escape') { setDraft(entry.text); setEditing(false); }
                        }}
                    />
                ) : (
                    <EntryText $done={entry.done} onDoubleClick={() => setEditing(true)}>
                        {entry.text}
                    </EntryText>
                )}

                {editingDue ? (
                    <DueDateInput
                        type="date"
                        defaultValue={entry.dueDate ?? ''}
                        autoFocus
                        onBlur={e => commitDue(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') commitDue((e.target as HTMLInputElement).value);
                            if (e.key === 'Escape') setEditingDue(false);
                        }}
                    />
                ) : entry.dueDate ? (
                    <DueTag $overdue={overdue} onClick={() => setEditingDue(true)} title="Click to change due date">
                        {overdue ? '⚠ ' : ''}{entry.dueDate}
                    </DueTag>
                ) : null}
            </TextArea>

            <Actions className="entry-actions">
                <ActionBtn title="Set due date" onClick={() => setEditingDue(e => !e)}>◷</ActionBtn>
                <ActionBtn title="Delete entry" onClick={() => onDelete(entry.id)}>✕</ActionBtn>
            </Actions>
        </Row>
    );
}