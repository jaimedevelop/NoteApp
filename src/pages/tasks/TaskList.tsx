import SortableRow, { type ReorderProps } from './SortableRow'
import React from 'react'
import styled from 'styled-components'
import type { TaskTree, UpdateTaskPayload, CreateTaskPayload } from '../../types/task'
import TaskItem from './TaskItem'

interface TaskListProps extends ReorderProps {
    tasks: TaskTree[]
    uid: string
    date: string
    onUpdate: (taskId: string, updates: UpdateTaskPayload) => void
    onDelete: (taskId: string) => void
    onCreate: (payload: Omit<CreateTaskPayload, 'parentId' | 'childIds' | 'collapsed'>, parentId?: string) => Promise<void>
    onPromote: (task: TaskTree) => void
    todayCategories: string[]
    onCopyToToday: (task: TaskTree, category: string) => Promise<void>
}

const List = styled.ul`
  list-style: none;
`

const Empty = styled.p`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style:  italic;
  color:       ${({ theme }) => theme.colors.inkMuted};
  font-size:   ${({ theme }) => theme.fontSizes.body};
  padding:     ${({ theme }) => theme.spacing.md} 0;
`

const TaskList: React.FC<TaskListProps> = ({
    tasks, uid, date, onUpdate, onDelete, onCreate, onPromote,
    todayCategories, onCopyToToday, onReorder, reorderDisabled,
}) => {
    if (tasks.length === 0) {
        return <Empty>No dispatches filed for this column yet.</Empty>
    }

    return (
        <List>
            {tasks.map((task, index) => (
                <SortableRow key={task.id} id={task.id} title={task.title}
                    previousId={tasks[index - 1]?.id} nextId={tasks[index + 1]?.id}
                    onReorder={onReorder} reorderDisabled={reorderDisabled}>
                <TaskItem
                    key={task.id}
                    task={task}
                    onReorder={onReorder}
                    reorderDisabled={reorderDisabled}
                    uid={uid}
                    date={date}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onCreate={onCreate}
                    onPromote={onPromote}
                    todayCategories={todayCategories}
                    onCopyToToday={onCopyToToday}
                />
                </SortableRow>
            ))}
        </List>
    )
}

export default TaskList