import React from 'react'
import styled from 'styled-components'
import type { Task } from '../../types/task'
import SectionHeader from '../../components/SectionHeader'
import RuleDivider from '../../components/RuleDivider'

interface PriorityRemindersProps {
    tasks: Task[]
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const List = styled.ul`
  list-style: none;
  display:    flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const Item = styled.li<{ $priority: Task['priority'] }>`
  display:      flex;
  align-items:  center;
  gap:          ${({ theme }) => theme.spacing.md};
  padding:      ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.ruleLight};

  &:last-child { border-bottom: none; }
`

const Bullet = styled.span<{ $priority: Task['priority'] }>`
  width:  8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: ${({ theme, $priority }) =>
        $priority === 'high'
            ? theme.colors.priorityHigh
            : $priority === 'medium'
                ? theme.colors.priorityMedium
                : theme.colors.priorityLow};
`

const Title = styled.span<{ $done: boolean }>`
  font-family:     ${({ theme }) => theme.fonts.sansSerif};
  font-size:       ${({ theme }) => theme.fontSizes.body};
  color:           ${({ theme, $done }) =>
        $done ? theme.colors.inkMuted : theme.colors.inkPrimary};
  text-decoration: ${({ $done }) => ($done ? 'line-through' : 'none')};
  flex: 1;
`

const CategoryTag = styled.span`
  font-family:    ${({ theme }) => theme.fonts.mono};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  color:          ${({ theme }) => theme.colors.inkMuted};
  letter-spacing: 0.05em;
  white-space:    nowrap;
`

const Empty = styled.p`
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-style:  italic;
  color:       ${({ theme }) => theme.colors.inkMuted};
  font-size:   ${({ theme }) => theme.fontSizes.body};
  text-align:  center;
  padding:     ${({ theme }) => theme.spacing.md} 0;
`

// ─── Component ────────────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<Task['priority'], number> = {
    high: 0, medium: 1, low: 2,
}

const PriorityReminders: React.FC<PriorityRemindersProps> = ({ tasks }) => {
    const reminders = tasks
        .filter(t => t.parentId === null && t.status !== 'complete')
        .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

    return (
        <div>
            <SectionHeader title="Priority Dispatch" size="sm" />
            <RuleDivider variant="light" spacing="sm" />

            {reminders.length === 0 ? (
                <Empty>All tasks complete — fine work.</Empty>
            ) : (
                <List>
                    {reminders.map(task => (
                        <Item key={task.id} $priority={task.priority}>
                            <Bullet $priority={task.priority} />
                            <Title $done={task.status === 'complete'}>{task.title}</Title>
                            <CategoryTag>{task.category}</CategoryTag>
                        </Item>
                    ))}
                </List>
            )}
        </div>
    )
}

export default PriorityReminders