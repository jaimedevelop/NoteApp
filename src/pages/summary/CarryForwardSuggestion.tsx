import React, { useState } from 'react'
import styled from 'styled-components'
import type { Task } from '../../types/task'
import { carryTaskForward } from '../../services/taskService'

interface CarryForwardSuggestionProps {
    uid: string
    candidates: Task[]       // unfinished tasks from the previous day
    toDate: string       // today's ISO date
    onCarried: () => void   // callback to refresh today's task list
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const Panel = styled.div`
  border:           1px dashed ${({ theme }) => theme.colors.ruleMid};
  background-color: ${({ theme }) => theme.colors.surfaceBg};
  padding:          ${({ theme }) => theme.spacing.md};
`

const PanelHead = styled.div`
  display:       flex;
  align-items:   baseline;
  gap:           ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const PanelTitle = styled.span`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.inkSecondary};
`

const SubNote = styled.span`
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size:   ${({ theme }) => theme.fontSizes.caption};
  font-style:  italic;
  color:       ${({ theme }) => theme.colors.inkMuted};
`

const List = styled.ul`
  list-style: none;
  display:    flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const Row = styled.li`
  display:     flex;
  align-items: center;
  gap:         ${({ theme }) => theme.spacing.sm};
`

const Checkbox = styled.input`
  accent-color: ${({ theme }) => theme.colors.accent};
  width: 15px;
  height: 15px;
  cursor: pointer;
`

const TaskLabel = styled.label`
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size:   ${({ theme }) => theme.fontSizes.body};
  color:       ${({ theme }) => theme.colors.inkPrimary};
  cursor:      pointer;
  flex: 1;
`

const Actions = styled.div`
  display: flex;
  gap:     ${({ theme }) => theme.spacing.sm};
`

const CarryBtn = styled.button`
  font-family:    ${({ theme }) => theme.fonts.serif};
  font-size:      ${({ theme }) => theme.fontSizes.caption};
  font-weight:    ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color:          ${({ theme }) => theme.colors.white};
  background:     ${({ theme }) => theme.colors.inkPrimary};
  border:         2px solid ${({ theme }) => theme.colors.inkPrimary};
  padding:        ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  border-radius:  ${({ theme }) => theme.radii.sm};
  transition:     background ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accent};
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:disabled { opacity: 0.4; cursor: not-allowed; }
`

const DismissBtn = styled(CarryBtn)`
  color:      ${({ theme }) => theme.colors.inkSecondary};
  background: transparent;

  &:hover:not(:disabled) {
    background:   ${({ theme }) => theme.colors.surfaceAlt};
    border-color: ${({ theme }) => theme.colors.ruleMid};
    color:        ${({ theme }) => theme.colors.inkPrimary};
  }
`

// ─── Component ────────────────────────────────────────────────────────────────

const CarryForwardSuggestion: React.FC<CarryForwardSuggestionProps> = ({
    uid, candidates, toDate, onCarried,
}) => {
    const [selected, setSelected] = useState<Set<string>>(
        new Set(candidates.map(t => t.id))  // all pre-selected by default
    )
    const [dismissed, setDismissed] = useState(false)
    const [loading, setLoading] = useState(false)

    if (dismissed || candidates.length === 0) return null

    const toggle = (id: string) =>
        setSelected(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })

    const handleCarry = async () => {
        setLoading(true)
        const toCarry = candidates.filter(t => selected.has(t.id))
        await Promise.all(toCarry.map(t => carryTaskForward(uid, t, toDate)))
        setLoading(false)
        setDismissed(true)
        onCarried()
    }

    return (
        <Panel>
            <PanelHead>
                <PanelTitle>Unfinished Business</PanelTitle>
                <SubNote>— carry yesterday's remaining tasks forward?</SubNote>
            </PanelHead>

            <List>
                {candidates.map(task => (
                    <Row key={task.id}>
                        <Checkbox
                            type="checkbox"
                            id={`carry-${task.id}`}
                            checked={selected.has(task.id)}
                            onChange={() => toggle(task.id)}
                        />
                        <TaskLabel htmlFor={`carry-${task.id}`}>{task.title}</TaskLabel>
                    </Row>
                ))}
            </List>

            <Actions>
                <CarryBtn
                    onClick={handleCarry}
                    disabled={loading || selected.size === 0}
                >
                    {loading ? 'Carrying…' : `Carry ${selected.size} forward`}
                </CarryBtn>
                <DismissBtn onClick={() => setDismissed(true)}>
                    Dismiss
                </DismissBtn>
            </Actions>
        </Panel>
    )
}

export default CarryForwardSuggestion