import { useEffect, useRef, useState, type DragEvent } from 'react'
import styled from 'styled-components'
import type { Task, TaskTree, CreateTaskPayload, UpdateTaskPayload } from '../../types/task'
import { elapsedMinutesForDate } from '../../utils/date'
import { appointmentPlacement, positionAppointments } from '../../utils/appointmentLayout'
import StatusBadge, { CYCLE } from './StatusBadge'

const Layout = styled.div`
  display: grid; grid-template-columns: 210px minmax(0, 1fr); gap: 24px;
  align-items: start;
  color: ${({ theme }) => theme.colors.inkPrimary};
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; margin: 0 0 12px; }
  p { color: ${({ theme }) => theme.colors.inkMuted}; font-style: italic; }
  input, select { font: inherit; color: inherit; }
  button { cursor: pointer; }
  @media(max-width: 650px) { grid-template-columns: 1fr; }
`
const Tray = styled.aside`
  min-width: 0;
  border-top: 3px double ${({ theme }) => theme.colors.ruleMid}; padding-top: 12px;
  small { display: block; color: ${({ theme }) => theme.colors.inkMuted}; }
`
const TrayList = styled.div`
  max-height: min(680px, 60dvh); overflow-y: auto;
  overscroll-behavior-y: contain; scrollbar-gutter: stable;
  @media(max-width: 650px) { max-height: 30dvh; }
`
const TrayItem = styled.div`
  position: relative; margin: 6px 0;
  border: 1px solid ${({ theme }) => theme.colors.ruleLight};
  background: ${({ theme }) => theme.colors.surfaceBg};
`
const TrayOpen = styled.button`
  display: block; width: 100%; text-align: left; padding: 8px 36px 8px 8px;
  font: inherit; color: inherit; background: transparent; border: 0;
`
const TrayStatus = styled.div`
  position: absolute; top: 5px; right: 5px;
`
const Scroll = styled.div`
  max-height: 680px; overflow: auto; border: 1px solid ${({ theme }) => theme.colors.ruleLight};
`
const Timeline = styled.div`
  position: relative; height: 2304px; margin-left: 65px;
  border-left: 1px solid ${({ theme }) => theme.colors.ruleMid};
`
const Slot = styled.button<{ $hour: boolean }>`
  display: block; width: 100%; height: 24px; padding: 0; background: transparent;
  border: 0; border-top: 1px ${({ $hour }) => $hour ? 'solid' : 'dotted'} ${({ theme }) => theme.colors.ruleLight};
  text-align: left; position: relative;
  &:not(:disabled):hover, &:not(:disabled):focus-visible { background: ${({ theme }) => theme.colors.surfaceAlt}; }
  span { position: absolute; right: calc(100% + 8px); top: -9px; white-space: nowrap; font-size: 12px; }
`
const Elapsed = styled.div`
  position: absolute; top: 0; left: -65px; right: 0; z-index: 1;
  background: rgba(100, 100, 100, 0.12); pointer-events: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.inkMuted};
`
const Event = styled.button`
  position: absolute; overflow: hidden; text-align: left; padding: 3px 6px; font: inherit; color: inherit;
  border: 1px solid ${({ theme }) => theme.colors.ruleMid}; border-left-width: 3px;
  background: ${({ theme }) => theme.colors.surfaceAlt}; box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex; flex-direction: column; justify-content: flex-start; gap: 0;
  line-height: 18px;
  span { display: block; flex-shrink: 0; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
  strong { font-size: 13px; }
`
const DropPreview = styled.div<{ $valid: boolean }>`
  position: absolute; z-index: 3; pointer-events: none;
  box-sizing: border-box; border: 2px dashed ${({ theme }) => theme.colors.inkPrimary};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  opacity: ${({ $valid }) => $valid ? 0.9 : 0.55};
  padding: 2px 6px; overflow: hidden; font-size: 12px; font-weight: bold;
`
const Backdrop = styled.div`
  position: fixed; inset: 0; z-index: 100; background: ${({ theme }) => theme.colors.overlay};
  display: flex; align-items: center; justify-content: center; padding: 20px;
`
const Editor = styled.form`
  background: ${({ theme }) => theme.colors.pageBg}; color: ${({ theme }) => theme.colors.inkPrimary};
  border: 3px double ${({ theme }) => theme.colors.ruleHeavy}; padding: 28px; width: 540px; max-width: 100%;
  max-height: 90vh; overflow: auto;
  h3 { margin-top: 0; font-family: ${({ theme }) => theme.fonts.serif}; }
  label { display: block; margin: 12px 0; }
  input, select { width: 100%; margin-top: 4px; padding: 8px; font: inherit; color: inherit;
    border: 1px solid ${({ theme }) => theme.colors.ruleMid}; background: ${({ theme }) => theme.colors.white}; }
  input, select { border-radius: ${({ theme }) => theme.radii.sm}; }
  h3 { padding-bottom: 16px; border-bottom: 3px double ${({ theme }) => theme.colors.ruleMid}; }
  fieldset { min-width: 0; }
`
const Actions = styled.div`
  display: flex; flex-wrap: nowrap; gap: 8px; margin-top: 24px; padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.ruleLight};
`
const Action = styled.button<{ $primary?: boolean }>`
  && {
  flex: 1 1 auto; min-width: 0; font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 11px; font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.02em; text-transform: uppercase; white-space: normal; overflow-wrap: anywhere;
  padding: 7px 8px; cursor: pointer; border-radius: ${({ theme }) => theme.radii.sm};
  border: 2px solid ${({ theme, $primary }) => $primary ? theme.colors.inkPrimary : theme.colors.ruleMid};
  color: ${({ theme, $primary }) => $primary ? theme.colors.white : theme.colors.inkPrimary};
  background: ${({ theme, $primary }) => $primary ? theme.colors.inkPrimary : theme.colors.surfaceBg};
  &:hover:not(:disabled) { border-color: ${({ theme }) => theme.colors.accent}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  }
`
const clock = (m: number) => m === 1440 ? '12:00 AM (end of day)' : `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, '0')} ${m < 720 ? 'AM' : 'PM'}`
const times = Array.from({ length: 97 }, (_, i) => i * 15)
interface Draft { id?: string; category: string; parent: string; title: string; subtask: string; start: number; end: number }
interface Props { uid: string; date: string; categories: string[]; tasks: TaskTree[]; onCreate: (payload: Omit<CreateTaskPayload, 'parentId' | 'childIds' | 'collapsed'> & { initialSubtask?: string }, parentId?: string) => Promise<void>; onUpdate: (task: Task, updates: UpdateTaskPayload) => Promise<void>; onStatusChange: (task: Task, status: Task['status']) => Promise<void> }

