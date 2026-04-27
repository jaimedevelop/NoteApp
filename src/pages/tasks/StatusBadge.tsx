import React from 'react'
import styled from 'styled-components'
import type { TaskStatus } from '../../types/task'

interface StatusBadgeProps {
    status: TaskStatus
    onClick?: () => void   // if provided, renders as a clickable cycle button
}

// Maps status → next status in the cycle: pending → in_progress → complete → incomplete → pending
const CYCLE: Record<TaskStatus, TaskStatus> = {
    pending: 'in_progress',
    in_progress: 'complete',
    complete: 'incomplete',
    incomplete: 'pending',
}

const LABELS: Record<TaskStatus, string> = {
    pending: '○',
    in_progress: '◑',
    complete: '●',
    incomplete: '✕',
}

const Dot = styled.button<{ $status: TaskStatus; $clickable: boolean }>`
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  width:           22px;
  height:          22px;
  border-radius:   50%;
  border:          none;
  flex-shrink:     0;
  font-size:       13px;
  line-height:     1;
  cursor:          ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition:      background ${({ theme }) => theme.transitions.fast},
                   color      ${({ theme }) => theme.transitions.fast};

  background-color: ${({ theme, $status }) => {
        if ($status === 'complete') return theme.colors.statusCompleteBg
        if ($status === 'in_progress') return theme.colors.statusInProgressBg
        if ($status === 'incomplete') return theme.colors.statusIncompleteBg
        return theme.colors.surfaceAlt
    }};

  color: ${({ theme, $status }) => {
        if ($status === 'complete') return theme.colors.statusComplete
        if ($status === 'in_progress') return theme.colors.statusInProgress
        if ($status === 'incomplete') return theme.colors.statusIncomplete
        return theme.colors.inkMuted
    }};

  &:hover {
    filter: ${({ $clickable }) => ($clickable ? 'brightness(0.92)' : 'none')};
  }
`

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, onClick }) => (
    <Dot
        $status={status}
        $clickable={!!onClick}
        title={status.replace('_', ' ')}
        aria-label={`Status: ${status}. ${onClick ? 'Click to advance.' : ''}`}
        onClick={onClick}
    >
        {LABELS[status]}
    </Dot>
)

export { CYCLE }
export default StatusBadge