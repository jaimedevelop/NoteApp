import React from 'react'
import styled from 'styled-components'
import type { TimeBlock } from '../../types/timeBlock'

interface Props {
  blocks: TimeBlock[]
}

const Strip = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const BlockPill = styled.div<{ $color: string }>`
  display:     flex;
  align-items: center;
  gap:         8px;
  padding:     4px 8px;
  border-left: 3px solid ${({ $color }) => $color};
  background:  ${({ theme }) => theme.colors.surfaceBg};
`

const PillTitle = styled.span`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size:   ${({ theme }) => theme.fontSizes.body};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color:       ${({ theme }) => theme.colors.inkPrimary};
  flex: 1;
`

const PillTime = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
  color:       ${({ theme }) => theme.colors.inkMuted};
`

/** Converts "08:00" → "8:00 AM" */
function fmt(t: string): string {
  const [hStr, m] = t.split(':')
  const h = parseInt(hStr, 10)
  return `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`
}

const TimeBlockDisplay: React.FC<Props> = ({ blocks }) => {
  if (!blocks.length) return null

  return (
    <Strip>
      {blocks.map(b => (
        <BlockPill key={b.id} $color={b.color}>
          <PillTitle>{b.title}</PillTitle>
          <PillTime>{fmt(b.startTime)} – {fmt(b.endTime)}</PillTime>
        </BlockPill>
      ))}
    </Strip>
  )
}

export default TimeBlockDisplay