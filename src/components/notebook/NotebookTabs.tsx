import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import type { NotebookList } from '../../types/notebook';

// ── Styled ─────────────────────────────────────────────────────────────────────

// ScrollTrack handles horizontal scroll WITHOUT clipping vertically,
// so the Menu dropdown can overflow below the tab strip.
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
  /* No overflow here — clipping was the root cause of bug #4 */
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

const SmallBtn = styled.button<{ $variant?: 'primary' | 'ghost' | 'danger' }>`
  font-family: ${p => p.theme.fonts.serif};
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 3px;
  cursor: pointer;
  white-space: nowrap;
  border: ${p => p.$variant === 'ghost' || p.$variant === 'danger' ? `1px solid ${p.theme.colors.inkMuted}` : 'none'};
  background: ${p =>
        p.$variant === 'danger' ? p.theme.colors.statusIncompleteBg :
            p.$variant === 'ghost' ? 'transparent' :
                p.theme.colors.inkPrimary};
  color: ${p =>
        p.$variant === 'danger' ? p.theme.colors.statusIncomplete :
            p.$variant === 'ghost' ? p.theme.colors.inkSecondary :
                p.theme.colors.pageBg};

  &:hover { opacity: 0.8; }
`;

const MenuTrigger = styled.button`
  background: none;
  border: none;
  padding: 0 2px;
  margin: 0;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  color: inherit;
  opacity: 0.55;
  display: flex;
  align-items: center;

  &:hover { opacity: 1; }
`;

const TabEditInput = styled.input`
  width: 80px;
  font: inherit;
  border: none;
  background: transparent;
  outline: none;
  color: inherit;
`;

// TabWrap must be position:relative so the Menu can anchor to it.
// Crucially it must NOT have overflow:hidden.
const TabWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

// z-index raised above Panel's internal content.
// Because Panel is a fixed stacking context (z-index:299), this z-index
// is relative to other children of Panel — 400 is plenty to clear the
// tab strip and note list below it.
const Menu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 400;
  background: ${p => p.theme.colors.pageBg};
  border: 1px solid ${p => p.theme.colors.inkMuted};
  border-radius: 4px;
  box-shadow: ${p => p.theme.shadows.card};
  display: flex;
  flex-direction: column;
  min-width: 110px;
  overflow: hidden;
`;

const MenuItem = styled.button<{ $danger?: boolean }>`
  font-family: ${p => p.theme.fonts.serif};
  font-size: 12px;
  padding: 7px 12px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: ${p => p.$danger ? p.theme.colors.statusIncomplete : p.theme.colors.inkPrimary};

  &:hover {
    background: ${p => p.$danger ? p.theme.colors.statusIncompleteBg : p.theme.colors.surfaceBg};
  }
`;

// ── Tab colours ────────────────────────────────────────────────────────────────

const TAB_COLORS = [
    '#d4c9a8', '#c9b99a', '#bfcdb8', '#c2b8cc',
    '#c9b8a8', '#b8c4c0', '#d4bfa8', '#c4c2b0',
];

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
    lists: NotebookList[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onAdd: (name: string) => void;
    onDelete: (id: string) => void;
    onRename: (id: string, name: string) => void;
}

export default function NotebookTabs({ lists, activeId, onSelect, onAdd, onDelete, onRename }: Props) {
    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState('');
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameDraft, setRenameDraft] = useState('');
    const [menuId, setMenuId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close menu on outside click
    useEffect(() => {
        if (!menuId) return;
        // Use mousedown so it fires before the next click event
        const handler = (_e: MouseEvent) => {
            // If the click target is inside a TabWrap that owns the menu, ignore it
            // (the MenuTrigger's stopPropagation handles that case already)
            setMenuId(null);
        };
        // Slight delay so the MenuTrigger's own stopPropagation fires first
        const id = setTimeout(() => window.addEventListener('mousedown', handler), 0);
        return () => {
            clearTimeout(id);
            window.removeEventListener('mousedown', handler);
        };
    }, [menuId]);

    function handleAdd(e?: React.FormEvent) {
        e?.preventDefault();
        const name = draft.trim();
        if (name) { onAdd(name); setDraft(''); setAdding(false); }
    }

    function cancelAdd() { setDraft(''); setAdding(false); }

    function startRename(l: NotebookList) {
        setMenuId(null);
        setRenamingId(l.id);
        setRenameDraft(l.name);
    }

    function commitRename(id: string) {
        const name = renameDraft.trim();
        if (name) onRename(id, name);
        else setRenameDraft(lists.find(l => l.id === id)?.name ?? '');
        setRenamingId(null);
    }

    function handleDelete(id: string) {
        setMenuId(null);
        onDelete(id);
    }

    return (
        <>
            {/* ScrollTrack scrolls x but stays overflow-y:visible so Menu isn't clipped */}
            <ScrollTrack>
                <TabStrip>
                    {lists.map((l, i) => (
                        <TabWrap key={l.id}>
                            <Tab
                                $active={l.id === activeId}
                                $color={TAB_COLORS[i % TAB_COLORS.length]}
                                onClick={() => { onSelect(l.id); }}
                            >
                                {renamingId === l.id ? (
                                    <TabEditInput
                                        autoFocus
                                        value={renameDraft}
                                        onChange={e => setRenameDraft(e.target.value)}
                                        onBlur={() => commitRename(l.id)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') commitRename(l.id);
                                            if (e.key === 'Escape') setRenamingId(null);
                                        }}
                                        onClick={e => e.stopPropagation()}
                                    />
                                ) : (
                                    <>
                                        {l.name}
                                        {l.id === activeId && (
                                            <MenuTrigger
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    setMenuId(id => id === l.id ? null : l.id);
                                                }}
                                                title="Rename or delete"
                                            >⋯</MenuTrigger>
                                        )}
                                    </>
                                )}
                            </Tab>

                            {menuId === l.id && (
                                <Menu onMouseDown={e => e.stopPropagation()}>
                                    <MenuItem onClick={() => startRename(l)}>✎ Rename</MenuItem>
                                    <MenuItem $danger onClick={() => handleDelete(l.id)}>✕ Delete</MenuItem>
                                </Menu>
                            )}
                        </TabWrap>
                    ))}

                    <AddTabBtn
                        onClick={() => { setMenuId(null); setAdding(a => !a); setTimeout(() => inputRef.current?.focus(), 50); }}
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