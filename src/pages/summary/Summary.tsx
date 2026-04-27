import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import NavBar from '../../components/NavBar'
import PageColumn from '../../components/PageColumn'
import RuleDivider from '../../components/RuleDivider'
import SectionHeader from '../../components/SectionHeader'
import DateNavigator from './DateNavigator'
import DayProgressBar from './DayProgressBar'
import PriorityReminders from './PriorityReminders'
import DeadlineAlert from './DeadlineAlert'
import CarryForwardSuggestion from './CarryForwardSuggestion'
import { getTasksForDay, getCarryForwardCandidates } from '../../services/taskService'
import { getOverdueTasks } from '../../services/calendarService'
import { currentUser } from '../../firebase/auth'
import type { Task } from '../../types/task'
import { localDateString, shiftDate } from '../../utils/date'

// ─── Styled ───────────────────────────────────────────────────────────────────

const TasksRemainingRow = styled.div`
  display:         flex;
  align-items:     baseline;
  justify-content: space-between;
  margin-top:      ${({ theme }) => theme.spacing.sm};
`

const TasksRemainingLabel = styled.span`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
  font-style:  italic;
  color:       ${({ theme }) => theme.colors.inkMuted};
`

const LedgerLink = styled.button`
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

const Summary: React.FC = () => {
    const uid = currentUser()?.uid ?? ''
    const navigate = useNavigate()

    const [date, setDate] = useState(localDateString())
    const [tasks, setTasks] = useState<Task[]>([])
    const [overdue, setOverdue] = useState<Task[]>([])
    const [carryFwd, setCarryFwd] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    const isToday = date === localDateString()

    const loadDay = useCallback(async (d: string) => {
        if (!uid) return
        setLoading(true)
        try {
            const [dayTasks, overdueList] = await Promise.all([
                getTasksForDay(uid, d),
                isToday ? getOverdueTasks(uid) : Promise.resolve([]),
            ])
            setTasks(dayTasks)
            setOverdue(overdueList)

            if (isToday) {
                const yesterday = shiftDate(d, -1)
                const candidates = await getCarryForwardCandidates(uid, yesterday)
                setCarryFwd(candidates)
            } else {
                setCarryFwd([])
            }
        } finally {
            setLoading(false)
        }
    }, [uid, isToday])

    useEffect(() => { loadDay(date) }, [date, loadDay])

    useEffect(() => {
        const refresh = () => { if (document.visibilityState === 'visible') loadDay(date) }
        const onFocus = () => loadDay(date)
        document.addEventListener('visibilitychange', refresh)
        window.addEventListener('focus', onFocus)
        return () => {
            document.removeEventListener('visibilitychange', refresh)
            window.removeEventListener('focus', onFocus)
        }
    }, [date, loadDay])

    const handleDateChange = (d: string) => setDate(d)

    // ── Derived counts ───────────────────────────────────────────────────────
    const topLevel = tasks.filter(t => t.parentId === null)
    const remaining = topLevel.filter(t => t.status !== 'complete').length

    return (
        <>
            <NavBar />
            <PageColumn>
                <SectionHeader
                    title="Daily Dispatch"
                    byline={`Field Report · ${date}`}
                />

                <RuleDivider variant="light" spacing="md" />

                <DateNavigator date={date} onChange={handleDateChange} />

                <RuleDivider variant="light" spacing="md" />

                {loading ? null : (
                    <>
                        {overdue.length > 0 && (
                            <>
                                <DeadlineAlert tasks={overdue} />
                                <RuleDivider variant="light" spacing="md" />
                            </>
                        )}

                        {isToday && carryFwd.length > 0 && (
                            <>
                                <CarryForwardSuggestion
                                    uid={uid}
                                    candidates={carryFwd}
                                    toDate={date}
                                    onCarried={() => loadDay(date)}
                                />
                                <RuleDivider variant="light" spacing="md" />
                            </>
                        )}

                        <DayProgressBar tasks={tasks} />

                        <TasksRemainingRow>
                            <TasksRemainingLabel>
                                {remaining === 0
                                    ? 'All tasks complete — fine work.'
                                    : `${remaining} task${remaining === 1 ? '' : 's'} remaining`}
                            </TasksRemainingLabel>
                            <LedgerLink onClick={() => navigate('/tasks')}>
                                Open The Ledger →
                            </LedgerLink>
                        </TasksRemainingRow>

                        <RuleDivider variant="mid" spacing="lg" />

                        <PriorityReminders tasks={tasks} />
                    </>
                )}
            </PageColumn>
        </>
    )
}

export default Summary