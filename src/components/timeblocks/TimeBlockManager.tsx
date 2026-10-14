import React, { useEffect, useState, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import RuleDivider from '../RuleDivider'
import {
  fetchTimeBlocks, addTimeBlock,
  deleteTimeBlock,
} from '../../firebase/timeBlocks'
import { describeRecurrence } from '../../services/timeBlockService'
import { localDateString } from '../../utils/date'
import type { TimeBlock, CreateTimeBlockPayload, RecurrenceType } from '../../types/timeBlock'

const BLOCK_COLORS = [
  '#7B4F2E', '#3B6E8C', '#5A7A3A', '#8C5A3B',
  '#4A5E8C', '#7A3B5A', '#3B7A6E', '#8C7A3B',
]

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ─── Styled ───────────────────────────────────────────────────────────────────

const slideIn = keyframes`from { transform: translateX(100%) } to { transform: translateX(0) }`

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 900;
`

const Panel = styled.aside`
  position: fixed; top: 0; right: 0; bottom: 0;
  width: 460px; max-width: 100vw;
  background: ${({ theme }) => theme.colors.pageBg};
  border-left: 2px solid ${({ theme }) => theme.colors.ruleHeavy};
  z-index: 901;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.lg};
  animation: ${slideIn} 0.28s ease;
`

const PanelHead = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const PanelTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: ${({ theme }) => theme.fontSizes.subhead};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.06em; text-transform: uppercase;
  color: ${({ theme }) => theme.colors.inkPrimary};
`

const CloseBtn = styled.button`
  background: none; border: none; cursor: pointer;
  font-size: 20px; color: ${({ theme }) => theme.colors.inkMuted};
  &:hover { color: ${({ theme }) => theme.colors.inkPrimary}; }
`

const SectionLabel = styled.h3`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: ${({ theme }) => theme.fontSizes.caption};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.1em; text-transform: uppercase;
  color: ${({ theme }) => theme.colors.inkMuted};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const BlockCard = styled.div<{ $color: string }>`
  border-left: 3px solid ${({ $color }) => $color};
  border-bottom: 1px solid ${({ theme }) => theme.colors.ruleLight};
  padding: ${({ theme }) => theme.spacing.sm};
  display: flex; flex-direction: column; gap: 3px;
`

const BlockRow = styled.div`
  display: flex; align-items: center; justify-content: space-between;
`

const BlockTitle = styled.span`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: ${({ theme }) => theme.fontSizes.body};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.inkPrimary};
`

const BlockMeta = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fontSizes.caption};
  color: ${({ theme }) => theme.colors.inkMuted};
`

const BlockActions = styled.div`
  display: flex; gap: 6px; align-items: center;
`

const SmallBtn = styled.button`
  background: none; border: none; cursor: pointer;
  font-size: 11px; color: ${({ theme }) => theme.colors.inkMuted};
  opacity: 0.6; padding: 0 2px;
  &:hover { opacity: 1; color: ${({ theme }) => theme.colors.inkPrimary}; }
`

const DeleteBtn = styled(SmallBtn)`
  &:hover { color: #A03C28; }
`

const AddBtn = styled.button`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: ${({ theme }) => theme.fontSizes.caption};
  letter-spacing: 0.06em; text-transform: uppercase;
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.ruleMid};
  color: ${({ theme }) => theme.colors.inkPrimary};
  padding: 4px 10px; cursor: pointer; margin-top: 10px;
  &:hover { background: ${({ theme }) => theme.colors.surfaceAlt}; }
`

const Form = styled.div`
  display: flex; flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.ruleMid};
  margin-top: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surfaceBg};
`

const Field = styled.div`
  display: flex; flex-direction: column; gap: 3px;
`

const Label = styled.label`
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size: ${({ theme }) => theme.fontSizes.caption};
  color: ${({ theme }) => theme.colors.inkMuted};
  letter-spacing: 0.06em; text-transform: uppercase;
`

const Input = styled.input`
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size: ${({ theme }) => theme.fontSizes.body};
  color: ${({ theme }) => theme.colors.inkPrimary};
  background: ${({ theme }) => theme.colors.pageBg};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.ruleMid};
  padding: 4px 2px; outline: none;
  &:focus { border-bottom-color: ${({ theme }) => theme.colors.inkPrimary}; }
`

