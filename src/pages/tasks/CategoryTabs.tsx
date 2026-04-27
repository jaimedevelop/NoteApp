import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes, css } from 'styled-components'

interface CategoryTabsProps {
  categories: string[]
  activeCategory: string
  onSelect: (category: string) => void
  onAdd: (name: string) => void
  onRename: (oldName: string, newName: string) => void
  onRemove: (name: string) => void
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(-50%) scale(0.92); }
  to   { opacity: 1; transform: translateX(-50%) scale(1); }
`

// ─── Styled ───────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  display:        flex;
  flex-direction: column;
  gap:            0;
`

const TabRow = styled.div`
  display:        flex;
  align-items:    flex-end;
  gap:            2px;
  border-bottom:  2px solid ${({ theme }) => theme.colors.ruleHeavy};
  overflow-x:     auto;
  min-height:     38px;
`

const TabShell = styled.div<{ $active: boolean }>`
  position:       relative;
  display:        flex;
  align-items:    stretch;
  border-radius:  ${({ theme }) => theme.radii.sm} ${({ theme }) => theme.radii.sm} 0 0;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.inkPrimary : theme.colors.surfaceAlt};
  transition:     background ${({ theme }) => theme.transitions.fast};

  &:hover { background: ${({ theme, $active }) =>
    $active ? theme.colors.inkPrimary : theme.colors.surfaceBg}; }

  &:hover .tab-actions { opacity: 1; pointer-events: auto; }
`

const Tab = styled.button<{ $active: boolean }>`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.byline};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding:        ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.sm}
                  ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  white-space:    nowrap;
  border:         none;
  background:     transparent;
  color: ${({ theme, $active }) => $active ? theme.colors.white : theme.colors.inkSecondary};
  transition:     color ${({ theme }) => theme.transitions.fast};
  &:hover { color: ${({ theme, $active }) => $active ? theme.colors.white : theme.colors.inkPrimary}; }
`

const TabActions = styled.div`
  display:        flex;
  align-items:    center;
  gap:            2px;
  padding-right:  6px;
  opacity:        0;
  pointer-events: none;
  transition:     opacity ${({ theme }) => theme.transitions.fast};
`

const ActionBtn = styled.button<{ $variant?: 'remove' }>`
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           18px;
  height:          18px;
  border:          none;
  border-radius:   2px;
  background:      transparent;
  color: ${({ theme, $variant }) =>
    $variant === 'remove' ? theme.colors.statusIncomplete : theme.colors.inkMuted};
  font-size:       11px;
  line-height:     1;
  opacity:         0.7;
  transition:      all ${({ theme }) => theme.transitions.fast};
  &:hover {
    opacity: 1;
    background: ${({ theme, $variant }) =>
    $variant === 'remove' ? `${theme.colors.statusIncomplete}22` : `${theme.colors.inkPrimary}18`};
    color: ${({ theme, $variant }) =>
    $variant === 'remove' ? theme.colors.statusIncomplete : theme.colors.inkPrimary};
  }
`

const RenameInput = styled.input`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.byline};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background:     transparent;
  border:         none;
  border-bottom:  1px solid ${({ theme }) => theme.colors.white};
  color:          ${({ theme }) => theme.colors.white};
  outline:        none;
  width:          100px;
  padding:        ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.sm}
                  ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  &::selection { background: ${({ theme }) => theme.colors.inkSecondary}; }
`

const AddForm = styled.form`
  display: flex;
  gap:     ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} 0 0;
`

const AddInput = styled.input`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  letter-spacing: 0.05em;
  background:     ${({ theme }) => theme.colors.surfaceBg};
  border:         1px solid ${({ theme }) => theme.colors.ruleMid};
  border-radius:  ${({ theme }) => theme.radii.sm};
  padding:        4px 8px;
  color:          ${({ theme }) => theme.colors.inkPrimary};
  outline:        none;
  width:          160px;
  &::placeholder { color: ${({ theme }) => theme.colors.inkMuted}; font-style: italic; }
`

const AddBtn = styled.button`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.inkSecondary};
  border:         1px solid ${({ theme }) => theme.colors.ruleMid};
  border-radius:  ${({ theme }) => theme.radii.sm};
  padding:        4px 10px;
  transition:     all ${({ theme }) => theme.transitions.fast};
  &:hover { color: ${({ theme }) => theme.colors.inkPrimary}; }
`

const Hint = styled.span`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
  font-style:  italic;
  color:       ${({ theme }) => theme.colors.inkMuted};
  align-self:  center;
  padding:     ${({ theme }) => theme.spacing.sm} 0 0;
  margin-left: ${({ theme }) => theme.spacing.xs};
`

// Invisible full-screen layer that catches outside clicks to dismiss.
// Sits below the popover (z-index 9998 vs 9999) so clicks on the
// popover itself reach the popover's own buttons, not this overlay.
const Overlay = styled.div`
  position: fixed;
  inset:    0;
  z-index:  9998;
`

