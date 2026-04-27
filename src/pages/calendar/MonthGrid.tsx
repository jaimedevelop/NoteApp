import React from 'react'
import styled from 'styled-components'
import type { MonthView } from '../../types/calendar'
import DayCell from './DayCell'

interface MonthGridProps {
    view: MonthView
    selectedDate: string | null
    onSelectDate: (date: string) => void
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const Grid = styled.div`
  display:               grid;
  grid-template-columns: repeat(7, 1fr);
  border-top:   1px solid ${({ theme }) => theme.colors.ruleMid};
  border-left:  1px solid ${({ theme }) => theme.colors.ruleMid};

  /* Each cell draws its own right + bottom border, giving a clean table feel */
`

const DayLabel = styled.div`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.inkMuted};
  text-align:     center;
  padding:        ${({ theme }) => theme.spacing.xs} 0;
  border-right:   1px solid ${({ theme }) => theme.colors.ruleLight};
  border-bottom:  1px solid ${({ theme }) => theme.colors.ruleMid};
`

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ─── Component ────────────────────────────────────────────────────────────────

const MonthGrid: React.FC<MonthGridProps> = ({ view, selectedDate, onSelectDate }) => (
    <div>
        {/* Day-of-week header row */}
        <Grid>
            {DAY_LABELS.map(d => <DayLabel key={d}>{d}</DayLabel>)}
        </Grid>

        {/* Date cells */}
        <Grid>
            {view.days.map(day => (
                <DayCell
                    key={day.date}
                    day={day}
                    isSelected={day.date === selectedDate}
                    onClick={() => onSelectDate(day.date)}
                />
            ))}
        </Grid>
    </div>
)

export default MonthGrid