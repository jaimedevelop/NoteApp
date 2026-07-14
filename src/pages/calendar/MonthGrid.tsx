import React from 'react'
import styled from 'styled-components'
import type { MonthView } from '../../types/calendar'
import type { Project, Milestone, BlockedDay, DayPressure } from '../../types/project'
import DayCell from './DayCell'
import type { TimeBlock } from '../../types/timeBlock'
import type { FunPoolItem } from '../../types/funPool'

interface MonthGridProps {
    view: MonthView
    selectedDate: string | null
    onSelectDate: (date: string) => void
    pressureMap: Map<string, DayPressure>
    milestones: Milestone[]
    blockedDays: BlockedDay[]
    projects: Project[]
    blocksByDate: Map<string, TimeBlock[]>   
    funByDate: Map<string, FunPoolItem[]>
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const Grid = styled.div`
  display:               grid;
  grid-template-columns: repeat(7, 1fr);
  border-top:   1px solid ${({ theme }) => theme.colors.ruleMid};
  border-left:  1px solid ${({ theme }) => theme.colors.ruleMid};
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

// Project runway strip — a thin colored bar spanning deadline-approaching days
const RunwayLegend = styled.div`
  display:   flex;
  flex-wrap: wrap;
  gap:       ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.sm};
`

const RunwayChip = styled.span<{ $color: string }>`
  display:      inline-flex;
  align-items:  center;
  gap:          5px;
  font-family:  ${({ theme }) => theme.fonts.sansSerif};
  font-size:    ${({ theme }) => theme.fontSizes.caption};
  color:        ${({ theme }) => theme.colors.inkSecondary};
  &::before {
    content:       '';
    display:       inline-block;
    width:         10px;
    height:        10px;
    border-radius: 2px;
    background:    ${({ $color }) => $color};
  }
`

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ─── Component ────────────────────────────────────────────────────────────────

const MonthGrid: React.FC<MonthGridProps> = ({
    view, selectedDate, onSelectDate,
    pressureMap, milestones, blockedDays, projects, blocksByDate, funByDate,
}) => {
    const blockedSet = new Set(blockedDays.map(b => b.date))
    const milestonesByDate = new Map<string, Milestone[]>()
    for (const m of milestones) {
        const bucket = milestonesByDate.get(m.date) ?? []
        bucket.push(m)
        milestonesByDate.set(m.date, bucket)
    }

    // Map projectId → color for milestone dots
    const projectColors = new Map(projects.map(p => [p.id, p.color]))

    const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'paused')

    return (
        <div>
            <Grid>
                {DAY_LABELS.map(d => <DayLabel key={d}>{d}</DayLabel>)}
            </Grid>
            <Grid>
                {view.days.map(day => (
                    <DayCell
                        key={day.date}
                        day={day}
                        isSelected={day.date === selectedDate}
                        onClick={() => onSelectDate(day.date)}
                        pressure={pressureMap.get(day.date) ?? null}
                        milestones={milestonesByDate.get(day.date) ?? []}
                        isBlocked={blockedSet.has(day.date)}
                        projectColors={projectColors}
                        timeBlocks={blocksByDate.get(day.date) ?? []}  
                        funItems={funByDate.get(day.date) ?? []} 
                    />
                ))}
            </Grid>

            {activeProjects.length > 0 && (
                <RunwayLegend>
                    {activeProjects.map(p => (
                        <RunwayChip key={p.id} $color={p.color}>{p.title}</RunwayChip>
                    ))}
                </RunwayLegend>
            )}
        </div>
    )
}

export default MonthGrid