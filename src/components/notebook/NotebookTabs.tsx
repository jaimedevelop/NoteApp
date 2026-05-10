import { useState, useRef } from 'react';
import styled from 'styled-components';
import type { NotebookList } from '../../types/notebook';
import NotebookTabOptions from './NotebookTabOptions';

// ── Styled ─────────────────────────────────────────────────────────────────────

const ScrollTrack = styled.div`
  overflow-x: auto;
  overflow-y: visible;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  flex-shrink: 0;
`;

const TabStrip = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 3px;
  padding: 0 12px;
`;

const Tab = styled.button<{ $active: boolean; $color: string }>`
  flex-shrink: 0;
  padding: 5px 10px 7px;
  background: ${p => p.$active ? p.theme.colors.pageBg : p.$color};
  border: 1.5px solid ${p => p.theme.colors.inkMuted};
  border-bottom: ${p => p.$active ? `2px solid ${p.theme.colors.pageBg}` : `1.5px solid ${p.theme.colors.inkMuted}`};
  border-radius: 5px 5px 0 0;
  font-family: ${p => p.theme.fonts.serif};
  font-size: 11px;
  font-weight: ${p => p.$active ? 700 : 400};
  color: ${p => p.$active ? p.theme.colors.inkPrimary : p.theme.colors.inkSecondary};
  cursor: pointer;
  position: relative;
  bottom: ${p => p.$active ? '-1px' : '0'};
  transition: background 0.15s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover { background: ${p => p.$active ? p.theme.colors.pageBg : '#e8e0ce'}; }
`;

const AddTabBtn = styled.button`
  flex-shrink: 0;
  padding: 5px 10px 7px;
  background: transparent;
  border: 1.5px dashed ${p => p.theme.colors.inkMuted};
  border-bottom: none;
  border-radius: 5px 5px 0 0;
  font-size: 14px;
  color: ${p => p.theme.colors.inkMuted};
  cursor: pointer;
  line-height: 1;
  transition: color 0.15s, border-color 0.15s;

  &:hover { color: ${p => p.theme.colors.inkSecondary}; border-color: ${p => p.theme.colors.inkSecondary}; }
`;

const TabDivider = styled.div`
  height: 1.5px;
  background: ${p => p.theme.colors.inkMuted};
  margin: 0 12px;
  flex-shrink: 0;
`;

const AddForm = styled.div`
  display: flex;
  gap: 4px;
  padding: 6px 12px;
  flex-shrink: 0;
  align-items: center;
`;

const AddInput = styled.input`
  flex: 1;
  font-family: ${p => p.theme.fonts.serif};
  font-size: 12px;
  padding: 4px 8px;
  background: ${p => p.theme.colors.pageBg};
  border: 1px solid ${p => p.theme.colors.inkMuted};
  border-radius: 3px;
  color: ${p => p.theme.colors.inkPrimary};
  outline: none;
  &:focus { border-color: ${p => p.theme.colors.inkSecondary}; }
`;

const SmallBtn = styled.button<{ $variant?: 'primary' | 'ghost' }>`
  font-family: ${p => p.theme.fonts.serif};
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 3px;
  cursor: pointer;
  white-space: nowrap;
  border: ${p => p.$variant === 'ghost' ? `1px solid ${p.theme.colors.inkMuted}` : 'none'};
  background: ${p => p.$variant === 'ghost' ? 'transparent' : p.theme.colors.inkPrimary};
  color: ${p => p.$variant === 'ghost' ? p.theme.colors.inkSecondary : p.theme.colors.pageBg};

  &:hover { opacity: 0.8; }
`;

// ── Tab colours ────────────────────────────────────────────────────────────────

const TAB_COLORS = [
    '#d4c9a8', '#c9b99a', '#bfcdb8', '#c2b8cc',
    '#c9b8a8', '#b8c4c0', '#d4bfa8', '#c4c2b0',
];

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
    lists: NotebookList[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onAdd: (name: string) => void;
    onDelete: (id: string) => void;
    onRename: (id: string, name: string) => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function NotebookTabs({ lists, activeId, onSelect, onAdd, onDelete, onRename }: Props) {
    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    function handleAdd() {
        const name = draft.trim();
        if (name) { onAdd(name); setDraft(''); setAdding(false); }
    }

    function cancelAdd() { setDraft(''); setAdding(false); }

    return (
        <>
            <ScrollTrack>
                <TabStrip>
                    {lists.map((l, i) => (
                        <Tab
                            key={l.id}
                            $active={l.id === activeId}
                            $color={TAB_COLORS[i % TAB_COLORS.length]}
                            onClick={() => onSelect(l.id)}
                        >
                            {l.name}
                            <NotebookTabOptions
                                listId={l.id}
                                listName={l.name}
                                onRename={onRename}
                                onDelete={onDelete}
                            />
                        </Tab>
                    ))}

                    <AddTabBtn
                        onClick={() => { setAdding(a => !a); setTimeout(() => inputRef.current?.focus(), 50); }}
                        title="New list"
                    >
                        {adding ? '×' : '+'}
                    </AddTabBtn>
                </TabStrip>
            </ScrollTrack>

            {adding && (
                <AddForm>
                    <AddInput
                        ref={inputRef}
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        placeholder="List name…"
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleAdd();
                            if (e.key === 'Escape') cancelAdd();
                        }}
                    />
                    <SmallBtn onClick={handleAdd}>Open</SmallBtn>
                    <SmallBtn $variant="ghost" onClick={cancelAdd}>Cancel</SmallBtn>
                </AddForm>
            )}

            <TabDivider />
        </>
    );
}