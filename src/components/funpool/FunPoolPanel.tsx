import React, { useEffect, useState, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import RuleDivider from '../RuleDivider'
import {
  fetchFunPool, addFunPoolItem, updateFunPoolItem,
  deleteFunPoolItem, assignFunItemToDate, unassignFunItemFromDate,
} from '../../firebase/funPool'
import { localDateString } from '../../utils/date'
import type { FunPoolItem } from '../../types/funPool'

// ─── Styled ───────────────────────────────────────────────────────────────────

const slideIn = keyframes`from { transform: translateX(100%) } to { transform: translateX(0) }`

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.35); z-index: 900;
`

const Panel = styled.aside`
  position: fixed; top: 0; right: 0; bottom: 0;
  width: 460px; max-width: 100vw;
  background: ${({ theme }) => theme.colors.pageBg};
  border-left: 2px solid ${({ theme }) => theme.colors.ruleHeavy};
  z-index: 901; overflow-y: auto;
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

const ItemCard = styled.div<{ $done: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.colors.ruleLight};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  opacity: ${({ $done }) => $done ? 0.5 : 1};
`

const ItemRow = styled.div`
  display: flex; align-items: flex-start; gap: 8px;
`

const ItemTitle = styled.span<{ $done: boolean }>`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: ${({ theme }) => theme.fontSizes.body};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.inkPrimary};
  text-decoration: ${({ $done }) => $done ? 'line-through' : 'none'};
  flex: 1;
`

const ItemNotes = styled.p`
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size: ${({ theme }) => theme.fontSizes.caption};
  color: ${({ theme }) => theme.colors.inkMuted};
  font-style: italic;
  margin-top: 2px; margin-left: 0;
`

const DateChips = styled.div`
  display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;
`

const Chip = styled.span`
  display: inline-flex; align-items: center; gap: 4px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fontSizes.caption};
  color: ${({ theme }) => theme.colors.inkSecondary};
  border: 1px solid ${({ theme }) => theme.colors.ruleMid};
  padding: 1px 6px; border-radius: 2px;
