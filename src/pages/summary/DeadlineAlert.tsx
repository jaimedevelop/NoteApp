import React from 'react'
import styled from 'styled-components'
import type { Task } from '../../types/task'

interface DeadlineAlertProps {
    tasks: Task[]       // overdue or due-today tasks, passed from Summary
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const Banner = styled.div`
  border:           2px solid ${({ theme }) => theme.colors.statusIncomplete};
  background-color: ${({ theme }) => theme.colors.statusIncompleteBg};
  padding:          ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
`

const HeadRow = styled.div`
  display:     flex;
  align-items: center;
  gap:         ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const AlertLabel = styled.span`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.statusIncomplete};
`

const List = styled.ul`
  list-style: none;
  display:    flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

const Entry = styled.li`
  display:     flex;
  align-items: baseline;
  gap:         ${({ theme }) => theme.spacing.sm};
`

const Dash = styled.span`
  font-family: ${({ theme }) => theme.fonts.serif};
  color:       ${({ theme }) => theme.colors.statusIncomplete};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`

const TaskTitle = styled.span`
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size:   ${({ theme }) => theme.fontSizes.body};
  color:       ${({ theme }) => theme.colors.inkPrimary};
  flex: 1;
`

const DueChip = styled.span`
  font-family:    ${({ theme }) => theme.fonts.mono};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  color:          ${({ theme }) => theme.colors.statusIncomplete};
  letter-spacing: 0.04em;
  white-space:    nowrap;
`

// ─── Component ────────────────────────────────────────────────────────────────

const DeadlineAlert: React.FC<DeadlineAlertProps> = ({ tasks }) => {
    if (tasks.length === 0) return null

    return (
        <Banner role="alert">
            <HeadRow>
                <AlertLabel>⚑ Deadlines Requiring Attention</AlertLabel>
            </HeadRow>
            <List>
                {tasks.map(task => (
                    <Entry key={task.id}>
                        <Dash>—</Dash>
                        <TaskTitle>{task.title}</TaskTitle>
                        {task.dueDate && (
                            <DueChip>due {task.dueDate}</DueChip>
                        )}
                    </Entry>
                ))}
            </List>
        </Banner>
    )
}

export default DeadlineAlert