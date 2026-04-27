import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import NavBar from '../../components/NavBar'
import PageColumn from '../../components/PageColumn'
import RuleDivider from '../../components/RuleDivider'
import SectionHeader from '../../components/SectionHeader'
import IconButton from '../../components/IconButton'
import MonthGrid from './MonthGrid'
import DayDetailPanel from './DayDetailPanel'
import { buildMonthView, getTasksDueOn } from '../../services/calendarService'
import { currentUser } from '../../firebase/auth'
import type { MonthView } from '../../types/calendar'
import type { Task } from '../../types/task'

// ─── Styled ───────────────────────────────────────────────────────────────────

const MonthNav = styled.div`
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  margin-bottom:   ${({ theme }) => theme.spacing.md};
`

const MonthLabel = styled.h2`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.headline};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.inkPrimary};
`

const DetailWrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
`

// ─── Component ────────────────────────────────────────────────────────────────

const Calendar: React.FC = () => {
    const uid = currentUser()?.uid ?? ''
    const now = new Date()

    const [year, setYear] = useState(now.getFullYear())
    const [month, setMonth] = useState(now.getMonth())
    const [monthView, setMonthView] = useState<MonthView | null>(null)
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [dayTasks, setDayTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    const loadMonth = useCallback(async () => {
        if (!uid) return
        setLoading(true)
        try {
            const view = await buildMonthView(uid, year, month)
            setMonthView(view)
        } finally {
            setLoading(false)
        }
    }, [uid, year, month])

    useEffect(() => { loadMonth() }, [loadMonth])

    // Re-fetch whenever the user tabs back from The Ledger
    useEffect(() => {
        const refresh = () => { if (document.visibilityState === 'visible') loadMonth() }
        const onFocus = () => loadMonth()
        document.addEventListener('visibilitychange', refresh)
        window.addEventListener('focus', onFocus)
        return () => {
            document.removeEventListener('visibilitychange', refresh)
            window.removeEventListener('focus', onFocus)
        }
    }, [loadMonth])

    const handleSelectDate = async (date: string) => {
        setSelectedDate(date)
        if (!uid) return
        const tasks = await getTasksDueOn(uid, date)
        setDayTasks(tasks)
    }

    const shiftMonth = (dir: 1 | -1) => {
        const d = new Date(year, month + dir, 1)
        setYear(d.getFullYear())
        setMonth(d.getMonth())
        setSelectedDate(null)
        setDayTasks([])
    }

    return (
        <>
            <NavBar />
            <PageColumn>
                <SectionHeader
                    title="The Chronicle"
                    byline="Deadlines, due dates & the record of days"
                />

                <RuleDivider variant="light" spacing="md" />

                <MonthNav>
                    <IconButton label="Previous month" onClick={() => shiftMonth(-1)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </IconButton>

                    <MonthLabel>{monthView?.label ?? '…'}</MonthLabel>

                    <IconButton label="Next month" onClick={() => shiftMonth(1)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </IconButton>
                </MonthNav>

                {!loading && monthView && (
                    <MonthGrid
                        view={monthView}
                        selectedDate={selectedDate}
                        onSelectDate={handleSelectDate}
                    />
                )}

                {selectedDate && (
                    <DetailWrapper>
                        <DayDetailPanel date={selectedDate} tasks={dayTasks} />
                    </DetailWrapper>
                )}
            </PageColumn>
        </>
    )
}

export default Calendar