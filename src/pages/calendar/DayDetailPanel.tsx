import React from 'react'
import styled from 'styled-components'
import type { Task } from '../../types/task'
import type { Milestone, Project, BlockedDay } from '../../types/project'
import type { TimeBlock } from '../../types/timeBlock'
import type { FunPoolItem } from '../../types/funPool'
import RuleDivider from '../../components/RuleDivider'
import StatusBadge from '../tasks/StatusBadge'
import PriorityBadge from '../tasks/PriorityBadge'
import TimeBlockDisplay from '../../components/timeblocks/TimeBlockDisplay'
import { unassignFunItemFromDate } from '../../firebase/funPool'

interface DayDetailPanelProps {
  date: string
  tasks: Task[]
  milestones: Milestone[]
  projects: Project[]
  blockedDay: BlockedDay | undefined
  timeBlocks: TimeBlock[]
  funItems: FunPoolItem[]
  uid: string
  onFunChanged: () => void
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

const BlockedBanner = styled.div`
  display: flex; align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.ruleMid};
  padding: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size: ${({ theme }) => theme.fontSizes.body};
  color: ${({ theme }) => theme.colors.inkSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const SectionLabel = styled.p`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.1em; text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.inkMuted};
  margin-bottom:  ${({ theme }) => theme.spacing.xs};
`

const MilestoneBlock = styled.div<{ $color: string }>`
  border-left:  3px solid ${({ $color }) => $color};
  padding:      ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const MilestoneTitle = styled.p`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size:   ${({ theme }) => theme.fontSizes.body};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color:       ${({ theme }) => theme.colors.inkPrimary};
`

const MilestoneProject = styled.p`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
  color:       ${({ theme }) => theme.colors.inkMuted};
`

const List = styled.ul`
  list-style: none;
  display: flex; flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const Item = styled.li`
  display: flex; align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
  border-bottom: 1px solid ${({ theme }) => theme.colors.ruleLight};
  &:last-child { border-bottom: none; }
`

const TaskTitle = styled.span<{ $done: boolean }>`
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size:   ${({ theme }) => theme.fontSizes.body};
  color:       ${({ theme, $done }) => $done ? theme.colors.inkMuted : theme.colors.inkPrimary};
  text-decoration: ${({ $done }) => $done ? 'line-through' : 'none'};
  flex: 1;
`

const CategoryTag = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
  color:       ${({ theme }) => theme.colors.inkMuted};
  letter-spacing: 0.04em; white-space: nowrap;
`

const FunItem = styled.div`
  display: flex; align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.ruleLight};
  &:last-child { border-bottom: none; }
`

const FunTitle = styled.span`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size:   ${({ theme }) => theme.fontSizes.body};
  color:       ${({ theme }) => theme.colors.inkPrimary};
  flex: 1;
`

const FunNotes = styled.span`
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
  color:       ${({ theme }) => theme.colors.inkMuted};
  font-style:  italic;
`

const UnassignBtn = styled.button`
  background: none; border: none; cursor: pointer;
  font-size: 11px; color: ${({ theme }) => theme.colors.inkMuted};
  opacity: 0.6;
  &:hover { opacity: 1; color: #A03C28; }
`

const Empty = styled.p`
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-style: italic;
  color:      ${({ theme }) => theme.colors.inkMuted};
  font-size:  ${({ theme }) => theme.fontSizes.body};
  margin-top: ${({ theme }) => theme.spacing.md};
`

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

// ─── Component ────────────────────────────────────────────────────────────────

const DayDetailPanel: React.FC<DayDetailPanelProps> = ({
  date, tasks, milestones, projects, blockedDay,
  timeBlocks, funItems, uid, onFunChanged,
}) => {
  const projectMap = new Map(projects.map(p => [p.id, p]))

  const handleUnassign = async (item: FunPoolItem) => {
    await unassignFunItemFromDate(uid, item.id, date, item.assignedDates)
    onFunChanged()
  }

  const hasContent = timeBlocks.length > 0 || funItems.length > 0 ||
    milestones.length > 0 || tasks.length > 0 || blockedDay

  return (
    <Panel>
      <DateHeading>{formatDate(date)}</DateHeading>
      <RuleDivider variant="light" spacing="sm" />

      {blockedDay && (
        <BlockedBanner>
          <span style={{ fontSize: 18 }}>✕</span>
          <span>Blocked — {blockedDay.label}</span>
        </BlockedBanner>
      )}

      {/* 1. Time blocks */}
      {timeBlocks.length > 0 && (
        <>
          <SectionLabel>Schedule</SectionLabel>
          <TimeBlockDisplay blocks={timeBlocks} />
          <RuleDivider variant="light" spacing="sm" />
        </>
      )}

      {/* 2. Fun tasks */}
      {funItems.length > 0 && (
        <>
          <SectionLabel>Today's Fun</SectionLabel>
          {funItems.map(item => (
            <FunItem key={item.id}>
              <span style={{ fontSize: 14 }}>✦</span>
              <div style={{ flex: 1 }}>
                <FunTitle>{item.title}</FunTitle>
                {item.notes && <FunNotes> — {item.notes}</FunNotes>}
              </div>
              <UnassignBtn
                title="Remove from this day"
                onClick={() => handleUnassign(item)}
              >
                ✕
              </UnassignBtn>
            </FunItem>
          ))}
          <RuleDivider variant="light" spacing="sm" />
        </>
      )}

      {/* 3. Milestones */}
      {milestones.length > 0 && (
        <>
          <SectionLabel>Milestones</SectionLabel>
          {milestones.map(m => {
            const proj = projectMap.get(m.projectId)
            return (
              <MilestoneBlock key={m.id} $color={proj?.color ?? '#888'}>
                <MilestoneTitle>{m.title}</MilestoneTitle>
                {proj && <MilestoneProject>{proj.title}</MilestoneProject>}
              </MilestoneBlock>
            )
          })}
          <RuleDivider variant="light" spacing="sm" />
        </>
      )}

      {/* 4. Tasks due */}
      {tasks.length > 0 && (
        <>
          <SectionLabel>Tasks Due</SectionLabel>
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
        </>
      )}

      {!hasContent && <Empty>No tasks, blocks, or milestones on this day.</Empty>}
    </Panel>
  )
}

export default DayDetailPanel