const Select = styled.select`
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size: ${({ theme }) => theme.fontSizes.body};
  color: ${({ theme }) => theme.colors.inkPrimary};
  background: ${({ theme }) => theme.colors.pageBg};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.ruleMid};
  padding: 4px 2px; outline: none; cursor: pointer;
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

const DowRow = styled.div`
  display: flex; gap: 5px; flex-wrap: wrap;
`

const DowBtn = styled.button<{ $active: boolean }>`
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size: 11px;
  padding: 3px 7px;
  border-radius: 2px;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.ruleMid};
  background: ${({ $active, theme }) => $active ? theme.colors.inkPrimary : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.pageBg : theme.colors.inkMuted};
`

const FormActions = styled.div`
  display: flex; gap: ${({ theme }) => theme.spacing.sm}; justify-content: flex-end;
`

const SaveBtn = styled.button`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: ${({ theme }) => theme.fontSizes.caption};
  letter-spacing: 0.06em; text-transform: uppercase;
  background: ${({ theme }) => theme.colors.inkPrimary};
  color: ${({ theme }) => theme.colors.pageBg};
  border: none; padding: 5px 14px; cursor: pointer;
`

const CancelBtn = styled.button`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: ${({ theme }) => theme.fontSizes.caption};
  letter-spacing: 0.06em; text-transform: uppercase;
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.ruleMid};
  color: ${({ theme }) => theme.colors.inkMuted};
  padding: 5px 14px; cursor: pointer;
`

const TimeRow = styled.div`
  display: flex; gap: ${({ theme }) => theme.spacing.sm};
  & > * { flex: 1; }
