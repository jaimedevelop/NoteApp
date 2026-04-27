import React from 'react'
import styled from 'styled-components'
import type { Task } from '../../types/task'
import RuleDivider from '../../components/RuleDivider'
import StatusBadge from '../tasks/StatusBadge'
import PriorityBadge from '../tasks/PriorityBadge'

interface DayDetailPanelProps {
    date: string       // 'YYYY-MM-DD'
    tasks: Task[]
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const Panel = styled.aside`
  background:   ${({ theme }) => theme.colors.surfaceBg};
  border:       1px solid ${({ theme }) => theme.colors.ruleMid};
  border-top:   2px solid ${({ theme }) => theme.colors.ruleHeavy};
  padding:      ${({ theme }) => theme.spacing.md};
  min-height:   160px;
`

const DateHeading = styled.h3`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.subhead};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  color:          ${({ theme }) => theme.colors.inkPrimary};
  letter-spacing: 0.04em;
`

const List = styled.ul`
  list-style: none;
  display:    flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const Item = styled.li`
  display:     flex;
  align-items: center;
  gap:         ${({ theme }) => theme.spacing.sm};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
  border-bottom:  1px solid ${({ theme }) => theme.colors.ruleLight};

  &:last-child { border-bottom: none; }
`

const TaskTitle = styled.span<{ $done: boolean }>`
  font-family:     ${({ theme }) => theme.fonts.sansSerif};
  font-size:       ${({ theme }) => theme.fontSizes.body};
  color:           ${({ theme, $done }) => $done ? theme.colors.inkMuted : theme.colors.inkPrimary};
  text-decoration: ${({ $done }) => ($done ? 'line-through' : 'none')};
  flex: 1;
`

const CategoryTag = styled.span`
  font-family:    ${({ theme }) => theme.fonts.mono};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  color:          ${({ theme }) => theme.colors.inkMuted};
  letter-spacing: 0.04em;
  white-space:    nowrap;
`

const Empty = styled.p`
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-style:  italic;
  color:       ${({ theme }) => theme.colors.inkMuted};
  font-size:   ${({ theme }) => theme.fontSizes.body};
  margin-top:  ${({ theme }) => theme.spacing.md};
`

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    })

// ─── Component ────────────────────────────────────────────────────────────────

const DayDetailPanel: React.FC<DayDetailPanelProps> = ({ date, tasks }) => (
    <Panel>
        <DateHeading>{formatDate(date)}</DateHeading>
        <RuleDivider variant="light" spacing="sm" />

        {tasks.length === 0 ? (
            <Empty>No tasks due this day.</Empty>
        ) : (
            <List>
                {tasks.map(task => (
                    <Item key={task.id}>
                        <StatusBadge status={task.status} />
                        <TaskTitle $done={task.status === 'complete'}>{task.title}</TaskTitle>
                        <PriorityBadge priority={task.priority} />
                        <CategoryTag>{task.category}</CategoryTag>
                    </Item>
                ))}
            </List>
        )}
    </Panel>
)

export default DayDetailPanel