import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import type { Task, UpdateTaskPayload, TaskPriority } from '../../types/task'
import StatusBadge, { CYCLE } from './StatusBadge'
import { localDateString } from '../../utils/date'

interface SubTaskItemProps {
  task: Task
  onUpdate: (taskId: string, updates: UpdateTaskPayload) => void
  onDelete: (taskId: string) => void
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const Row = styled.li`
  display:     flex;
  align-items: center;
  gap:         ${({ theme }) => theme.spacing.sm};
  padding:     ${({ theme }) => theme.spacing.xs} 0
               ${({ theme }) => theme.spacing.xs}
               ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.ruleLight};
  &:last-child { border-bottom: none; }
`

const IndentRule = styled.span`
  width:       1px;
  height:      16px;
  background:  ${({ theme }) => theme.colors.ruleLight};
  flex-shrink: 0;
  margin-left: -${({ theme }) => theme.spacing.md};
`

const Title = styled.span<{ $done: boolean }>`
  font-family:     ${({ theme }) => theme.fonts.sansSerif};
  font-size:       ${({ theme }) => theme.fontSizes.body};
  font-weight:     ${({ theme }) => theme.fontWeights.regular};
  color:           ${({ theme, $done }) => $done ? theme.colors.inkMuted : theme.colors.inkPrimary};
  text-decoration: ${({ $done }) => $done ? 'line-through' : 'none'};
  flex:            1;
  cursor:          text;
`

const TitleInput = styled.input`
  flex:          1;
  font-family:   ${({ theme }) => theme.fonts.sansSerif};
  font-size:     ${({ theme }) => theme.fontSizes.body};
  font-weight:   ${({ theme }) => theme.fontWeights.regular};
  color:         ${({ theme }) => theme.colors.inkPrimary};
  background:    transparent;
  border:        none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.ruleMid};
  outline:       none;
  padding:       1px 2px;
`

const DueBadge = styled.span<{ $overdue: boolean }>`
  display:          inline-flex;
  align-items:      center;
  font-family:      ${({ theme }) => theme.fonts.mono};
  font-size:        9px;
  font-weight:      ${({ theme }) => theme.fontWeights.bold};
  letter-spacing:   0.06em;
  text-transform:   uppercase;
  white-space:      nowrap;
  padding:          1px 5px;
  border-radius:    2px;
  background-color: ${({ theme, $overdue }) =>
    $overdue ? theme.colors.statusIncomplete : theme.colors.inkPrimary};
  color:            ${({ theme }) => theme.colors.pageBg};
  flex-shrink:      0;
`

const PrioritySelect = styled.select`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  background:     transparent;
  border:         1px solid ${({ theme }) => theme.colors.ruleLight};
  border-radius:  ${({ theme }) => theme.radii.sm};
  padding:        1px 3px;
  cursor:         pointer;
  color: ${({ theme, value }) =>
    value === 'high'
      ? theme.colors.priorityHigh
      : value === 'medium'
        ? theme.colors.priorityMedium
        : theme.colors.priorityLow};
`

const DeleteBtn = styled.button`
  font-size:  11px;
  color:      ${({ theme }) => theme.colors.inkMuted};
  opacity:    0;
  transition: opacity ${({ theme }) => theme.transitions.fast};
  ${Row}:hover & { opacity: 1; }
  &:hover { color: ${({ theme }) => theme.colors.statusIncomplete}; }
`

// ─── Component ────────────────────────────────────────────────────────────────

const SubTaskItem: React.FC<SubTaskItemProps> = ({ task, onUpdate, onDelete }) => {
  const today = localDateString()
  const isDone = task.status === 'complete'
  const isOverdue = !!task.dueDate && task.dueDate < today && !isDone

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(task.title)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setTitleDraft(task.title) }, [task.title])
  useEffect(() => { if (editingTitle) titleRef.current?.focus() }, [editingTitle])

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

  return (
    <Row>
      <IndentRule />
      <StatusBadge
        status={task.status}
        onClick={() => onUpdate(task.id, { status: CYCLE[task.status] })}
      />
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
        <option value="high">I</option>
        <option value="medium">II</option>
        <option value="low">III</option>
      </PrioritySelect>
      <DeleteBtn onClick={() => onDelete(task.id)} aria-label="Delete subtask">✕</DeleteBtn>
    </Row>
  )
}

export default SubTaskItem