export default function DayView({ date, categories, tasks, onCreate, onUpdate, onStatusChange }: Props) {
  const flat = tasks.flatMap(t => [t, ...t.children])
  const scheduled = flat.filter(t => t.startMinute != null && t.endMinute != null)
    .sort((a, b) => a.startMinute! - b.startMinute!)
  const available = flat.filter(t => t.parentId && (t.startMinute == null || t.endMinute == null))
    .sort((a, b) => Number(a.status === 'complete') - Number(b.status === 'complete'))
  const [now, setNow] = useState(() => new Date())
  const elapsed = elapsedMinutesForDate(date, now)
  useEffect(() => {
    const tick = () => setNow(new Date())
    const timer = window.setInterval(tick, 60000)
    window.addEventListener('focus', tick)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', tick) }
  }, [])
  const [draft, setDraft] = useState<Draft | null>(null)
  const busy = false
  const dragging = useRef<{ task: Task; offset: number } | null>(null)
  const [preview, setPreview] = useState<{ start: number; end: number; valid: boolean } | null>(null)
  function clearDrag() { dragging.current = null; setPreview(null) }
  function beginDrag(e: DragEvent<HTMLElement>, task: Task, scheduled = false) {
    if (busy) { e.preventDefault(); return }
    const offset = scheduled ? Math.floor((e.clientY - e.currentTarget.getBoundingClientRect().top) / 24) * 15 : 0
    dragging.current = { task, offset }
    e.dataTransfer.setData('application/x-ledger-task', task.id)
    e.dataTransfer.effectAllowed = 'move'
  }
  function placement(task: Task, start: number) {
    return appointmentPlacement(task, start)
  }

  function dragPlacement(e: DragEvent<HTMLDivElement>) {
    const active = dragging.current
    if (!active || busy) return null
    const minute = Math.floor((e.clientY - e.currentTarget.getBoundingClientRect().top) / 24) * 15
    return placement(active.task, Math.max(0, minute - active.offset))
  }
  const [error, setError] = useState('')
  const scroll = useRef<HTMLDivElement>(null)
  const close = () => { if (!busy) { setDraft(null); setError('') } }
  useEffect(() => { if (scroll.current) scroll.current.scrollTop = 7 * 96 }, [])
  useEffect(() => {
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) setDraft(null) }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [busy])
  // Automatic placement never overlaps another appointment; manual edits may.
  function fittedEnd(start: number, duration = 60, excludeId?: string) {
    const others = scheduled.filter(task => task.id !== excludeId)
    if (others.some(task => task.startMinute! <= start && task.endMinute! > start)) return null
    const nextStart = others.find(task => task.startMinute! > start)?.startMinute ?? 1440
    return Math.min(start + duration, nextStart, 1440)
  }
  function open(start: number, task?: Task) {
    setError('')
    const end = task?.startMinute != null && task.endMinute != null
      ? task.endMinute : fittedEnd(start, 60, task?.id)
    if (end == null) { setError('Choose an empty time to place the appointment. You can adjust its times afterward to overlap.'); return }
    setDraft({ id: task?.id, category: task?.category ?? categories[0] ?? '', parent: task?.parentId ?? '',
      title: task?.title ?? '', subtask: '', start, end })
  }
  async function advanceStatus(task: Task) {
    setError('')
    try {
      await onStatusChange(task, CYCLE[task.status])
    } catch { setError('The status could not be saved. Please try again.') }
  }
  async function dropTask(task: Task, start: number) {
    if (busy) return
    const { end, valid } = placement(task, start)
    if (!valid) { setError('Choose a time that fits within the day.'); return }
    setError('')
    try {
      await onUpdate(task, { startMinute: start, endMinute: end })
    } catch { setError('The appointment could not be moved. Please try again.') }
  }
  async function save(unschedule = false) {
    if (!draft || busy) return
    if (!unschedule && (!draft.category || (!draft.parent && !draft.title.trim()) || draft.end <= draft.start)) {
      setError('Choose a column and task, and an end time after the start.'); return
    }
    const savedDraft = draft
    setError('')
    setDraft(null)
    const schedule = { startMinute: unschedule ? null : savedDraft.start, endMinute: unschedule ? null : savedDraft.end }
    const payload = (title: string) => ({ title, category: savedDraft.category, date,
      status: 'pending' as const, priority: 'medium' as const, dueDate: null })
    try {
      const existing = flat.find(t => t.id === (savedDraft.id || savedDraft.parent))
      if (savedDraft.id || (savedDraft.parent && !savedDraft.subtask.trim())) {
        if (existing) await onUpdate(existing, schedule)
      } else if (savedDraft.parent) {
        await onCreate({ ...payload(savedDraft.subtask.trim()), ...schedule }, savedDraft.parent)
      } else {
        // Creating a parent and its first child is handled as one local operation.
        await onCreate({ ...payload(savedDraft.title.trim()), ...schedule,
          ...(savedDraft.subtask.trim() ? { initialSubtask: savedDraft.subtask.trim() } : {}) })
      }
    } catch { setError('The appointment could not be saved. Please try again.') }
  }
  const previewTask = preview?.valid && dragging.current
    ? { ...dragging.current.task, startMinute: preview.start, endMinute: preview.end } : null
  const positioned = positionAppointments(previewTask
    ? [...scheduled.filter(task => task.id !== previewTask.id), previewTask] : scheduled)
  const previewPosition = previewTask ? positioned.find(entry => entry.task.id === previewTask.id) : null
  return <Layout>
    <Tray><h3>The Task Tray</h3><p>Drag a subtask onto the day, or select one to set its hours.</p>
      {!available.length && <p>No unscheduled subtasks. Add subtasks in List view, or click a time to create an appointment.</p>}
      <TrayList role="region" aria-label="Unscheduled subtasks" tabIndex={0}>
      {available.map(task => <TrayItem key={task.id}><TrayOpen type="button" disabled={busy} draggable={!busy} onDragStart={e => beginDrag(e, task)} onDragEnd={clearDrag}
        onClick={() => open(task.startMinute ?? 9 * 60, task)}>
        <small>{task.category}{task.parentId ? ' · Subtask' : ''}</small>{task.title}
        {task.startMinute != null && <small>{clock(task.startMinute)} · Scheduled</small>}
      </TrayOpen><TrayStatus><StatusBadge status={task.status} onClick={() => void advanceStatus(task)} /></TrayStatus></TrayItem>)}
      </TrayList>
    </Tray>
    <div><h3>The Day’s Appointments</h3><p>Click an empty quarter hour to reserve up to an hour, fitting the available gap. Drag tasks onto any time, including existing appointments; overlapping tasks share the space. Select an appointment to edit.</p>
      {!draft && error && <p role="alert">{error}</p>}
      <Scroll ref={scroll}><Timeline
        onDragOver={e => {
          const next = dragPlacement(e)
          if (!next) return
          e.preventDefault(); e.dataTransfer.dropEffect = next.valid ? 'move' : 'none'
          setPreview(next)
        }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPreview(null) }}
        onDrop={e => {
          e.preventDefault()
          const next = dragPlacement(e)
          const task = dragging.current?.task
          clearDrag()
          if (next && task) void dropTask(task, next.start)
        }}>
        {times.slice(0, -1).map(minute => <Slot type="button" key={minute} $hour={minute % 60 === 0}
          aria-label={`Create task at ${clock(minute)}`} onClick={() => open(minute)}>
          {minute % 60 === 0 && <span>{clock(minute)}</span>}
        </Slot>)}
        {positioned.map(({ task, lane, laneCount }) => <Event key={task.id} draggable={!busy} disabled={busy}
          onDragStart={e => beginDrag(e, task, true)} onDragEnd={clearDrag}
          style={{ opacity: task.id === previewTask?.id ? 0 : 1, pointerEvents: task.id === previewTask?.id ? 'none' : undefined, top: task.startMinute! * 1.6, height: (task.endMinute! - task.startMinute!) * 1.6, left: `${lane * 100 / laneCount}%`, width: `calc(${100 / laneCount}% - 5px)` }}
          onClick={() => open(task.startMinute!, task)} aria-label={`Edit ${task.title}, ${clock(task.startMinute!)} to ${clock(task.endMinute!)}`}>
          {(() => {
            const lines = Math.min(4, Math.max(1, Math.floor((task.endMinute! - task.startMinute!) / 15)))
            const time = `${clock(task.startMinute!)} – ${clock(task.endMinute!)}`
            const parent = tasks.find(t => t.id === task.parentId)?.title
            if (lines === 1) return <span>{time} · <strong>{task.title}</strong> · {task.category}{parent ? ` · ${parent}` : ''}</span>
            if (lines === 2) return <><span>{time}</span><span><strong>{task.title}</strong> · {task.category}{parent ? ` · ${parent}` : ''}</span></>
            return <><span>{time}</span><span><strong>{task.title}</strong></span><span>{task.category}{lines === 3 && parent ? ` · ${parent}` : ''}</span>{lines === 4 && parent && <span>{parent}</span>}</>
          })()}
        </Event>)}
        {preview && <DropPreview $valid={preview.valid} role="status"
          style={{ top: preview.start * 1.6, height: (Math.min(preview.end, 1440) - preview.start) * 1.6,
            left: `${previewPosition ? previewPosition.lane * 100 / previewPosition.laneCount : 0}%`,
            width: `calc(${100 / (previewPosition?.laneCount ?? 1)}% - 5px)` }}>
          {dragging.current?.task.title} · {clock(preview.start)} – {clock(preview.end)}{!preview.valid && ' · Outside day'}
        </DropPreview>}
        {elapsed > 0 && <Elapsed aria-hidden="true" style={{ height: elapsed * 1.6 }} />}
      </Timeline></Scroll>
    </div>
    {draft && <Backdrop onClick={e => { if (e.target === e.currentTarget) close() }}><Editor role="dialog" aria-modal="true" aria-labelledby="appointment-title" onKeyDown={e => {
        if (e.key !== 'Tab') return
        const controls = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled)'))
        const first = controls[0], last = controls[controls.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
      }} onSubmit={e => { e.preventDefault(); void save() }}>
      <h3 id="appointment-title">{draft.id ? 'Edit Appointment' : 'Enter an Appointment'}</h3>
      <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0 }}>
      <label>Column<select autoFocus value={draft.category} disabled={!!draft.id} onChange={e => setDraft({ ...draft, category: e.target.value, parent: '' })}>
        <option value="" disabled>Choose a column</option>{categories.map(c => <option key={c}>{c}</option>)}
      </select></label>
      {draft.id ? <label>Task<input readOnly value={draft.title} /></label> : <>
        <label>Task<select value={draft.parent} onChange={e => setDraft({ ...draft, parent: e.target.value })}>
          <option value="">Create a new task…</option>{tasks.filter(t => t.category === draft.category).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select></label>
        {!draft.parent && <label>New task<input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="Task title" required /></label>}
        <label>Subtask (optional)<input value={draft.subtask} onChange={e => setDraft({ ...draft, subtask: e.target.value })} placeholder="Add a subtask" /></label>
      </>}
      <label>Start time<select value={draft.start} onChange={e => { const start = Number(e.target.value); setDraft({ ...draft, start, end: Math.min(1440, start + (draft.end - draft.start)) }) }}>
        {times.slice(0, -1).map(m => <option key={m} value={m}>{clock(m)}</option>)}
      </select></label>
      <label>End time<select value={draft.end} onChange={e => setDraft({ ...draft, end: Number(e.target.value) })}>
        {times.filter(m => m > draft.start).map(m => <option key={m} value={m}>{clock(m)}</option>)}
      </select></label>
      {error && <p role="alert">{error}</p>}
      <Actions><Action $primary type="submit">{busy ? 'Saving…' : 'Save Appointment'}</Action><Action type="button" onClick={close}>Cancel</Action>
      {draft.id && <Action type="button" onClick={() => void save(true)}>Remove from day</Action>}</Actions>
      </fieldset>
    </Editor></Backdrop>}
  </Layout>
}