const ConfirmPopover = styled.div<{ $x: number; $y: number }>`
  position:      fixed;
  left:          ${p => p.$x}px;
  top:           ${p => p.$y}px;
  transform:     translateX(-50%);
  z-index:       9999;
  background:    ${({ theme }) => theme.colors.inkPrimary};
  border:        1px solid ${({ theme }) => theme.colors.ruleHeavy};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding:       8px 10px;
  white-space:   nowrap;
  box-shadow:    0 4px 16px rgba(0,0,0,0.35);
  animation:     ${fadeIn} 120ms ease forwards;
`

const ConfirmText = styled.p`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
  font-style:  italic;
  color:       ${({ theme }) => theme.colors.white};
  margin:      0 0 6px;
`

const ConfirmRow = styled.div`
  display:         flex;
  gap:             6px;
  justify-content: center;
`

const ConfirmBtn = styled.button<{ $danger?: boolean }>`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding:        3px 8px;
  border-radius:  2px;
  border:         1px solid;
  transition:     all ${({ theme }) => theme.transitions.fast};
  ${({ theme, $danger }) => $danger ? css`
    color:        ${theme.colors.statusIncomplete};
    border-color: ${theme.colors.statusIncomplete};
    background:   transparent;
    &:hover { background: ${theme.colors.statusIncomplete}; color: ${theme.colors.white}; }
  ` : css`
    color:        ${theme.colors.inkMuted};
    border-color: ${theme.colors.inkSecondary};
    background:   transparent;
    &:hover { color: ${theme.colors.white}; border-color: ${theme.colors.white}; }
  `}
`

// ─── Sub-component: single tab ────────────────────────────────────────────────

interface TabItemProps {
  name: string
  active: boolean
  onSelect: () => void
  onRename: (newName: string) => void
  onRemove: () => void
}

const TabItem: React.FC<TabItemProps> = ({ name, active, onSelect, onRename, onRemove }) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const [confirmPos, setConfirmPos] = useState<{ x: number; y: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (editing) inputRef.current?.select() }, [editing])

  const openConfirm = (e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setConfirmPos({ x: rect.left + rect.width / 2, y: rect.bottom + 8 })
  }

  const commitRename = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== name) onRename(trimmed)
    else setDraft(name)
    setEditing(false)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); commitRename() }
    if (e.key === 'Escape') { setDraft(name); setEditing(false) }
  }

  return (
    <TabShell ref={shellRef} $active={active}>
      {editing ? (
        <RenameInput
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleRenameKeyDown}
        />
      ) : (
        <Tab role="tab" aria-selected={active} $active={active} onClick={onSelect}>
          {name}
        </Tab>
      )}

      {!editing && (
        <TabActions className="tab-actions">
          <ActionBtn
            title="Rename column"
            onClick={e => { e.stopPropagation(); setDraft(name); setEditing(true) }}
          >✎</ActionBtn>
          <ActionBtn $variant="remove" title="Remove column" onClick={openConfirm}>
            ✕
          </ActionBtn>
        </TabActions>
      )}

      {confirmPos && createPortal(
        <>
          {/* Overlay dismisses on click outside the popover */}
          <Overlay onClick={() => setConfirmPos(null)} />
          <ConfirmPopover $x={confirmPos.x} $y={confirmPos.y}>
            <ConfirmText>Remove "{name}" and all its tasks?</ConfirmText>
            <ConfirmRow>
              <ConfirmBtn onClick={() => setConfirmPos(null)}>Cancel</ConfirmBtn>
              <ConfirmBtn $danger onClick={() => { setConfirmPos(null); onRemove() }}>
                Remove
              </ConfirmBtn>
            </ConfirmRow>
          </ConfirmPopover>
        </>,
        document.body
      )}
    </TabShell>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories, activeCategory, onSelect, onAdd, onRename, onRemove,
}) => {
  const [newName, setNewName] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newName.trim()
    if (trimmed && !categories.includes(trimmed)) { onAdd(trimmed); setNewName('') }
  }

  return (
    <Wrapper>
      <TabRow role="tablist">
        {categories.map(cat => (
          <TabItem
            key={cat}
            name={cat}
            active={cat === activeCategory}
            onSelect={() => onSelect(cat)}
            onRename={n => onRename(cat, n)}
            onRemove={() => onRemove(cat)}
          />
        ))}
      </TabRow>

      <AddForm onSubmit={handleAdd}>
        <AddInput
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Open a new column…"
        />
        <AddBtn type="submit">+ Add</AddBtn>
        {categories.length === 0 && <Hint>No columns yet — open one to begin.</Hint>}
      </AddForm>
    </Wrapper>
  )
}

export default CategoryTabs