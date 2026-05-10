import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

// ── Styled ──────────────────────────────────────────────────────────────────

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  margin-left: 4px;
  background: none;
  border: none;
  border-radius: 3px;
  font-size: 13px;
  line-height: 1;
  color: inherit;
  opacity: 0.45;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.08);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9998;
`;

const Menu = styled.div`
  position: fixed;
  z-index: 9999;
  background: ${p => p.theme.colors.pageBg};
  border: 1px solid ${p => p.theme.colors.inkMuted};
  border-radius: 4px;
  box-shadow: ${p => p.theme.shadows.card};
  display: flex;
  flex-direction: column;
  min-width: 120px;
  overflow: hidden;
`;

const RenameForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid ${p => p.theme.colors.inkMuted};
`;

const RenameInput = styled.input`
  font-family: ${p => p.theme.fonts.serif};
  font-size: 12px;
  padding: 4px 7px;
  background: ${p => p.theme.colors.pageBg};
  border: 1px solid ${p => p.theme.colors.inkMuted};
  border-radius: 3px;
  color: ${p => p.theme.colors.inkPrimary};
  outline: none;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    border-color: ${p => p.theme.colors.inkSecondary};
  }
`;

const RenameActions = styled.div`
  display: flex;
  gap: 4px;
`;

const SmallBtn = styled.button<{ $primary?: boolean }>`
  flex: 1;
  font-family: ${p => p.theme.fonts.serif};
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 3px;
  cursor: pointer;
  border: 1px solid ${p => p.theme.colors.inkMuted};
  background: ${p => p.$primary ? p.theme.colors.inkPrimary : 'transparent'};
  color: ${p => p.$primary ? p.theme.colors.pageBg : p.theme.colors.inkSecondary};

  &:hover { opacity: 0.8; }
`;

const MenuBtn = styled.button<{ $danger?: boolean }>`
  font-family: ${p => p.theme.fonts.serif};
  font-size: 12px;
  padding: 8px 12px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: ${p => p.$danger ? p.theme.colors.statusIncomplete : p.theme.colors.inkPrimary};

  &:hover {
    background: ${p => p.$danger ? p.theme.colors.statusIncompleteBg : p.theme.colors.surfaceBg};
  }
`;

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
    listId: string;
    listName: string;
    onRename: (id: string, name: string) => void;
    onDelete: (id: string) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function NotebookTabOptions({ listId, listName, onRename, onDelete }: Props) {
    const [open, setOpen] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [draft, setDraft] = useState('');
    const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus rename input when the rename section appears
    useEffect(() => {
        if (renaming) {
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [renaming]);

    function handleTriggerClick(e: React.MouseEvent) {
        e.stopPropagation(); // don't propagate to the Tab (which calls onSelect)
        if (open) {
            close();
            return;
        }
        const rect = triggerRef.current!.getBoundingClientRect();
        setMenuPos({ top: rect.bottom + 6, left: rect.left });
        setDraft(listName);
        setRenaming(false);
        setOpen(true);
    }

    function close() {
        setOpen(false);
        setRenaming(false);
    }

    function handleStartRename() {
        setDraft(listName);
        setRenaming(true);
    }

    function commitRename() {
        const name = draft.trim();
        if (name && name !== listName) onRename(listId, name);
        close();
    }

    function handleDelete() {
        onDelete(listId);
        close();
    }

    return (
        <>
            <Trigger
                ref={triggerRef}
                onClick={handleTriggerClick}
                title="List options"
                tabIndex={-1}
            >
                ⋯
            </Trigger>

            {open && menuPos && createPortal(
                <>
                    <Overlay onMouseDown={close} />
                    <Menu
                        style={{ top: menuPos.top, left: menuPos.left }}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        {renaming ? (
                            <RenameForm>
                                <RenameInput
                                    ref={inputRef}
                                    value={draft}
                                    onChange={e => setDraft(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') commitRename();
                                        if (e.key === 'Escape') close();
                                    }}
                                    placeholder="List name…"
                                />
                                <RenameActions>
                                    <SmallBtn $primary onClick={commitRename}>Save</SmallBtn>
                                    <SmallBtn onClick={close}>Cancel</SmallBtn>
                                </RenameActions>
                            </RenameForm>
                        ) : (
                            <MenuBtn onClick={handleStartRename}>✎ Rename</MenuBtn>
                        )}
                        <MenuBtn $danger onClick={handleDelete}>✕ Delete</MenuBtn>
                    </Menu>
                </>,
                document.body
            )}
        </>
    );
}