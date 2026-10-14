import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import NavBar from '../../components/NavBar'
import PageColumn from '../../components/PageColumn'
import RuleDivider from '../../components/RuleDivider'
import SectionHeader from '../../components/SectionHeader'
import IconButton from '../../components/IconButton'
import MonthGrid from './MonthGrid'
import DayDetailPanel from './DayDetailPanel'
import ProjectPanel from './ProjectPanel'
import TimeBlockManager from '../../components/timeblocks/TimeBlockManager'
import FunPoolPanel from '../../components/funpool/FunPoolPanel'
import { buildMonthView, getTasksDueOn } from '../../services/calendarService'
import { loadCalendarProjectData, type CalendarProjectData } from '../../services/projectService'
import { fetchTimeBlocks } from '../../firebase/timeBlocks'
import { fetchFunPool } from '../../firebase/funPool'
import { resolveBlocksForDates } from '../../services/timeBlockService'
import { currentUser } from '../../firebase/auth'
import type { MonthView } from '../../types/calendar'
import type { Task } from '../../types/task'
import type { TimeBlock } from '../../types/timeBlock'
import type { FunPoolItem } from '../../types/funPool'

// ─── Styled ───────────────────────────────────────────────────────────────────

const MonthNav = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const MonthLabel = styled.h2`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.headline};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.06em; text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.inkPrimary};
`

const TopRow = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const ButtonGroup = styled.div`
  display: flex; gap: ${({ theme }) => theme.spacing.sm};
`

const PanelBtn = styled.button`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.08em; text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.inkPrimary};
  background:     none;
  border:         1px solid ${({ theme }) => theme.colors.ruleMid};
  padding:        4px 12px; cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.surfaceAlt}; }
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
  const [projectData, setProjectData] = useState<CalendarProjectData | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayTasks, setDayTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // Time blocks
  const [, setAllBlocks] = useState<TimeBlock[]>([])
  const [blocksByDate, setBlocksByDate] = useState<Map<string, TimeBlock[]>>(new Map())

  // Fun pool
  const [allFunItems, setAllFunItems] = useState<FunPoolItem[]>([])
  const [funByDate, setFunByDate] = useState<Map<string, FunPoolItem[]>>(new Map())

  // Panel visibility
  const [projectPanelOpen, setProjectPanelOpen] = useState(false)
  const [schedulePanelOpen, setSchedulePanelOpen] = useState(false)
  const [funPanelOpen, setFunPanelOpen] = useState(false)

  // ── Loaders ────────────────────────────────────────────────────────────────

  const loadBlocks = useCallback(async (dates: string[]) => {
    const blocks = await fetchTimeBlocks(uid)
    setAllBlocks(blocks)
    setBlocksByDate(resolveBlocksForDates(blocks, dates))
  }, [uid])

  const loadFun = useCallback(async (dates: string[]) => {
    const items = await fetchFunPool(uid)
    setAllFunItems(items)
    // Build funByDate: for each date, items that have it in assignedDates
    const map = new Map<string, FunPoolItem[]>()
    for (const date of dates) {
      map.set(date, items.filter(i => i.assignedDates.includes(date)))
    }
    setFunByDate(map)
  }, [uid])

  const loadAll = useCallback(async () => {
    if (!uid) return
    setLoading(true)
    try {
      const view = await buildMonthView(uid, year, month)
      setMonthView(view)
      const dates = view.days.map(d => d.date)
      const [pd] = await Promise.all([
        loadCalendarProjectData(uid, dates),
        loadBlocks(dates),
        loadFun(dates),
      ])
      setProjectData(pd)
    } finally {
      setLoading(false)
    }
  }, [uid, year, month, loadBlocks, loadFun])

  useEffect(() => { loadAll() }, [loadAll])

  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') loadAll() }
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', loadAll)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', loadAll)
    }
  }, [loadAll])

  // ── Derived fun items for the selected date ────────────────────────────────

  const selectedFunItems = selectedDate
    ? (allFunItems.filter(i => i.assignedDates.includes(selectedDate)))
    : []

  const selectedTimeBlocks = selectedDate
    ? (blocksByDate.get(selectedDate) ?? [])
    : []

  // ── Handlers ───────────────────────────────────────────────────────────────

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

  const handleFunChanged = useCallback(async () => {
    if (!monthView) return
    const dates = monthView.days.map(d => d.date)
    await loadFun(dates)
  }, [monthView, loadFun])

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <NavBar />
      <PageColumn>
        <TopRow>
          <SectionHeader
            title="The Chronicle"
            byline="Deadlines, due dates & the record of days"
          />
          <ButtonGroup>
            <PanelBtn onClick={() => setSchedulePanelOpen(true)}>⏱ Schedule</PanelBtn>
            <PanelBtn onClick={() => setFunPanelOpen(true)}>✦ Fun Pool</PanelBtn>
            <PanelBtn onClick={() => setProjectPanelOpen(true)}>⬡ Projects</PanelBtn>
          </ButtonGroup>
        </TopRow>

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

        {!loading && monthView && projectData && (
          <MonthGrid
            view={monthView}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            pressureMap={projectData.pressureMap}
            milestones={projectData.milestones}
            blockedDays={projectData.blockedDays}
            projects={projectData.projects}
            blocksByDate={blocksByDate}
            funByDate={funByDate}
          />
        )}

        {selectedDate && (
          <DetailWrapper>
            <DayDetailPanel
              date={selectedDate}
              tasks={dayTasks}
              milestones={projectData?.milestones.filter(m => m.date === selectedDate) ?? []}
              projects={projectData?.projects ?? []}
              blockedDay={projectData?.blockedDays.find(b => b.date === selectedDate)}
              timeBlocks={selectedTimeBlocks}
              funItems={selectedFunItems}
              uid={uid}
              onFunChanged={handleFunChanged}
            />
          </DetailWrapper>
        )}
      </PageColumn>

      {projectPanelOpen && (
        <ProjectPanel
          uid={uid}
          onClose={() => setProjectPanelOpen(false)}
          onChanged={loadAll}
          blockedDays={projectData?.blockedDays ?? []}
        />
      )}

      {schedulePanelOpen && (
        <TimeBlockManager
          uid={uid}
          onClose={() => setSchedulePanelOpen(false)}
          onChanged={loadAll}
        />
      )}

      {funPanelOpen && (
        <FunPoolPanel
          uid={uid}
          onClose={() => setFunPanelOpen(false)}
          onChanged={handleFunChanged}
        />
      )}
    </>
  )
}

export default Calendar