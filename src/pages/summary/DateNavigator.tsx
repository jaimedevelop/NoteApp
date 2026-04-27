import React from 'react'
import styled from 'styled-components'
import IconButton from '../../components/IconButton'
import { localDateString, shiftDate } from '../../utils/date'   // ← use shared util

interface DateNavigatorProps {
    date: string
    onChange: (date: string) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// shiftDate already imported from utils; only formatDisplay is local
const formatDisplay = (iso: string): string => {
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    })
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const Row = styled.div`
  display:         flex;
  align-items:     center;
  justify-content: center;
  gap:             ${({ theme }) => theme.spacing.md};
`

const DateLabel = styled.span`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.subhead};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  color:          ${({ theme }) => theme.colors.inkPrimary};
  letter-spacing: 0.03em;
  min-width:      280px;
  text-align:     center;
`

const TodayBtn = styled.button`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.inkMuted};
  border:         1px solid ${({ theme }) => theme.colors.ruleLight};
  padding:        2px 8px;
  border-radius:  ${({ theme }) => theme.radii.sm};
  transition:     color       ${({ theme }) => theme.transitions.fast},
                  border-color ${({ theme }) => theme.transitions.fast};
  &:hover {
    color:        ${({ theme }) => theme.colors.inkPrimary};
    border-color: ${({ theme }) => theme.colors.ruleMid};
  }
`

// ─── Component ────────────────────────────────────────────────────────────────

const DateNavigator: React.FC<DateNavigatorProps> = ({ date, onChange }) => {
    const isToday = date === localDateString()   // ← local time, not UTC

    return (
        <Row>
            <IconButton label="Previous day" size="sm" onClick={() => onChange(shiftDate(date, -1))}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </IconButton>

            <DateLabel>{formatDisplay(date)}</DateLabel>

            <IconButton
                label="Next day"
                size="sm"
                disabled={isToday}
                onClick={() => onChange(shiftDate(date, 1))}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </IconButton>

            {!isToday && (
                <TodayBtn onClick={() => onChange(localDateString())}>Today</TodayBtn>
            )}
        </Row>
    )
}

export default DateNavigator