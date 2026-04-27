import React, { useState, useCallback, useRef, useEffect } from 'react'
import styled from 'styled-components'
import type { TaskTree, UpdateTaskPayload, CreateTaskPayload, TaskPriority } from '../../types/task'
import StatusBadge, { CYCLE } from './StatusBadge'
import SubTaskItem from './SubTaskItem'
import TaskComposer from './TaskComposer'
import IconButton from '../../components/IconButton'
import { localDateString } from '../../utils/date'

interface TaskItemProps {
    task: TaskTree
    uid: string
    date: string
    onUpdate: (taskId: string, updates: UpdateTaskPayload) => void
    onDelete: (taskId: string) => void
    onCreate: (payload: Omit<CreateTaskPayload, 'parentId' | 'childIds' | 'collapsed'>, parentId?: string) => Promise<void>
    onPromote: (task: TaskTree) => void
    /** Categories available on today's date — used for the "Add to present day" picker. */
    todayCategories: string[]
    /** Called when user confirms copy-to-today with a chosen (or newly created) category. */
    onCopyToToday: (task: TaskTree, category: string) => Promise<void>
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const Wrapper = styled.li`
  border-bottom: 1px solid ${({ theme }) => theme.colors.ruleMid};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  &:last-child { border-bottom: none; }
`

const TopRow = styled.div`
  display:     flex;
  align-items: center;
  gap:         ${({ theme }) => theme.spacing.sm};
  position:    relative;
`

const TitleInput = styled.input`
  flex:          1;
  font-family:   ${({ theme }) => theme.fonts.sansSerif};
  font-size:     ${({ theme }) => theme.fontSizes.body};
  font-weight:   ${({ theme }) => theme.fontWeights.bold};
  color:         ${({ theme }) => theme.colors.inkPrimary};
  background:    transparent;
  border:        none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.ruleMid};
  outline:       none;
  padding:       1px 2px;
  &::placeholder { color: ${({ theme }) => theme.colors.inkMuted}; }
`

const Title = styled.span<{ $done: boolean }>`
  font-family:     ${({ theme }) => theme.fonts.sansSerif};
  font-size:       ${({ theme }) => theme.fontSizes.body};
  font-weight:     ${({ theme }) => theme.fontWeights.bold};
  color:           ${({ theme, $done }) => $done ? theme.colors.inkMuted : theme.colors.inkPrimary};
  text-decoration: ${({ $done }) => $done ? 'line-through' : 'none'};
  flex:            1;
  cursor:          text;
`

const DueBadge = styled.span<{ $overdue: boolean }>`
  display:        inline-flex;
  align-items:    center;
  font-family:    ${({ theme }) => theme.fonts.mono};
  font-size:      10px;
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space:    nowrap;
  padding:        2px 6px;
  border-radius:  2px;
  background-color: ${({ theme, $overdue }) =>
        $overdue ? theme.colors.statusIncomplete : theme.colors.inkPrimary};
  color:            ${({ theme }) => theme.colors.pageBg};
  flex-shrink:      0;
`

const ActionBtn = styled.button`
  display:     inline-flex;
  align-items: center;
  justify-content: center;
  width:       28px;
  height:      28px;
  font-size:   14px;
  color:       ${({ theme }) => theme.colors.inkMuted};
  opacity:     0;
  transition:  opacity ${({ theme }) => theme.transitions.fast},
               color   ${({ theme }) => theme.transitions.fast};
  ${TopRow}:hover & { opacity: 0.55; }
  &:hover { opacity: 1 !important; }
`

const DeleteBtn = styled(ActionBtn)`
  &:hover { color: ${({ theme }) => theme.colors.statusIncomplete}; }
`

const EllipsisBtn = styled(ActionBtn)`
  font-size: 16px;
  letter-spacing: 0.05em;
`

const PrioritySelect = styled.select`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.1em;
  background:     transparent;
  border:         1px solid ${({ theme }) => theme.colors.ruleMid};
  border-radius:  ${({ theme }) => theme.radii.sm};
  padding:        1px 4px;
  cursor:         pointer;
  color: ${({ theme, value }) =>
        value === 'high'
            ? theme.colors.priorityHigh
            : value === 'medium'
                ? theme.colors.priorityMedium
                : theme.colors.priorityLow};
`

const SubList = styled.ul`
  list-style: none;
  margin-top: ${({ theme }) => theme.spacing.xs};
`

const AddSubRow = styled.div`
  padding-left: ${({ theme }) => theme.spacing.xl};
`

// ─── Action Menu ──────────────────────────────────────────────────────────────

const MenuWrap = styled.div`
  position: absolute;
  right:    0;
  top:      calc(100% + 4px);
  z-index:  100;
  background:    ${({ theme }) => theme.colors.pageBg};
  border:        1px solid ${({ theme }) => theme.colors.ruleMid};
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow:    0 4px 12px rgba(0,0,0,0.12);
  min-width:     180px;
  overflow:      hidden;
`

const MenuItem = styled.button`
  display:     block;
  width:       100%;
  text-align:  left;
  padding:     ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
  color:       ${({ theme }) => theme.colors.inkSecondary};
  background:  transparent;
  white-space: nowrap;
  transition:  background ${({ theme }) => theme.transitions.fast},
               color      ${({ theme }) => theme.transitions.fast};
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceBg};
    color:      ${({ theme }) => theme.colors.inkPrimary};
  }
`

const MenuDivider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.ruleLight};
  margin: 0;
