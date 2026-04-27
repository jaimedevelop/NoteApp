import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import type { TaskPriority, CreateTaskPayload } from '../../types/task'

interface TaskComposerProps {
    uid: string
    category: string
    date: string
    parentId?: string
    onCreated: (
        payload: Omit<CreateTaskPayload, 'parentId' | 'childIds' | 'collapsed'>,
        parentId?: string
    ) => Promise<void>
    placeholder?: string
    /** When true, the text input will auto-focus on mount (e.g. subtask composer). */
    autoFocus?: boolean
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const Form = styled.div`
  display:        flex;
  flex-direction: column;
  gap:            ${({ theme }) => theme.spacing.sm};
  border-top:     1px solid ${({ theme }) => theme.colors.ruleLight};
  padding-top:    ${({ theme }) => theme.spacing.md};
  margin-top:     ${({ theme }) => theme.spacing.md};
`

const Row = styled.div`
  display: flex;
  gap:     ${({ theme }) => theme.spacing.sm};
`

const TitleInput = styled.input`
  flex:          1;
  background:    ${({ theme }) => theme.colors.surfaceBg};
  border:        1px solid ${({ theme }) => theme.colors.ruleMid};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding:       ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-family:   ${({ theme }) => theme.fonts.sansSerif};
  font-size:     ${({ theme }) => theme.fontSizes.body};
  color:         ${({ theme }) => theme.colors.inkPrimary};
  outline:       none;
  transition:    border-color ${({ theme }) => theme.transitions.fast};

  &::placeholder { color: ${({ theme }) => theme.colors.inkMuted}; }
  &:focus        { border-color: ${({ theme }) => theme.colors.ruleMid}; }
`

const Select = styled.select`
  background:    ${({ theme }) => theme.colors.surfaceBg};
  border:        1px solid ${({ theme }) => theme.colors.ruleMid};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding:       ${({ theme }) => theme.spacing.sm};
  font-family:   ${({ theme }) => theme.fonts.serif};
  font-size:     ${({ theme }) => theme.fontSizes.caption};
  color:         ${({ theme }) => theme.colors.inkSecondary};
  cursor:        pointer;
`

const DateInput = styled(TitleInput).attrs({ type: 'date' })`
  flex:        0 0 auto;
  width:       150px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
`

const AddBtn = styled.button`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.white};
  background:     ${({ theme }) => theme.colors.inkPrimary};
  border:         2px solid ${({ theme }) => theme.colors.inkPrimary};
  border-radius:  ${({ theme }) => theme.radii.sm};
  padding:        ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  white-space:    nowrap;
  transition:     background ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    background:   ${({ theme }) => theme.colors.accent};
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:disabled { opacity: 0.4; cursor: not-allowed; }
`

// ─── Priority options ─────────────────────────────────────────────────────────

// Top-level tasks use High / Medium / Low
const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
]

// Subtasks use Roman numeral tiers (I = most urgent)
const SUBTASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
    { value: 'high', label: 'I' },
    { value: 'medium', label: 'II' },
    { value: 'low', label: 'III' },
]

// ─── Component ────────────────────────────────────────────────────────────────

const TaskComposer: React.FC<TaskComposerProps> = ({
    uid: _uid, category, date, parentId, onCreated, placeholder, autoFocus,
}) => {
    const [title, setTitle] = useState('')
    const [priority, setPriority] = useState<TaskPriority>('medium')
    const [dueDate, setDueDate] = useState('')
    const [pending, setPending] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Auto-focus when the composer mounts (subtask toggle) or when autoFocus prop is set
    useEffect(() => {
        if (autoFocus || parentId) {
            inputRef.current?.focus()
        }
    }, [autoFocus, parentId])

    const handleAdd = async () => {
        if (!title.trim() || pending) return
        setPending(true)
        const payload = {
            title: title.trim(),
            status: 'pending' as const,
            priority,
            category,
            dueDate: dueDate || null,
            date,
        }
        setTitle('')
        setDueDate('')
        await onCreated(payload, parentId)
        setPending(false)
        // Re-focus after submission so the user can keep adding tasks quickly
        inputRef.current?.focus()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAdd()
    }

    const priorityOptions = parentId ? SUBTASK_PRIORITY_OPTIONS : TASK_PRIORITY_OPTIONS

    return (
        <Form>
            <Row>
                <TitleInput
                    ref={inputRef}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder ?? (parentId ? 'Add subtask…' : 'Add task…')}
                />
                <Select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}>
                    {priorityOptions.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </Select>
            </Row>
            <Row>
                <DateInput
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    title="Due date (optional)"
                />
                <AddBtn onClick={handleAdd} disabled={pending || !title.trim()}>
                    {pending ? '…' : parentId ? '+ Sub' : '+ Add'}
                </AddBtn>
            </Row>
        </Form>
    )
}

export default TaskComposer