import React, { useEffect, useState, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import RuleDivider from '../../components/RuleDivider'
import {
    fetchProjects, fetchMilestones,
    addProject, updateProject, deleteProject,
    addMilestone, updateMilestone, deleteMilestone,
    addBlockedDay, deleteBlockedDay,
} from '../../firebase/projects'
import { getRunwayHealth, buildBackwardsplan, type RunwayHealth, type PlannedPhase } from '../../services/projectService'
import { fetchAllTasks } from '../../firebase/database'
import { localDateString } from '../../utils/date'
import type { Project, Milestone, BlockedDay } from '../../types/project'
import { expandBlockedDays } from '../../utils/blockedDays'

// ─── Project color palette ────────────────────────────────────────────────────

const PALETTE = [
    '#7B4F2E', '#3B6E8C', '#5A7A3A', '#8C5A3B',
    '#4A5E8C', '#7A3B5A', '#3B7A6E', '#8C7A3B',
]

// ─── Styled ───────────────────────────────────────────────────────────────────

const slideIn = keyframes`from { transform: translateX(100%) } to { transform: translateX(0) }`

const Overlay = styled.div`
  position: fixed;
  inset:    0;
  background: rgba(0,0,0,0.35);
  z-index:  900;
`

const Panel = styled.aside`
  position:   fixed;
  top:        0;
  right:      0;
  bottom:     0;
  width:      480px;
  max-width:  100vw;
  background: ${({ theme }) => theme.colors.pageBg};
  border-left: 2px solid ${({ theme }) => theme.colors.ruleHeavy};
  z-index:    901;
  overflow-y: auto;
  padding:    ${({ theme }) => theme.spacing.lg};
  animation:  ${slideIn} 0.28s ease;
`

const PanelHead = styled.div`
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  margin-bottom:   ${({ theme }) => theme.spacing.md};
`

const PanelTitle = styled.h2`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.subhead};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.inkPrimary};
`

const CloseBtn = styled.button`
  background: none; border: none; cursor: pointer;
  font-size: 20px; color: ${({ theme }) => theme.colors.inkMuted};
  &:hover { color: ${({ theme }) => theme.colors.inkPrimary}; }
`

const SectionLabel = styled.h3`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.inkMuted};
  margin-bottom:  ${({ theme }) => theme.spacing.sm};
`

const ProjectCard = styled.div<{ $color: string; $expanded: boolean }>`
  border-left:    3px solid ${({ $color }) => $color};
  border-bottom:  1px solid ${({ theme }) => theme.colors.ruleLight};
  padding:        ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.sm};
  cursor:         pointer;
  background:     ${({ theme, $expanded }) => $expanded ? theme.colors.surfaceAlt : 'transparent'};
  &:hover { background: ${({ theme }) => theme.colors.surfaceAlt}; }
`

const ProjectRow = styled.div`
  display:         flex;
  align-items:     center;
  justify-content: space-between;
`

const ProjectName = styled.span`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size:   ${({ theme }) => theme.fontSizes.body};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color:       ${({ theme }) => theme.colors.inkPrimary};
`

const DeadlineTag = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
  color:       ${({ theme }) => theme.colors.inkMuted};
`

const RunwayBar = styled.div<{ $pct: number; $slack: number }>`
  height:         6px;
  background:     ${({ theme }) => theme.colors.ruleLight};
  border-radius:  3px;
  margin-top:     6px;
  overflow:       hidden;
  &::after {
    content:       '';
    display:       block;
    height:        100%;
    width:         ${({ $pct }) => $pct}%;
    border-radius: 3px;
    background:    ${({ $slack }) =>
        $slack >= 10 ? '#5A7A3A' : $slack >= 0 ? '#D4880A' : '#A03C28'};
    transition:    width 0.3s ease;
  }
`

const SlackNote = styled.p<{ $slack: number }>`
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
  color:       ${({ $slack }) => $slack >= 10 ? '#5A7A3A' : $slack >= 0 ? '#D4880A' : '#A03C28'};
  margin-top:  4px;
`

const MilestoneList = styled.ul`
  list-style: none;
  margin-top: ${({ theme }) => theme.spacing.sm};
`

const MilestoneItem = styled.li`
  display:         flex;
  align-items:     center;
  gap:             ${({ theme }) => theme.spacing.xs};
  padding:         3px 0;
  font-family:     ${({ theme }) => theme.fonts.sansSerif};
  font-size:       ${({ theme }) => theme.fontSizes.caption};
  color:           ${({ theme }) => theme.colors.inkSecondary};
  border-bottom:   1px solid ${({ theme }) => theme.colors.ruleLight};
  &:last-child { border-bottom: none; }
`

const StatusDot = styled.span<{ $status: string }>`
  width:  7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  background: ${({ $status }) =>
        $status === 'reached' ? '#5A7A3A' : $status === 'missed' ? '#A03C28' : '#888'};
`

const AddBtn = styled.button`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background:     none;
  border:         1px solid ${({ theme }) => theme.colors.ruleMid};
  color:          ${({ theme }) => theme.colors.inkPrimary};
  padding:        4px 10px;
  cursor:         pointer;
  &:hover { background: ${({ theme }) => theme.colors.surfaceAlt}; }
`

const DeleteBtn = styled.button`
  background: none; border: none; cursor: pointer;
  font-size: 12px; color: ${({ theme }) => theme.colors.inkMuted};
  opacity: 0.6;
  &:hover { opacity: 1; color: #A03C28; }
`

const Form = styled.div`
  display:        flex;
  flex-direction: column;
  gap:            ${({ theme }) => theme.spacing.sm};
  padding:        ${({ theme }) => theme.spacing.sm};
  border:         1px solid ${({ theme }) => theme.colors.ruleMid};
  margin-top:     ${({ theme }) => theme.spacing.sm};
  background:     ${({ theme }) => theme.colors.surfaceBg};
`

const Field = styled.div`
  display:        flex;
  flex-direction: column;
  gap:            3px;
`

const Label = styled.label`
  font-family:  ${({ theme }) => theme.fonts.sansSerif};
  font-size:    ${({ theme }) => theme.fontSizes.caption};
  color:        ${({ theme }) => theme.colors.inkMuted};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

const Input = styled.input`
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size:   ${({ theme }) => theme.fontSizes.body};
  color:       ${({ theme }) => theme.colors.inkPrimary};
  background:  ${({ theme }) => theme.colors.pageBg};
  border:      none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.ruleMid};
  padding:     4px 2px;
  outline:     none;
  &:focus { border-bottom-color: ${({ theme }) => theme.colors.inkPrimary}; }
`

const ColorRow = styled.div`
  display: flex; gap: 6px; flex-wrap: wrap;
`

const ColorSwatch = styled.button<{ $c: string; $sel: boolean }>`
  width: 20px; height: 20px; border-radius: 3px;
  background: ${({ $c }) => $c};
  border: ${({ $sel }) => $sel ? '2px solid #000' : '2px solid transparent'};
  cursor: pointer;
`

const FormActions = styled.div`
  display: flex; gap: ${({ theme }) => theme.spacing.sm}; justify-content: flex-end;
`

const SaveBtn = styled.button`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background:     ${({ theme }) => theme.colors.inkPrimary};
  color:          ${({ theme }) => theme.colors.pageBg};
  border:         none;
  padding:        5px 14px;
  cursor:         pointer;
`

const CancelBtn = styled.button`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background:     none;
  border:         1px solid ${({ theme }) => theme.colors.ruleMid};
  color:          ${({ theme }) => theme.colors.inkMuted};
  padding:        5px 14px;
  cursor:         pointer;
`

const PlanPhase = styled.div`
  padding:     4px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.ruleLight};
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
  color:       ${({ theme }) => theme.colors.inkSecondary};
  &:last-child { border-bottom: none; }
`

const BlockedGrid = styled.div`
  display: flex; flex-wrap: wrap; gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.sm};
`

const BlockedChip = styled.span`
  display:      inline-flex;
  align-items:  center;
  gap:          4px;
  font-family:  ${({ theme }) => theme.fonts.mono};
  font-size:    ${({ theme }) => theme.fontSizes.caption};
  color:        ${({ theme }) => theme.colors.inkSecondary};
  border:       1px solid ${({ theme }) => theme.colors.ruleMid};
  padding:      2px 7px;
  border-radius: 2px;
`
// ─── Backwards Plan Modal ─────────────────────────────────────────────────────

interface BackwardsPlanProps {
    project: Project
    blockedDays: BlockedDay[]
    onClose: () => void
}

const BackwardsPlanModal: React.FC<BackwardsPlanProps> = ({ project, blockedDays, onClose }) => {
    const [phasesRaw, setPhasesRaw] = useState('Discovery, Design, Build, Testing, Launch')
    const [buffer, setBuffer] = useState(7)
    const [plan, setPlan] = useState<PlannedPhase[]>([])

    const generate = () => {
        const phases = phasesRaw.split(',').map(s => s.trim()).filter(Boolean)
        const result = buildBackwardsplan(project.deadline, buffer, phases, blockedDays)
        setPlan(result)
    }

    return (
        <Form>
            <SectionLabel>Backwards Plan — {project.title}</SectionLabel>
            <Field>
                <Label>Phases (comma-separated)</Label>
                <Input value={phasesRaw} onChange={e => setPhasesRaw(e.target.value)} />
            </Field>
            <Field>
                <Label>Buffer days before deadline</Label>
                <Input type="number" min={0} max={30} value={buffer}
                    onChange={e => setBuffer(Number(e.target.value))} />
            </Field>
            <FormActions>
                <CancelBtn onClick={onClose}>Close</CancelBtn>
                <SaveBtn onClick={generate}>Generate</SaveBtn>
            </FormActions>
            {plan.length > 0 && (
                <div>
                    {plan.map(ph => (
                        <PlanPhase key={ph.title}>
                            <strong>{ph.title}</strong>{' '}
                            {ph.startDate} → {ph.endDate}{' '}
                            <span style={{ opacity: 0.6 }}>({ph.daysAvail} working days)</span>
                        </PlanPhase>
                    ))}
                </div>
            )}
        </Form>
    )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface Props {
    uid: string
    onClose: () => void
    onChanged: () => void
    blockedDays: BlockedDay[]
}

interface ProjectState {
    project: Project
    milestones: Milestone[]
    health?: RunwayHealth
}

const ProjectPanel: React.FC<Props> = ({ uid, onClose, onChanged, blockedDays }) => {
    const [items, setItems] = useState<ProjectState[]>([])
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [planProjectId, setPlanProjectId] = useState<string | null>(null)
    const [showNewProject, setShowNewProject] = useState(false)
    const [showNewBlocked, setShowNewBlocked] = useState(false)
    const [localBlocked, setLocalBlocked] = useState<BlockedDay[]>(blockedDays)

    // New project form state
    const [np_title, setNpTitle] = useState('')
    const [np_desc, setNpDesc] = useState('')
    const [np_start, setNpStart] = useState(localDateString())
    const [np_deadline, setNpDeadline] = useState('')
    const [np_color, setNpColor] = useState(PALETTE[0])
    const [np_status, setNpStatus] = useState<'active'>('active')

    // New milestone form state (keyed to expanded project)
    const [showMilestoneForm, setShowMilestoneForm] = useState(false)
    const [nm_title, setNmTitle] = useState('')
    const [nm_date, setNmDate] = useState('')
    const [nm_desc, setNmDesc] = useState('')

    // New blocked day form
    const [nb_mode, setNbMode] = useState<'single' | 'range'>('single')
    const [nb_start, setNbStart] = useState('')
    const [nb_end, setNbEnd] = useState('')
    const [nb_label, setNbLabel] = useState('')

    const load = useCallback(async () => {
        const [projects, tasks] = await Promise.all([
            fetchProjects(uid),
            fetchAllTasks(uid),
        ])
        const states = await Promise.all(projects.map(async p => {
            const milestones = await fetchMilestones(uid, p.id)
            const health = getRunwayHealth(p, tasks, localBlocked)
            return { project: p, milestones, health }
        }))
        setItems(states)
    }, [uid, localBlocked])

    useEffect(() => { load() }, [load])

    // ── Project CRUD ──────────────────────────────────────────────────────────

    const handleAddProject = async () => {
        if (!np_title.trim() || !np_deadline) return
        await addProject(uid, {
            title: np_title.trim(),
            description: np_desc.trim(),
            status: 'active',
            color: np_color,
            startDate: np_start,
            deadline: np_deadline,
        })
        setShowNewProject(false)
        setNpTitle(''); setNpDesc(''); setNpDeadline('')
        await load(); onChanged()
    }

    const handleDeleteProject = async (pid: string) => {
        if (!confirm('Delete this project and all its milestones?')) return
        await deleteProject(uid, pid)
        await load(); onChanged()
    }

    const handleToggleStatus = async (p: Project) => {
        const next = p.status === 'active' ? 'paused' : p.status === 'paused' ? 'complete' : 'active'
        await updateProject(uid, p.id, { status: next })
        await load(); onChanged()
    }

    // ── Milestone CRUD ────────────────────────────────────────────────────────

    const handleAddMilestone = async (pid: string) => {
        if (!nm_title.trim() || !nm_date) return
        await addMilestone(uid, pid, {
            projectId: pid,
            title: nm_title.trim(),
            date: nm_date,
            description: nm_desc.trim(),
            status: 'pending',
        })
        setShowMilestoneForm(false)
        setNmTitle(''); setNmDate(''); setNmDesc('')
        await load(); onChanged()
    }

    const handleToggleMilestone = async (pid: string, m: Milestone) => {
        const next = m.status === 'pending' ? 'reached' : m.status === 'reached' ? 'missed' : 'pending'
        await updateMilestone(uid, pid, m.id, { status: next })
        await load(); onChanged()
    }

    const handleDeleteMilestone = async (pid: string, mid: string) => {
        await deleteMilestone(uid, pid, mid)
        await load(); onChanged()
    }

    // ── Blocked Days ──────────────────────────────────────────────────────────

    const handleAddBlocked = async () => {
        if (!nb_start) return
        const end = nb_mode === 'range' && nb_end >= nb_start ? nb_end : nb_start
        const id = await addBlockedDay(uid, nb_start, end, nb_label || 'Blocked')
        const entry: BlockedDay = { id, startDate: nb_start, endDate: end, label: nb_label || 'Blocked' }
        setLocalBlocked(prev => [...prev, entry])
        setShowNewBlocked(false)
        setNbStart(''); setNbEnd(''); setNbLabel(''); setNbMode('single')
        onChanged()
    }

    const handleDeleteBlocked = async (bid: string) => {
        await deleteBlockedDay(uid, bid)
        setLocalBlocked(prev => prev.filter(b => b.id !== bid))
        onChanged()
    }

    return (
        <>
            <Overlay onClick={onClose} />
            <Panel>
                <PanelHead>
                    <PanelTitle>Projects & Planning</PanelTitle>
                    <CloseBtn onClick={onClose}>✕</CloseBtn>
                </PanelHead>

                <RuleDivider variant="heavy" spacing="sm" />

                {/* ── Projects ─────────────────────────────────────────────── */}
                <SectionLabel>Active Projects</SectionLabel>

                {items.map(({ project: p, milestones, health }) => {
                    const expanded = expandedId === p.id
                    const planOpen = planProjectId === p.id
                    return (
                        <ProjectCard
                            key={p.id}
                            $color={p.color}
                            $expanded={expanded}
                            onClick={() => setExpandedId(expanded ? null : p.id)}
                        >
                            <ProjectRow>
                                <ProjectName>{p.title}</ProjectName>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <DeadlineTag>{p.deadline}</DeadlineTag>
                                    <DeleteBtn onClick={e => { e.stopPropagation(); handleDeleteProject(p.id) }}>✕</DeleteBtn>
                                </div>
                            </ProjectRow>

                            {health && (
                                <>
                                    <RunwayBar $pct={health.completionPct} $slack={health.scheduleSlack} />
                                    <SlackNote $slack={health.scheduleSlack}>
                                        {health.completionPct}% done ·{' '}
                                        {health.isOverdue ? 'OVERDUE' : `${health.workingDaysLeft} working days left`}
                                        {health.scheduleSlack < 0
                                            ? ` · ${Math.abs(health.scheduleSlack)}pts behind`
                                            : health.scheduleSlack > 10
                                                ? ' · On track'
                                                : ' · Watch pace'}
                                    </SlackNote>
                                </>
                            )}

                            {expanded && (
                                <div onClick={e => e.stopPropagation()} style={{ marginTop: 8 }}>
                                    {/* Status toggle */}
                                    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                                        <AddBtn onClick={() => handleToggleStatus(p)}>
                                            {p.status === 'active' ? 'Pause' : p.status === 'paused' ? 'Mark Complete' : 'Reactivate'}
                                        </AddBtn>
                                        <AddBtn onClick={() => setPlanProjectId(planOpen ? null : p.id)}>
                                            ← Backwards Plan
                                        </AddBtn>
                                    </div>

                                    {planOpen && (
                                        <BackwardsPlanModal
                                            project={p}
                                            blockedDays={localBlocked}
                                            onClose={() => setPlanProjectId(null)}
                                        />
                                    )}

                                    {/* Milestones */}
                                    <SectionLabel>Milestones</SectionLabel>
                                    {milestones.length === 0
                                        ? <p style={{ fontSize: 12, opacity: 0.6, fontStyle: 'italic' }}>No milestones yet.</p>
                                        : (
                                            <MilestoneList>
                                                {milestones.map(m => (
                                                    <MilestoneItem key={m.id}>
                                                        <StatusDot
                                                            $status={m.status}
                                                            title="Click to cycle status"
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => handleToggleMilestone(p.id, m)}
                                                        />
                                                        <span style={{ flex: 1 }}>{m.title}</span>
                                                        <span style={{ opacity: 0.5 }}>{m.date}</span>
                                                        <DeleteBtn onClick={() => handleDeleteMilestone(p.id, m.id)}>✕</DeleteBtn>
                                                    </MilestoneItem>
                                                ))}
                                            </MilestoneList>
                                        )
                                    }

                                    {showMilestoneForm
                                        ? (
                                            <Form>
                                                <Field>
                                                    <Label>Milestone title</Label>
                                                    <Input value={nm_title} onChange={e => setNmTitle(e.target.value)} autoFocus />
                                                </Field>
                                                <Field>
                                                    <Label>Target date</Label>
                                                    <Input type="date" value={nm_date} onChange={e => setNmDate(e.target.value)} />
                                                </Field>
                                                <Field>
                                                    <Label>Notes (optional)</Label>
                                                    <Input value={nm_desc} onChange={e => setNmDesc(e.target.value)} />
                                                </Field>
                                                <FormActions>
                                                    <CancelBtn onClick={() => setShowMilestoneForm(false)}>Cancel</CancelBtn>
                                                    <SaveBtn onClick={() => handleAddMilestone(p.id)}>Add</SaveBtn>
                                                </FormActions>
                                            </Form>
                                        )
                                        : <AddBtn style={{ marginTop: 6 }} onClick={() => setShowMilestoneForm(true)}>+ Milestone</AddBtn>
                                    }
                                </div>
                            )}
                        </ProjectCard>
                    )
                })}

                <AddBtn style={{ marginTop: 12 }} onClick={() => setShowNewProject(v => !v)}>
                    {showNewProject ? 'Cancel' : '+ New Project'}
                </AddBtn>

                {showNewProject && (
                    <Form>
                        <Field>
                            <Label>Title</Label>
                            <Input value={np_title} onChange={e => setNpTitle(e.target.value)} autoFocus />
                        </Field>
                        <Field>
                            <Label>Description</Label>
                            <Input value={np_desc} onChange={e => setNpDesc(e.target.value)} />
                        </Field>
                        <Field>
                            <Label>Start date</Label>
                            <Input type="date" value={np_start} onChange={e => setNpStart(e.target.value)} />
                        </Field>
                        <Field>
                            <Label>Deadline</Label>
                            <Input type="date" value={np_deadline} onChange={e => setNpDeadline(e.target.value)} />
                        </Field>
                        <Field>
                            <Label>Color</Label>
                            <ColorRow>
                                {PALETTE.map(c => (
                                    <ColorSwatch key={c} $c={c} $sel={np_color === c}
                                        onClick={() => setNpColor(c)} />
                                ))}
                            </ColorRow>
                        </Field>
                        <FormActions>
                            <CancelBtn onClick={() => setShowNewProject(false)}>Cancel</CancelBtn>
                            <SaveBtn onClick={handleAddProject}>Create Project</SaveBtn>
                        </FormActions>
                    </Form>
                )}

                <RuleDivider variant="light" spacing="md" />

                {/* ── Blocked Days ──────────────────────────────────────────── */}
                <SectionLabel>Blocked Days</SectionLabel>
                <BlockedGrid>
                    {localBlocked
                        .sort((a, b) => a.startDate.localeCompare(b.startDate))
                        .map(b => (
                            <BlockedChip key={b.id}>
                                {b.startDate === b.endDate
                                    ? b.startDate
                                    : `${b.startDate} → ${b.endDate}`
                                }
                                {' · '}{b.label}
                                <DeleteBtn onClick={() => handleDeleteBlocked(b.id)}>✕</DeleteBtn>
                            </BlockedChip>
                        ))
                    }
                </BlockedGrid>

                <AddBtn style={{ marginTop: 10 }} onClick={() => setShowNewBlocked(v => !v)}>
                    {showNewBlocked ? 'Cancel' : '+ Block a Day'}
                </AddBtn>

                {showNewBlocked && (
                    <Form>
                        {/* Single / Range toggle */}
                        <Field>
                            <Label>Type</Label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <AddBtn
                                    style={{ opacity: nb_mode === 'single' ? 1 : 0.45 }}
                                    onClick={() => setNbMode('single')}
                                >
                                    Single Day
                                </AddBtn>
                                <AddBtn
                                    style={{ opacity: nb_mode === 'range' ? 1 : 0.45 }}
                                    onClick={() => setNbMode('range')}
                                >
                                    Date Range
                                </AddBtn>
                            </div>
                        </Field>

                        <Field>
                            <Label>{nb_mode === 'range' ? 'Start date' : 'Date'}</Label>
                            <Input
                                type="date"
                                value={nb_start}
                                onChange={e => {
                                    setNbStart(e.target.value)
                                    // keep end ≥ start when in range mode
                                    if (nb_mode === 'range' && nb_end && nb_end < e.target.value)
                                        setNbEnd(e.target.value)
                                }}
                                autoFocus
                            />
                        </Field>

                        {nb_mode === 'range' && (
                            <Field>
                                <Label>End date</Label>
                                <Input
                                    type="date"
                                    value={nb_end}
                                    min={nb_start || undefined}
                                    onChange={e => setNbEnd(e.target.value)}
                                />
                            </Field>
                        )}

                        <Field>
                            <Label>Label (e.g. Vacation)</Label>
                            <Input value={nb_label} onChange={e => setNbLabel(e.target.value)} />
                        </Field>

                        <FormActions>
                            <CancelBtn onClick={() => setShowNewBlocked(false)}>Cancel</CancelBtn>
                            <SaveBtn onClick={handleAddBlocked}>Block</SaveBtn>
                        </FormActions>
                    </Form>
                )}
            </Panel>
        </>
    )
}

export default ProjectPanel