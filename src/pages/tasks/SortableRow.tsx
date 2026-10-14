import React, { useState } from 'react'
import styled from 'styled-components'

export interface ReorderProps {
    onReorder: (sourceId: string, targetId: string, after: boolean) => void
    reorderDisabled: boolean
}

const Row = styled.li<{ $over: boolean; $subtask: boolean }>`
    display: flex;
    align-items: flex-start;
    border-bottom: 1px solid ${({ theme, $subtask }) => $subtask ? theme.colors.ruleLight : theme.colors.ruleMid};
    &:last-child { border-bottom: none; }
    border-top: 2px solid ${({ theme, $over }) => $over ? theme.colors.accent : 'transparent'};
`
const Grip = styled.button`
    flex-shrink: 0;
    padding: 8px 4px;
    color: ${({ theme }) => theme.colors.inkMuted};
    cursor: grab;
    &:active { cursor: grabbing; }
    &:focus-visible { outline: 1px solid currentColor; }
    &:disabled { opacity: 0.3; cursor: default; }
`

const SortableRow: React.FC<ReorderProps & {
    id: string
    title: string
    subtask?: boolean
    previousId?: string
    nextId?: string
    children: React.ReactNode
}> = ({ id, title, subtask = false, previousId, nextId, onReorder, reorderDisabled, children }) => {
    const [over, setOver] = useState(false)
    const disabled = reorderDisabled || id.startsWith('temp_')
    return <Row $over={over} $subtask={subtask}
        onDragOver={e => {
            e.stopPropagation()
            if (disabled || !e.dataTransfer.types.includes('application/x-ledger-task')) return
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
            setOver(true)
        }}
        onDragLeave={e => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false)
        }}
        onDrop={e => {
            e.stopPropagation()
            setOver(false)
            if (disabled) return
            const source = e.dataTransfer.getData('application/x-ledger-task')
            if (!source) return
            e.preventDefault()
            const rect = e.currentTarget.getBoundingClientRect()
            onReorder(source, id, e.clientY > rect.top + rect.height / 2)
        }}>
        <Grip type="button" draggable={!disabled} disabled={disabled}
            aria-label={`Reorder ${title}`} title="Drag to reorder. Use arrow keys to move up or down."
            onDragStart={e => {
                e.stopPropagation()
                e.dataTransfer.setData('application/x-ledger-task', id)
                e.dataTransfer.effectAllowed = 'move'
            }}
            onDragEnd={() => setOver(false)}
            onKeyDown={e => {
                const target = e.key === 'ArrowUp' ? previousId : e.key === 'ArrowDown' ? nextId : undefined
                if (target) {
                    e.preventDefault()
                    onReorder(id, target, e.key === 'ArrowDown')
                }
            }}>⠿</Grip>
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </Row>
}

export default SortableRow