`

// ─── Copy-to-today sub-panel ──────────────────────────────────────────────────

const CopyPanel = styled.div`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  border-top: 1px solid ${({ theme }) => theme.colors.ruleLight};
`

const PanelLabel = styled.p`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
  font-style:  italic;
  color:       ${({ theme }) => theme.colors.inkMuted};
  margin:      0;
`

const CatSelect = styled.select`
  font-family:   ${({ theme }) => theme.fonts.sansSerif};
  font-size:     ${({ theme }) => theme.fontSizes.caption};
  background:    ${({ theme }) => theme.colors.surfaceBg};
  border:        1px solid ${({ theme }) => theme.colors.ruleMid};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding:       3px 6px;
  color:         ${({ theme }) => theme.colors.inkPrimary};
  cursor:        pointer;
`

const NewCatInput = styled.input`
  font-family:   ${({ theme }) => theme.fonts.sansSerif};
  font-size:     ${({ theme }) => theme.fontSizes.caption};
  background:    ${({ theme }) => theme.colors.surfaceBg};
  border:        1px solid ${({ theme }) => theme.colors.ruleMid};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding:       3px 6px;
  color:         ${({ theme }) => theme.colors.inkPrimary};
  outline:       none;
  &::placeholder { color: ${({ theme }) => theme.colors.inkMuted}; }
  &:focus { border-color: ${({ theme }) => theme.colors.inkSecondary}; }
