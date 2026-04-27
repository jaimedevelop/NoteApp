import React from 'react'
import styled from 'styled-components'
import type { Task } from '../../types/task'

interface DayProgressBarProps {
    tasks: Task[]   // top-level tasks for the selected day
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  display:        flex;
  flex-direction: column;
  gap:            ${({ theme }) => theme.spacing.xs};
`

const MetaRow = styled.div`
  display:         flex;
  justify-content: space-between;
  align-items:     baseline;
`

const Label = styled.span`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.inkMuted};
`

const Fraction = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
  color:       ${({ theme }) => theme.colors.inkMuted};
`

const Track = styled.div`
  width:            100%;
  height:           6px;
  background-color: ${({ theme }) => theme.colors.surfaceAlt};
  border:           1px solid ${({ theme }) => theme.colors.ruleLight};
  border-radius:    ${({ theme }) => theme.radii.none};
  overflow:         hidden;
`

const Fill = styled.div<{ $pct: number }>`
  height:           100%;
  width:            ${({ $pct }) => $pct}%;
  background-color: ${({ theme }) => theme.colors.statusComplete};
  transition:       width 400ms ease;
`

// ─── Component ────────────────────────────────────────────────────────────────

const DayProgressBar: React.FC<DayProgressBarProps> = ({ tasks }) => {
    const topLevel = tasks.filter(t => t.parentId === null)
    const total = topLevel.length
    const completed = topLevel.filter(t => t.status === 'complete').length
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100)

    return (
        <Wrapper>
            <MetaRow>
                <Label>Day's Progress</Label>
                <Fraction>{completed} / {total} complete · {pct}%</Fraction>
            </MetaRow>
            <Track>
                <Fill $pct={pct} />
            </Track>
        </Wrapper>
    )
}

export default DayProgressBar