import React from 'react'
import styled from 'styled-components'
import type { TaskPriority } from '../../types/task'

interface PriorityBadgeProps {
    priority: TaskPriority
    /** When true, renders the compact Roman numeral variant used for subtasks. */
    subtask?: boolean
}

const Badge = styled.span<{ $priority: TaskPriority }>`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme, $priority }) =>
        $priority === 'high'
            ? theme.colors.priorityHigh
            : $priority === 'medium'
                ? theme.colors.priorityMedium
                : theme.colors.priorityLow};
  white-space: nowrap;
`

// Top-level task labels
const TASK_LABELS: Record<TaskPriority, string> = {
    high: '▲ High',
    medium: '▶ Med',
    low: '▽ Low',
}

// Subtask labels — compact Roman numerals, no arrows
const SUBTASK_LABELS: Record<TaskPriority, string> = {
    high: 'I',
    medium: 'II',
    low: 'III',
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, subtask = false }) => (
    <Badge $priority={priority}>
        {subtask ? SUBTASK_LABELS[priority] : TASK_LABELS[priority]}
    </Badge>
)

export default PriorityBadge