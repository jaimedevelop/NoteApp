import React from 'react'
import styled from 'styled-components'
import type { CalendarDay } from '../../types/calendar'
import type { TaskStatus } from '../../types/task'

interface DayCellProps {
    day: CalendarDay
    isSelected: boolean
    onClick: () => void
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const Cell = styled.div<{ $current: boolean; $today: boolean; $selected: boolean }>`
  display:        flex;
  flex-direction: column;
  align-items:    flex-start;
  padding:        ${({ theme }) => theme.spacing.xs};
  min-height:     72px;
  border:         1px solid ${({ theme }) => theme.colors.ruleLight};
  cursor:         pointer;
  position:       relative;
  background:     ${({ theme, $current, $selected }) =>
        $selected
            ? theme.colors.surfaceAlt
            : $current
                ? theme.colors.pageBg
                : theme.colors.surfaceBg};
  opacity: ${({ $current }) => ($current ? 1 : 0.45)};
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover { background: ${({ theme }) => theme.colors.surfaceAlt}; }
`

const DateNum = styled.span<{ $today: boolean }>`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme, $today }) => $today ? theme.fontWeights.bold : theme.fontWeights.regular};
  color:          ${({ theme, $today }) => $today ? theme.colors.inkPrimary : theme.colors.inkMuted};
  line-height:    1;
  margin-bottom:  ${({ theme }) => theme.spacing.xs};

  /* Today indicator: small underline dot */
  ${({ $today, theme }) => $today && `
    &::after {
      content: '';
      display: block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: ${theme.colors.inkPrimary};
      margin: 2px auto 0;
    }
  `}
`

const Dots = styled.div`
  display:   flex;
  flex-wrap: wrap;
  gap:       2px;
  margin-top: auto;
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

// ─── Component ────────────────────────────────────────────────────────────────

const DayCell: React.FC<DayCellProps> = ({ day, isSelected, onClick }) => {
    const dayNum = parseInt(day.date.split('-')[2], 10)

    return (
        <Cell
            $current={day.isCurrentMonth}
            $today={day.isToday}
            $selected={isSelected}
            onClick={onClick}
            role="button"
            aria-label={`${day.date}${day.tasks.length ? `, ${day.tasks.length} tasks` : ''}`}
        >
            <DateNum $today={day.isToday}>{dayNum}</DateNum>

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