`

const ChipRemove = styled.button`
  background: none; border: none; cursor: pointer;
  font-size: 10px; color: ${({ theme }) => theme.colors.inkMuted};
  padding: 0; line-height: 1;
  &:hover { color: #A03C28; }
`

const ItemActions = styled.div`
  display: flex; gap: 5px; align-items: center; flex-shrink: 0;
`

const ActionBtn = styled.button`
  background: none; border: none; cursor: pointer;
  font-size: 11px; color: ${({ theme }) => theme.colors.inkMuted};
  opacity: 0.65; padding: 1px 3px;
  &:hover { opacity: 1; color: ${({ theme }) => theme.colors.inkPrimary}; }
`

const DeleteBtn = styled(ActionBtn)`
  &:hover { color: #A03C28; }
`

const AssignRow = styled.div`
  display: flex; gap: 6px; align-items: center; margin-top: 6px;
`

const DateInput = styled.input`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fontSizes.caption};
  color: ${({ theme }) => theme.colors.inkPrimary};
  background: ${({ theme }) => theme.colors.pageBg};
  border: none; border-bottom: 1px solid ${({ theme }) => theme.colors.ruleMid};
  padding: 2px; outline: none;
  &:focus { border-bottom-color: ${({ theme }) => theme.colors.inkPrimary}; }
`

const MiniBtn = styled.button`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: ${({ theme }) => theme.fontSizes.caption};
  letter-spacing: 0.05em; text-transform: uppercase;
  background: ${({ theme }) => theme.colors.inkPrimary};
  color: ${({ theme }) => theme.colors.pageBg};
  border: none; padding: 3px 9px; cursor: pointer;
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

const FieldLabel = styled.label`
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
  border: none; border-bottom: 1px solid ${({ theme }) => theme.colors.ruleMid};
  padding: 4px 2px; outline: none;
  &:focus { border-bottom-color: ${({ theme }) => theme.colors.inkPrimary}; }
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

const Empty = styled.p`
  font-style: italic; opacity: 0.55; font-size: 13px;
`

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  uid: string
  onClose: () => void
  onChanged: () => void
}

const FunPoolPanel: React.FC<Props> = ({ uid, onClose, onChanged }) => {
  const [items, setItems] = useState<FunPoolItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [assignDate, setAssignDate] = useState(localDateString())

  const load = useCallback(async () => {
    setItems(await fetchFunPool(uid))
  }, [uid])

  useEffect(() => { load() }, [load])

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    await addFunPoolItem(uid, { title: newTitle.trim(), notes: newNotes.trim() })
    setNewTitle(''); setNewNotes(''); setShowForm(false)
    await load()
  }

  const handleComplete = async (item: FunPoolItem) => {
    const next = item.status === 'complete' ? 'active' : 'complete'
    await updateFunPoolItem(uid, item.id, { status: next })
    await load()
  }

  const handleDelete = async (item: FunPoolItem) => {
    if (!confirm(`Remove "${item.title}" from the pool?`)) return
    await deleteFunPoolItem(uid, item.id)
    await load()
    onChanged()
  }

  const handleAssign = async (item: FunPoolItem) => {
    await assignFunItemToDate(uid, item.id, assignDate, item.assignedDates)
    setAssigningId(null)
    await load()
    onChanged()
  }

  const handleUnassign = async (item: FunPoolItem, date: string) => {
    await unassignFunItemFromDate(uid, item.id, date, item.assignedDates)
    await load()
    onChanged()
  }

  const active = items.filter(i => i.status === 'active')
  const done = items.filter(i => i.status === 'complete')

  return (
    <>
      <Overlay onClick={onClose} />
      <Panel>
        <PanelHead>
          <PanelTitle>Fun Pool</PanelTitle>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </PanelHead>

        <RuleDivider variant="heavy" spacing="sm" />

        <SectionLabel>Active ({active.length})</SectionLabel>

        {active.length === 0 && <Empty>Pool is empty — add something fun.</Empty>}

        {active.map(item => (
          <ItemCard key={item.id} $done={false}>
            <ItemRow>
              <div style={{ flex: 1 }}>
                <ItemTitle $done={false}>{item.title}</ItemTitle>
                {item.notes && <ItemNotes>{item.notes}</ItemNotes>}
              </div>
              <ItemActions>
                <ActionBtn
                  title="Assign to a date"
                  onClick={() => {
                    setAssigningId(assigningId === item.id ? null : item.id)
                    setAssignDate(localDateString())
                  }}
                >
                  📅
                </ActionBtn>
                <ActionBtn title="Mark complete" onClick={() => handleComplete(item)}>✓</ActionBtn>
                <DeleteBtn title="Remove from pool" onClick={() => handleDelete(item)}>✕</DeleteBtn>
              </ItemActions>
            </ItemRow>

            {assigningId === item.id && (
              <AssignRow>
                <DateInput
                  type="date"
                  value={assignDate}
                  onChange={e => setAssignDate(e.target.value)}
                />
                <MiniBtn onClick={() => handleAssign(item)}>Assign</MiniBtn>
                <ActionBtn onClick={() => setAssigningId(null)}>Cancel</ActionBtn>
              </AssignRow>
            )}

            {item.assignedDates.length > 0 && (
              <DateChips>
                {[...item.assignedDates].sort().map(d => (
                  <Chip key={d}>
                    {d}
                    <ChipRemove onClick={() => handleUnassign(item, d)}>✕</ChipRemove>
                  </Chip>
                ))}
              </DateChips>
            )}
          </ItemCard>
        ))}

        <AddBtn onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ Add to Pool'}
        </AddBtn>

        {showForm && (
          <Form>
            <Field>
              <FieldLabel>Title</FieldLabel>
              <Input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Paint"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </Field>
            <Field>
              <FieldLabel>Notes (optional)</FieldLabel>
              <Input
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                placeholder="any details"
              />
            </Field>
            <FormActions>
              <CancelBtn onClick={() => setShowForm(false)}>Cancel</CancelBtn>
              <SaveBtn onClick={handleAdd}>Add</SaveBtn>
            </FormActions>
          </Form>
        )}

        {done.length > 0 && (
          <>
            <RuleDivider variant="light" spacing="md" />
            <SectionLabel>Completed ({done.length})</SectionLabel>
            {done.map(item => (
              <ItemCard key={item.id} $done>
                <ItemRow>
                  <ItemTitle $done>{item.title}</ItemTitle>
                  <ItemActions>
                    <ActionBtn title="Reactivate" onClick={() => handleComplete(item)}>↩</ActionBtn>
                    <DeleteBtn title="Remove" onClick={() => handleDelete(item)}>✕</DeleteBtn>
                  </ItemActions>
                </ItemRow>
              </ItemCard>
            ))}
          </>
        )}
      </Panel>
    </>
  )
}

export default FunPoolPanel