`

const ConfirmBtn = styled.button`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.pageBg};
  background:     ${({ theme }) => theme.colors.inkPrimary};
  border-radius:  ${({ theme }) => theme.radii.sm};
  padding:        3px 10px;
  transition:     background ${({ theme }) => theme.transitions.fast};
  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.accent}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`

// ─── Copy helper ──────────────────────────────────────────────────────────────

const cleanText = (s: string) =>
    s.replace(/^[○●✕✓▲▶▽◆◇•\-–—]+\s*/u, '').replace(/\s*[○●✕✓]+$/u, '').trim()

const buildCopyText = (task: TaskTree): string => {
    const lines: string[] = [cleanText(task.title)]
    for (const child of task.children) {
        lines.push(`  • ${cleanText(child.title)}`)
    }
    return lines.join('\n')
}

// ─── Component ────────────────────────────────────────────────────────────────

const NEW_CAT_SENTINEL = '__new__'

const TaskItem: React.FC<TaskItemProps> = ({
    task, uid, date, onUpdate, onDelete, onCreate, onPromote,
    todayCategories, onCopyToToday,
}) => {
    const [showSubComposer, setShowSubComposer] = useState(false)
    const [editingTitle, setEditingTitle] = useState(false)
    const [titleDraft, setTitleDraft] = useState(task.title)
    const titleRef = useRef<HTMLInputElement>(null)

    // ── Action menu state ─────────────────────────────────────────────────────
    const [menuOpen, setMenuOpen] = useState(false)
    const [showCopyPanel, setShowCopyPanel] = useState(false)
    const [selectedCat, setSelectedCat] = useState<string>('')
    const [newCatName, setNewCatName] = useState('')
    const [copying, setCopying] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const newCatRef = useRef<HTMLInputElement>(null)

    const today = localDateString()
    const isDone = task.status === 'complete'
    const isOverdue = !!task.dueDate && task.dueDate < today && !isDone
    const hasChildren = task.children.length > 0
    const isNotToday = date !== today

    // Initialise selectedCat when panel opens
    useEffect(() => {
        if (showCopyPanel) {
            setSelectedCat(todayCategories[0] ?? NEW_CAT_SENTINEL)
            setNewCatName('')
        }
    }, [showCopyPanel, todayCategories])

    // Focus new-cat input when sentinel is selected
    useEffect(() => {
        if (selectedCat === NEW_CAT_SENTINEL) {
            newCatRef.current?.focus()
        }
    }, [selectedCat])

    // Close menu on outside click
    useEffect(() => {
        if (!menuOpen) return
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false)
                setShowCopyPanel(false)
            }
        }
        window.addEventListener('mousedown', handler)
        return () => window.removeEventListener('mousedown', handler)
    }, [menuOpen])

    useEffect(() => { setTitleDraft(task.title) }, [task.title])
    useEffect(() => { if (editingTitle) titleRef.current?.focus() }, [editingTitle])

    const advance = () => onUpdate(task.id, { status: CYCLE[task.status] })
    const handleCollapse = () => onUpdate(task.id, { collapsed: !task.collapsed })

    const commitTitle = () => {
        setEditingTitle(false)
        const trimmed = titleDraft.trim()
        if (trimmed && trimmed !== task.title) {
            onUpdate(task.id, { title: trimmed })
        } else {
            setTitleDraft(task.title)
        }
    }

    const handleTitleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') commitTitle()
        if (e.key === 'Escape') { setTitleDraft(task.title); setEditingTitle(false) }
    }

    const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdate(task.id, { priority: e.target.value as TaskPriority })
    }

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(buildCopyText(task)).catch(console.error)
        setMenuOpen(false)
    }, [task])

    const handleConfirmCopyToToday = async () => {
        const cat = selectedCat === NEW_CAT_SENTINEL ? newCatName.trim() : selectedCat
        if (!cat) return
        setCopying(true)
        try {
            await onCopyToToday(task, cat)
            setMenuOpen(false)
            setShowCopyPanel(false)
        } finally {
            setCopying(false)
        }
    }

    const handleNewCatKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleConfirmCopyToToday()
        if (e.key === 'Escape') { setMenuOpen(false); setShowCopyPanel(false) }
    }

    const resolvedCat = selectedCat === NEW_CAT_SENTINEL ? newCatName.trim() : selectedCat
    const confirmDisabled = copying || !resolvedCat

    return (
        <Wrapper>
            <TopRow>
                {hasChildren ? (
                    <IconButton
                        label={task.collapsed ? 'Expand subtasks' : 'Collapse subtasks'}
                        size="sm"
                        onClick={handleCollapse}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            {task.collapsed
                                ? <polyline points="9 18 15 12 9 6" />
                                : <polyline points="6 9 12 15 18 9" />}
                        </svg>
                    </IconButton>
                ) : (
                    <span style={{ width: 28, flexShrink: 0 }} />
                )}

                <StatusBadge status={task.status} onClick={advance} />

                {task.dueDate && (
                    <DueBadge $overdue={isOverdue}>{task.dueDate}</DueBadge>
                )}

                {editingTitle ? (
                    <TitleInput
                        ref={titleRef}
                        value={titleDraft}
                        onChange={e => setTitleDraft(e.target.value)}
                        onBlur={commitTitle}
                        onKeyDown={handleTitleKey}
                    />
                ) : (
                    <Title $done={isDone} onClick={() => setEditingTitle(true)}>
                        {task.title}
                    </Title>
                )}

                <PrioritySelect value={task.priority} onChange={handlePriorityChange}>
                    <option value="high">▲ High</option>
                    <option value="medium">▶ Med</option>
                    <option value="low">▽ Low</option>
                </PrioritySelect>

                <IconButton
                    label="Add subtask"
                    size="sm"
                    onClick={() => setShowSubComposer(p => !p)}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </IconButton>

                {/* ── Ellipsis menu ── */}
                <EllipsisBtn
                    aria-label="More actions"
                    onClick={e => { e.stopPropagation(); setMenuOpen(p => !p); setShowCopyPanel(false) }}
                >
                    •••
                </EllipsisBtn>

                <DeleteBtn onClick={() => onDelete(task.id)} aria-label="Delete task">✕</DeleteBtn>

                {menuOpen && (
                    <MenuWrap ref={menuRef}>
                        <MenuItem onClick={handleCopy}>⎘ Copy text</MenuItem>
                        {hasChildren && (
                            <MenuItem onClick={() => { onPromote(task); setMenuOpen(false) }}>
                                ⊞ Convert to category
                            </MenuItem>
                        )}
                        {isNotToday && (
                            <>
                                <MenuDivider />
                                <MenuItem onClick={() => setShowCopyPanel(p => !p)}>
                                    ↑ Add to present day…
                                </MenuItem>
                                {showCopyPanel && (
                                    <CopyPanel>
                                        <PanelLabel>Place in today's category:</PanelLabel>
                                        {todayCategories.length > 0 ? (
                                            <CatSelect
                                                value={selectedCat}
                                                onChange={e => setSelectedCat(e.target.value)}
                                            >
                                                {todayCategories.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                                <option value={NEW_CAT_SENTINEL}>+ New category…</option>
                                            </CatSelect>
                                        ) : (
                                            // No categories today — skip straight to new-cat input
                                            <PanelLabel>No categories yet for today. Name one:</PanelLabel>
                                        )}
                                        {(selectedCat === NEW_CAT_SENTINEL || todayCategories.length === 0) && (
                                            <NewCatInput
                                                ref={newCatRef}
                                                value={newCatName}
                                                onChange={e => setNewCatName(e.target.value)}
                                                onKeyDown={handleNewCatKey}
                                                placeholder="Category name…"
                                            />
                                        )}
                                        <ConfirmBtn
                                            onClick={handleConfirmCopyToToday}
                                            disabled={confirmDisabled}
                                        >
                                            {copying ? '…' : 'Send to today'}
                                        </ConfirmBtn>
                                    </CopyPanel>
                                )}
                            </>
                        )}
                    </MenuWrap>
                )}
            </TopRow>

            {!task.collapsed && hasChildren && (
                <SubList>
                    {task.children.map(child => (
                        <SubTaskItem
                            key={child.id}
                            task={child}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                        />
                    ))}
                </SubList>
            )}

            {showSubComposer && (
                <AddSubRow>
                    <TaskComposer
                        uid={uid}
                        category={task.category}
                        date={date}
                        parentId={task.id}
                        onCreated={async (payload, parentId) => {
                            await onCreate(payload, parentId)
                            setShowSubComposer(false)
                        }}
                        placeholder="Add subtask…"
                    />
                </AddSubRow>
            )}
        </Wrapper>
    )
}

export default TaskItem