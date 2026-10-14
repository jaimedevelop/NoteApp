import React from 'react'
import styled, { css } from 'styled-components'
import type { CalendarDay } from '../../types/calendar'
import type { TaskStatus } from '../../types/task'
import type { Milestone, DayPressure } from '../../types/project'
import type { TimeBlock } from '../../types/timeBlock'
import type { FunPoolItem } from '../../types/funPool'

interface DayCellProps {
  day: CalendarDay
  isSelected: boolean
  onClick: () => void
  pressure: DayPressure | null
  milestones: Milestone[]
  isBlocked: boolean
  projectColors: Map<string, string>
  timeBlocks: TimeBlock[]    
  funItems: FunPoolItem[]
}

// ─── Pressure heat tint ───────────────────────────────────────────────────────
// Maps score 0–1 to an rgba overlay on top of the cell's base background.
// Low pressure: faint warm amber. High pressure: deeper brick red.
const pressureTint = (score: number): string => {
  if (score <= 0) return 'transparent'
  if (score < 0.3) return `rgba(210, 140, 50, ${(score * 0.35).toFixed(2)})`
  if (score < 0.6) return `rgba(195, 100, 40, ${(score * 0.4).toFixed(2)})`
  return `rgba(170, 60, 40, ${Math.min(0.55, score * 0.55).toFixed(2)})`
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const Cell = styled.div<{
  $current: boolean
  $today: boolean
  $selected: boolean
  $blocked: boolean
  $tint: string
}>`
  display:        flex;
  flex-direction: column;
  align-items:    flex-start;
  padding:        ${({ theme }) => theme.spacing.xs};
  min-height:     80px;
  border:         1px solid ${({ theme }) => theme.colors.ruleLight};
  cursor:         pointer;
  position:       relative;
  overflow:       hidden;

  background:   ${({ theme, $current, $selected, $blocked }) =>
    $blocked
      ? theme.colors.surfaceBg
      : $selected
        ? theme.colors.surfaceAlt
        : $current
          ? theme.colors.pageBg
          : theme.colors.surfaceBg};

  opacity: ${({ $current }) => ($current ? 1 : 0.45)};
  transition: background ${({ theme }) => theme.transitions.fast};
  &:hover { background: ${({ theme }) => theme.colors.surfaceAlt}; }

  /* Pressure heat overlay */
  &::before {
    content:  '';
    position: absolute;
    inset:    0;
    background: ${({ $tint }) => $tint};
    pointer-events: none;
  }

  ${({ $blocked, theme }) => $blocked && css`
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 6px,
      ${theme.colors.ruleLight} 6px,
      ${theme.colors.ruleLight} 7px
    );
  `}
`

const DateNum = styled.span<{ $today: boolean }>`
  font-family:   ${({ theme }) => theme.fonts.serif};
  font-size:     ${({ theme }) => theme.fontSizes.caption};
  font-weight:   ${({ theme, $today }) => $today ? theme.fontWeights.bold : theme.fontWeights.regular};
  color:         ${({ theme, $today }) => $today ? theme.colors.inkPrimary : theme.colors.inkMuted};
  line-height:   1;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  position:      relative;   /* above ::before overlay */
  z-index:       1;
  ${({ $today, theme }) => $today && `
    &::after {
      content: '';
      display: block;
      width: 4px; height: 4px;
      border-radius: 50%;
      background: ${theme.colors.inkPrimary};
      margin: 2px auto 0;
    }
  `}
`

const BlockX = styled.span`
  position:  absolute;
  inset:     0;
  display:   flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color:     ${({ theme }) => theme.colors.inkMuted};
  opacity:   0.25;
  z-index:   1;
  pointer-events: none;
`

const MilestoneRow = styled.div`
  display:   flex;
  flex-wrap: wrap;
  gap:       2px;
  margin-top: 2px;
  position:  relative;
  z-index:   1;
`

const MilestonePip = styled.span<{ $color: string; $missed: boolean }>`
  display:       inline-block;
  width:         8px;
  height:        8px;
  border-radius: 2px;
  background:    ${({ $color, $missed }) => $missed ? '#888' : $color};
  opacity:       ${({ $missed }) => $missed ? 0.5 : 1};
  flex-shrink:   0;
`

const Dots = styled.div`
  display:    flex;
  flex-wrap:  wrap;
  gap:        2px;
  margin-top: auto;
  position:   relative;
  z-index:    1;
`

const Dot = styled.span<{ $status: TaskStatus }>`
  width:  6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ theme, $status }) => {
    if ($status === 'complete') return theme.colors.statusComplete
    if ($status === 'in_progress') return theme.colors.statusInProgress
    if ($status === 'incomplete') return theme.colors.statusIncomplete
    return theme.colors.inkMuted
  }};
`
const ScheduleBar = styled.div<{ $colors: string[] }>`
  position: absolute;
  top:      0;
  left:     0;
  width:    3px;
  bottom:   0;
  display:  flex;
  flex-direction: column;
  overflow: hidden;
  z-index:  2;
`

const ScheduleSegment = styled.div<{ $color: string }>`
  flex: 1;
  background: ${({ $color }) => $color};
  opacity: 0.8;
`

const FunPip = styled.span`
  position:  absolute;
  top:       4px;
  right:     4px;
  font-size: 9px;
  z-index:   2;
  line-height: 1;
  color: ${({ theme }) => theme.colors.inkMuted};
  opacity: 0.7;
`


// ─── Component ────────────────────────────────────────────────────────────────

const DayCell: React.FC<DayCellProps> = ({
  day, isSelected, onClick,
  pressure, milestones, isBlocked, projectColors, timeBlocks, funItems,
}) => {
  const dayNum = parseInt(day.date.split('-')[2], 10)
  const tint = isBlocked ? 'transparent' : pressureTint(pressure?.score ?? 0)

  return (
    <Cell
      $current={day.isCurrentMonth}
      $today={day.isToday}
      $selected={isSelected}
      $blocked={isBlocked}
      $tint={tint}
      onClick={onClick}
      role="button"
      aria-label={`${day.date}${day.tasks.length ? `, ${day.tasks.length} tasks` : ''}${isBlocked ? ', blocked' : ''}`}
    >
      {timeBlocks.length > 0 && (
        <ScheduleBar $colors={timeBlocks.map(b => b.color)}>
          {timeBlocks.map(b => (
            <ScheduleSegment key={b.id} $color={b.color} />
          ))}
        </ScheduleBar>
      )}

      {funItems.length > 0 && (
        <FunPip title={funItems.map(f => f.title).join(', ')}>
          {'✦'.repeat(Math.min(funItems.length, 3))}
        </FunPip>
      )}
      
      <DateNum $today={day.isToday}>{dayNum}</DateNum>

      {isBlocked && (
        <>
          <BlockX aria-hidden>✕</BlockX>
          {/* label is rendered by DayDetailPanel on click */}
        </>
      )}

      {milestones.length > 0 && (
        <MilestoneRow>
          {milestones.map(m => (
            <MilestonePip
              key={m.id}
              $color={projectColors.get(m.projectId) ?? '#888'}
              $missed={m.status === 'missed'}
              title={m.title}
            />
          ))}
        </MilestoneRow>
      )}

      {day.tasks.length > 0 && (
        <Dots>
          {day.tasks.slice(0, 8).map(t => (
            <Dot key={t.id} $status={t.status} title={t.title} />
          ))}
        </Dots>
      )}
    </Cell>
  )
}

export default DayCell