`

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  uid: string
  onClose: () => void
  onChanged: () => void
}

const EMPTY_FORM = {
  title: '',
  startTime: '08:00',
  endTime: '10:00',
  color: BLOCK_COLORS[0],
  recurrenceType: 'weekly' as RecurrenceType | 'once',
  days: [] as number[],
  dates: '' as string,         // comma-separated ISOs for set_of_days
  dayOfMonth: 1,
  oneOffDate: localDateString(),
  endDate: '',
}

const TimeBlockManager: React.FC<Props> = ({ uid, onClose, onChanged }) => {
  const [blocks, setBlocks] = useState<TimeBlock[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })

  const load = useCallback(async () => {
    setBlocks(await fetchTimeBlocks(uid))
  }, [uid])

  useEffect(() => { load() }, [load])

  const set = <K extends keyof typeof EMPTY_FORM>(k: K, v: typeof EMPTY_FORM[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const toggleDay = (d: number) =>
    set('days', form.days.includes(d) ? form.days.filter(x => x !== d) : [...form.days, d])

  const handleSave = async () => {
    if (!form.title.trim()) return

    let payload: CreateTimeBlockPayload

    if (form.recurrenceType === 'once') {
      payload = {
        title: form.title.trim(),
        startTime: form.startTime,
        endTime: form.endTime,
        color: form.color,
        recurrence: null,
        oneOffDate: form.oneOffDate,
      }
    } else if (form.recurrenceType === 'weekly') {
      payload = {
        title: form.title.trim(),
        startTime: form.startTime,
        endTime: form.endTime,
        color: form.color,
        recurrence: {
          type: 'weekly',
          days: form.days,
          endDate: form.endDate || undefined,
        },
      }
    } else if (form.recurrenceType === 'set_of_days') {
      const dates = form.dates.split(',').map(s => s.trim()).filter(Boolean)
      payload = {
        title: form.title.trim(),
        startTime: form.startTime,
        endTime: form.endTime,
        color: form.color,
        recurrence: { type: 'set_of_days', dates },
      }
    } else {
      // monthly
      payload = {
        title: form.title.trim(),
        startTime: form.startTime,
        endTime: form.endTime,
        color: form.color,
        recurrence: {
          type: 'monthly',
          dayOfMonth: form.dayOfMonth,
          endDate: form.endDate || undefined,
        },
      }
    }

    await addTimeBlock(uid, payload)
    setForm({ ...EMPTY_FORM })
    setShowForm(false)
    await load()
    onChanged()
  }

  const handleDelete = async (b: TimeBlock) => {
    if (!confirm(`Delete "${b.title}"?`)) return
    await deleteTimeBlock(uid, b.id)
    await load()
    onChanged()
  }

  return (
    <>
      <Overlay onClick={onClose} />
      <Panel>
        <PanelHead>
          <PanelTitle>Schedule & Time Blocks</PanelTitle>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </PanelHead>

        <RuleDivider variant="heavy" spacing="sm" />
        <SectionLabel>Defined Blocks</SectionLabel>

        {blocks.length === 0 && (
          <p style={{ fontStyle: 'italic', opacity: 0.55, fontSize: 13 }}>
            No blocks defined yet.
          </p>
        )}

        {blocks.map(b => (
          <BlockCard key={b.id} $color={b.color}>
            <BlockRow>
              <BlockTitle>{b.title}</BlockTitle>
              <BlockActions>
                <BlockMeta>{b.startTime}–{b.endTime}</BlockMeta>
                <DeleteBtn onClick={() => handleDelete(b)}>✕</DeleteBtn>
              </BlockActions>
            </BlockRow>
            <BlockMeta>{describeRecurrence(b)}</BlockMeta>
            {b.exceptions.length > 0 && (
              <BlockMeta style={{ opacity: 0.6 }}>
                Skipped: {b.exceptions.join(', ')}
              </BlockMeta>
            )}
          </BlockCard>
        ))}

        <AddBtn onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ New Block'}
        </AddBtn>

        {showForm && (
          <Form>
            <Field>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="e.g. PowerUp"
                autoFocus
              />
            </Field>

            <TimeRow>
              <Field>
                <Label>Start</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={e => set('startTime', e.target.value)}
                />
              </Field>
              <Field>
                <Label>End</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={e => set('endTime', e.target.value)}
                />
              </Field>
            </TimeRow>

            <Field>
              <Label>Color</Label>
              <ColorRow>
                {BLOCK_COLORS.map(c => (
                  <ColorSwatch
                    key={c} $c={c} $sel={form.color === c}
                    onClick={() => set('color', c)}
                  />
                ))}
              </ColorRow>
            </Field>

            <Field>
              <Label>Recurrence</Label>
              <Select
                value={form.recurrenceType}
                onChange={e => set('recurrenceType', e.target.value as typeof form.recurrenceType)}
              >
                <option value="once">One-off (single date)</option>
                <option value="weekly">Weekly (days of week)</option>
                <option value="set_of_days">Set of specific dates</option>
                <option value="monthly">Monthly (day of month)</option>
              </Select>
            </Field>

            {/* Conditional fields per recurrence type */}
            {form.recurrenceType === 'once' && (
              <Field>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.oneOffDate}
                  onChange={e => set('oneOffDate', e.target.value)}
                />
              </Field>
            )}

            {form.recurrenceType === 'weekly' && (
              <>
                <Field>
                  <Label>Days of week</Label>
                  <DowRow>
                    {DOW_LABELS.map((label, i) => (
                      <DowBtn
                        key={i}
                        $active={form.days.includes(i)}
                        onClick={() => toggleDay(i)}
                      >
                        {label}
                      </DowBtn>
                    ))}
                  </DowRow>
                </Field>
                <Field>
                  <Label>End date (optional)</Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={e => set('endDate', e.target.value)}
                  />
                </Field>
              </>
            )}

            {form.recurrenceType === 'set_of_days' && (
              <Field>
                <Label>Dates (comma-separated YYYY-MM-DD)</Label>
                <Input
                  value={form.dates}
                  onChange={e => set('dates', e.target.value)}
                  placeholder="2026-07-14, 2026-07-21"
                />
              </Field>
            )}

            {form.recurrenceType === 'monthly' && (
              <>
                <Field>
                  <Label>Day of month</Label>
                  <Input
                    type="number" min={1} max={31}
                    value={form.dayOfMonth}
                    onChange={e => set('dayOfMonth', Number(e.target.value))}
                  />
                </Field>
                <Field>
                  <Label>End date (optional)</Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={e => set('endDate', e.target.value)}
                  />
                </Field>
              </>
            )}

            <FormActions>
              <CancelBtn onClick={() => { setShowForm(false); setForm({ ...EMPTY_FORM }) }}>
                Cancel
              </CancelBtn>
              <SaveBtn onClick={handleSave}>Save Block</SaveBtn>
            </FormActions>
          </Form>
        )}
      </Panel>
    </>
  )
}

export default TimeBlockManager